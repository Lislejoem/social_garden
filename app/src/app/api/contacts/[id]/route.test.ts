import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';
import { GET, PUT, DELETE } from './route';
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
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

const TEST_USER_ID = 'user_test123';
const TEST_CONTACT_ID = 'contact_123';

function createParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe('GET /api/contacts/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: TEST_USER_ID } as never);
  });

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: null } as never);

    const request = new Request(`http://localhost/api/contacts/${TEST_CONTACT_ID}`) as NextRequest;
    const response = await GET(request, createParams(TEST_CONTACT_ID));
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns 404 when accessing another user\'s contact', async () => {
    // Simulate contact not found (belongs to different user)
    vi.mocked(prisma.contact.findFirst).mockResolvedValue(null);

    const request = new Request(`http://localhost/api/contacts/${TEST_CONTACT_ID}`) as NextRequest;
    const response = await GET(request, createParams(TEST_CONTACT_ID));
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Contact not found');
    // Verify ownership check included userId
    expect(prisma.contact.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: TEST_CONTACT_ID, userId: TEST_USER_ID },
      })
    );
  });

  it('returns contact for authenticated owner', async () => {
    const mockContact = {
      id: TEST_CONTACT_ID,
      userId: TEST_USER_ID,
      name: 'Alice',
      preferences: [],
      interactions: [],
      seedlings: [],
      familyMembers: [],
    };
    vi.mocked(prisma.contact.findFirst).mockResolvedValue(mockContact as never);

    const request = new Request(`http://localhost/api/contacts/${TEST_CONTACT_ID}`) as NextRequest;
    const response = await GET(request, createParams(TEST_CONTACT_ID));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.name).toBe('Alice');
  });
});

describe('PUT /api/contacts/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: TEST_USER_ID } as never);
  });

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: null } as never);

    const request = new Request(`http://localhost/api/contacts/${TEST_CONTACT_ID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Updated' }),
    }) as NextRequest;

    const response = await PUT(request, createParams(TEST_CONTACT_ID));
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns 404 when updating another user\'s contact', async () => {
    vi.mocked(prisma.contact.findFirst).mockResolvedValue(null);

    const request = new Request(`http://localhost/api/contacts/${TEST_CONTACT_ID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Updated' }),
    }) as NextRequest;

    const response = await PUT(request, createParams(TEST_CONTACT_ID));
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Contact not found');
  });

  it('updates contact for authenticated owner', async () => {
    const existingContact = { id: TEST_CONTACT_ID };
    const updatedContact = { id: TEST_CONTACT_ID, userId: TEST_USER_ID, name: 'Updated' };

    vi.mocked(prisma.contact.findFirst).mockResolvedValue(existingContact as never);
    vi.mocked(prisma.contact.update).mockResolvedValue(updatedContact as never);

    const request = new Request(`http://localhost/api/contacts/${TEST_CONTACT_ID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Updated' }),
    }) as NextRequest;

    const response = await PUT(request, createParams(TEST_CONTACT_ID));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.name).toBe('Updated');
  });
});

describe('DELETE /api/contacts/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: TEST_USER_ID } as never);
  });

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: null } as never);

    const request = new Request(`http://localhost/api/contacts/${TEST_CONTACT_ID}`, {
      method: 'DELETE',
    }) as NextRequest;

    const response = await DELETE(request, createParams(TEST_CONTACT_ID));
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns 404 when deleting another user\'s contact', async () => {
    vi.mocked(prisma.contact.findFirst).mockResolvedValue(null);

    const request = new Request(`http://localhost/api/contacts/${TEST_CONTACT_ID}`, {
      method: 'DELETE',
    }) as NextRequest;

    const response = await DELETE(request, createParams(TEST_CONTACT_ID));
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Contact not found');
  });

  it('deletes contact for authenticated owner', async () => {
    const existingContact = { id: TEST_CONTACT_ID };

    vi.mocked(prisma.contact.findFirst).mockResolvedValue(existingContact as never);
    vi.mocked(prisma.contact.delete).mockResolvedValue(existingContact as never);

    const request = new Request(`http://localhost/api/contacts/${TEST_CONTACT_ID}`, {
      method: 'DELETE',
    }) as NextRequest;

    const response = await DELETE(request, createParams(TEST_CONTACT_ID));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
