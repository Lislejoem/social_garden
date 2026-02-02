/**
 * @file Preferences API Routes
 * @description Update and delete ALWAYS/NEVER preferences.
 *
 * @endpoints
 * PUT    /api/preferences/:id - Update preference category or content
 * DELETE /api/preferences/:id - Delete a preference
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PUT /api/preferences/:id
 * @body { category?: 'ALWAYS' | 'NEVER', content?: string, preferenceType?: 'TOPIC' | 'PREFERENCE' }
 * @returns Updated Preference
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const body = await request.json();
    const { category, content, preferenceType } = body;

    // Verify ownership via preference's own userId (security pattern)
    const existing = await prisma.preference.findFirst({
      where: { id, userId },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Preference not found' },
        { status: 404 }
      );
    }

    const preference = await prisma.preference.update({
      where: { id },
      data: {
        ...(category && { category }),
        ...(content !== undefined && { content }),
        ...(preferenceType && { preferenceType }),
      },
    });

    // Touch Contact.updatedAt to invalidate cached briefing
    await prisma.contact.update({
      where: { id: preference.contactId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(preference);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Failed to update preference:', error);
    return NextResponse.json(
      { error: 'Failed to update preference' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/preferences/:id
 * @returns { success: true }
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await requireUserId();
    const { id } = await params;

    // Verify ownership via preference's own userId (security pattern)
    const preference = await prisma.preference.findFirst({
      where: { id, userId },
      select: { contactId: true },
    });

    if (!preference) {
      return NextResponse.json(
        { error: 'Preference not found' },
        { status: 404 }
      );
    }

    await prisma.preference.delete({
      where: { id },
    });

    // Touch Contact.updatedAt to invalidate cached briefing
    await prisma.contact.update({
      where: { id: preference.contactId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Failed to delete preference:', error);
    return NextResponse.json(
      { error: 'Failed to delete preference' },
      { status: 500 }
    );
  }
}
