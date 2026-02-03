import { auth } from '@clerk/nextjs/server';

/**
 * Requires authentication and returns the userId.
 * Throws an error if not authenticated.
 * Use this in API routes and server components that require auth.
 */
export async function requireUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }
  return userId;
}

/**
 * Returns the userId if authenticated, null otherwise.
 * Use this when auth is optional.
 */
export async function getUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}
