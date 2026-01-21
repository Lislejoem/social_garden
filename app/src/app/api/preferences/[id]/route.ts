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

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PUT /api/preferences/:id
 * @body { category?: 'ALWAYS' | 'NEVER', content?: string }
 * @returns Updated Preference
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { category, content } = body;

    const preference = await prisma.preference.update({
      where: { id },
      data: {
        ...(category && { category }),
        ...(content !== undefined && { content }),
      },
    });

    // Touch Contact.updatedAt to invalidate cached briefing
    await prisma.contact.update({
      where: { id: preference.contactId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(preference);
  } catch (error) {
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
    const { id } = await params;

    // Get the preference first to find the contactId
    const preference = await prisma.preference.findUnique({
      where: { id },
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
    console.error('Failed to delete preference:', error);
    return NextResponse.json(
      { error: 'Failed to delete preference' },
      { status: 500 }
    );
  }
}
