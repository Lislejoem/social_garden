import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';
import { GET, POST } from './route';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

// Mock Clerk auth - use literal value since vi.mock is hoisted
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn().mockResolvedValue({ userId: 'user_test123' }),
}));

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    contact: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

const TEST_USER_ID = 'user_test123';

describe('GET /api/contacts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: TEST_USER_ID } as never);
  });

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: null } as never);

    const request = new Request('http://localhost/api/contacts') as NextRequest;
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns contacts for authenticated user', async () => {
    const mockContacts = [
      {
        id: 'contact_1',
        userId: TEST_USER_ID,
        name: 'Alice',
        preferences: [],
        interactions: [],
      },
    ];
    vi.mocked(prisma.contact.findMany).mockResolvedValue(mockContacts as never);

    const request = new Request('http://localhost/api/contacts') as NextRequest;
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(1);
    expect(data[0].name).toBe('Alice');
    expect(prisma.contact.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: TEST_USER_ID }),
      })
    );
  });

  it('filters by userId to prevent cross-tenant access', async () => {
    vi.mocked(prisma.contact.findMany).mockResolvedValue([]);

    const request = new Request('http://localhost/api/contacts') as NextRequest;
    await GET(request);

    // Verify the query includes userId filter
    expect(prisma.contact.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: TEST_USER_ID }),
      })
    );
  });
});

describe('POST /api/contacts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: TEST_USER_ID } as never);
  });

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: null } as never);

    const request = new Request('http://localhost/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Bob' }),
    }) as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('creates contact with userId for authenticated user', async () => {
    const mockContact = {
      id: 'contact_new',
      userId: TEST_USER_ID,
      name: 'Bob',
    };
    vi.mocked(prisma.contact.create).mockResolvedValue(mockContact as never);

    const request = new Request('http://localhost/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Bob' }),
    }) as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.name).toBe('Bob');
    expect(prisma.contact.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ userId: TEST_USER_ID, name: 'Bob' }),
    });
  });

  it('returns 400 when name is missing', async () => {
    const request = new Request('http://localhost/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }) as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Name is required');
  });
});
