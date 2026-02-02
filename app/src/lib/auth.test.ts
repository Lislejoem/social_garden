import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { auth } from '@clerk/nextjs/server';
import { requireUserId, getUserId } from './auth';

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

describe('auth helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('requireUserId', () => {
    it('returns userId when authenticated', async () => {
      (auth as Mock).mockResolvedValue({ userId: 'user_123' });

      const userId = await requireUserId();

      expect(userId).toBe('user_123');
    });

    it('throws when not authenticated', async () => {
      (auth as Mock).mockResolvedValue({ userId: null });

      await expect(requireUserId()).rejects.toThrow('Unauthorized');
    });
  });

  describe('getUserId', () => {
    it('returns userId when authenticated', async () => {
      (auth as Mock).mockResolvedValue({ userId: 'user_456' });

      const userId = await getUserId();

      expect(userId).toBe('user_456');
    });

    it('returns null when not authenticated', async () => {
      (auth as Mock).mockResolvedValue({ userId: null });

      const userId = await getUserId();

      expect(userId).toBeNull();
    });
  });
});
