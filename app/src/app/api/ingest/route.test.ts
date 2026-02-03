import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';
import { POST } from './route';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

// Mock Clerk auth - use literal value since vi.mock is hoisted
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn().mockResolvedValue({ userId: 'user_test123' }),
}));

// Mock Anthropic extraction functions
vi.mock('@/lib/anthropic', () => ({
  extractFromNote: vi.fn().mockResolvedValue({
    contactName: 'Alice',
    interactionSummary: 'Had coffee together',
  }),
  extractFromImage: vi.fn().mockResolvedValue({
    contactName: 'Alice',
    interactionSummary: 'Photo from dinner',
  }),
}));

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    contact: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    preference: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    familyMember: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    seedling: {
      create: vi.fn(),
    },
    interaction: {
      create: vi.fn(),
    },
  },
}));

const TEST_USER_ID = 'user_test123';

describe('POST /api/ingest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: TEST_USER_ID } as never);
  });

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: null } as never);

    const request = new Request('http://localhost/api/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawInput: 'Met with Alice for coffee' }),
    }) as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns 404 when contactId belongs to another user', async () => {
    // Contact not found because userId doesn't match
    vi.mocked(prisma.contact.findFirst).mockResolvedValue(null);

    const request = new Request('http://localhost/api/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rawInput: 'Met with Alice for coffee',
        contactId: 'other_user_contact',
      }),
    }) as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Contact not found');
    // Verify ownership check included userId
    expect(prisma.contact.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'other_user_contact', userId: TEST_USER_ID },
      })
    );
  });

  it('creates contact with userId for authenticated user', async () => {
    // No existing contact found
    vi.mocked(prisma.contact.findMany).mockResolvedValue([]);

    const mockContact = { id: 'new_contact', userId: TEST_USER_ID, name: 'Alice', location: null };
    vi.mocked(prisma.contact.create).mockResolvedValue(mockContact as never);

    const request = new Request('http://localhost/api/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawInput: 'Met with Alice for coffee' }),
    }) as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.isNewContact).toBe(true);
    // Verify contact created with userId
    expect(prisma.contact.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ userId: TEST_USER_ID }),
    });
  });

  it('scopes contact lookup by userId to prevent cross-tenant access', async () => {
    vi.mocked(prisma.contact.findMany).mockResolvedValue([]);

    const mockContact = { id: 'new_contact', userId: TEST_USER_ID, name: 'Alice', location: null };
    vi.mocked(prisma.contact.create).mockResolvedValue(mockContact as never);

    const request = new Request('http://localhost/api/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawInput: 'Met with Alice for coffee' }),
    }) as NextRequest;

    await POST(request);

    // Verify name lookup is scoped to user
    expect(prisma.contact.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: TEST_USER_ID }),
      })
    );
  });

  it('returns 400 when neither rawInput nor imageData provided', async () => {
    const request = new Request('http://localhost/api/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }) as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Either rawInput or imageData is required');
  });
});
