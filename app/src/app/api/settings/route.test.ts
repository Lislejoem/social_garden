import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';
import { GET, PUT } from './route';
import { prisma } from '@/lib/prisma';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    userSettings: {
      upsert: vi.fn(),
    },
  },
}));

describe('GET /api/settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns default settings when no record exists', async () => {
    const mockSettings = {
      id: 'default',
      userName: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(prisma.userSettings.upsert).mockResolvedValue(mockSettings);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe('default');
    expect(data.userName).toBeNull();
  });

  it('returns existing settings', async () => {
    const mockSettings = {
      id: 'default',
      userName: 'Joe',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(prisma.userSettings.upsert).mockResolvedValue(mockSettings);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.userName).toBe('Joe');
  });

  it('returns 500 on database error', async () => {
    vi.mocked(prisma.userSettings.upsert).mockRejectedValue(new Error('DB error'));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to get user settings');
  });
});

describe('PUT /api/settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates settings if not exist (upsert)', async () => {
    const mockSettings = {
      id: 'default',
      userName: 'Joe',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(prisma.userSettings.upsert).mockResolvedValue(mockSettings);

    const request = new Request('http://localhost/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName: 'Joe' }),
    });

    const response = await PUT(request as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.userName).toBe('Joe');
    expect(prisma.userSettings.upsert).toHaveBeenCalledWith({
      where: { id: 'default' },
      update: { userName: 'Joe' },
      create: { id: 'default', userName: 'Joe' },
    });
  });

  it('trims whitespace from userName', async () => {
    const mockSettings = {
      id: 'default',
      userName: 'Joe',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(prisma.userSettings.upsert).mockResolvedValue(mockSettings);

    const request = new Request('http://localhost/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName: '  Joe  ' }),
    });

    await PUT(request as NextRequest);

    expect(prisma.userSettings.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: { userName: 'Joe' },
      })
    );
  });

  it('rejects userName over 100 characters', async () => {
    const longName = 'a'.repeat(101);

    const request = new Request('http://localhost/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName: longName }),
    });

    const response = await PUT(request as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('100 characters');
    expect(prisma.userSettings.upsert).not.toHaveBeenCalled();
  });

  it('clears userName when empty string provided', async () => {
    const mockSettings = {
      id: 'default',
      userName: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(prisma.userSettings.upsert).mockResolvedValue(mockSettings);

    const request = new Request('http://localhost/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName: '' }),
    });

    await PUT(request as NextRequest);

    expect(prisma.userSettings.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: { userName: null },
      })
    );
  });

  it('clears userName when whitespace-only string provided', async () => {
    const mockSettings = {
      id: 'default',
      userName: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(prisma.userSettings.upsert).mockResolvedValue(mockSettings);

    const request = new Request('http://localhost/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName: '   ' }),
    });

    await PUT(request as NextRequest);

    expect(prisma.userSettings.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: { userName: null },
      })
    );
  });

  it('returns 500 on database error', async () => {
    vi.mocked(prisma.userSettings.upsert).mockRejectedValue(new Error('DB error'));

    const request = new Request('http://localhost/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName: 'Joe' }),
    });

    const response = await PUT(request as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to update user settings');
  });
});
