/**
 * @file User Settings API Routes
 * @description Get and update user settings (e.g., user name).
 *
 * @endpoints
 * GET  /api/settings - Get user settings (creates default if not exists)
 * PUT  /api/settings - Update user settings
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId } from '@/lib/auth';

// Force dynamic rendering to support PUT method
export const dynamic = 'force-dynamic';

const MAX_USERNAME_LENGTH = 100;

/**
 * GET /api/settings
 * @returns UserSettings (creates default record if none exists)
 */
export async function GET() {
  try {
    const userId = await requireUserId();

    // Use upsert to get or create user-specific settings
    const settings = await prisma.userSettings.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId },
    });

    return NextResponse.json(settings);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Failed to get user settings:', error);
    return NextResponse.json(
      { error: 'Failed to get user settings' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/settings
 * @body { userName?: string }
 * @returns Updated UserSettings
 */
export async function PUT(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    let { userName } = body;

    // Trim whitespace
    if (typeof userName === 'string') {
      userName = userName.trim();
      // Empty string becomes null
      if (userName === '') {
        userName = null;
      }
    }

    // Validate length
    if (userName !== null && userName !== undefined && userName.length > MAX_USERNAME_LENGTH) {
      return NextResponse.json(
        { error: `User name must be ${MAX_USERNAME_LENGTH} characters or less` },
        { status: 400 }
      );
    }

    // Upsert to handle case where settings don't exist yet
    const settings = await prisma.userSettings.upsert({
      where: { id: userId },
      update: { userName },
      create: { id: userId, userName },
    });

    return NextResponse.json(settings);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Failed to update user settings:', error);
    return NextResponse.json(
      { error: 'Failed to update user settings' },
      { status: 500 }
    );
  }
}
