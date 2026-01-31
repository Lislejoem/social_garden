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

// Force dynamic rendering to support PUT method
export const dynamic = 'force-dynamic';

const DEFAULT_SETTINGS_ID = 'default';
const MAX_USERNAME_LENGTH = 100;

/**
 * GET /api/settings
 * @returns UserSettings (creates default record if none exists)
 */
export async function GET() {
  try {
    // Use upsert to get or create default settings
    const settings = await prisma.userSettings.upsert({
      where: { id: DEFAULT_SETTINGS_ID },
      update: {},
      create: { id: DEFAULT_SETTINGS_ID },
    });

    return NextResponse.json(settings);
  } catch (error) {
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
      where: { id: DEFAULT_SETTINGS_ID },
      update: { userName },
      create: { id: DEFAULT_SETTINGS_ID, userName },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to update user settings:', error);
    return NextResponse.json(
      { error: 'Failed to update user settings' },
      { status: 500 }
    );
  }
}
