/**
 * @file Interaction Detail API Routes
 * @description Update and delete individual interactions.
 *
 * @endpoints
 * PUT    /api/interactions/:id - Update summary, date, type, or platform
 * DELETE /api/interactions/:id - Delete an interaction
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId } from '@/lib/auth';
import { parseDateFromInput } from '@/lib/dates';

interface RouteParams {
  params: Promise<{ id: string }>;
}

const VALID_TYPES = ['CALL', 'MESSAGE', 'MEET', 'VOICE'];
const VALID_PLATFORMS = ['text', 'instagram', 'telegram', 'linkedin'];

/**
 * PUT /api/interactions/:id
 * @body { summary?: string, date?: string, type?: string, platform?: string }
 * @returns Updated Interaction
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const body = await request.json();
    const { summary, date, type, platform } = body;

    // Validate type if provided
    if (type && !VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { error: `type must be one of: ${VALID_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate platform if provided
    if (platform && !VALID_PLATFORMS.includes(platform)) {
      return NextResponse.json(
        { error: `platform must be one of: ${VALID_PLATFORMS.join(', ')}` },
        { status: 400 }
      );
    }

    // Verify ownership via interaction's own userId (security pattern)
    const existing = await prisma.interaction.findFirst({
      where: { id, userId },
      select: { id: true, contactId: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Interaction not found' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (summary !== undefined) updateData.summary = summary;
    if (date !== undefined) updateData.date = parseDateFromInput(date);
    if (type) {
      updateData.type = type;
      // Clear platform if type is not MESSAGE
      if (type !== 'MESSAGE') {
        updateData.platform = null;
      }
    }
    if (platform !== undefined) {
      updateData.platform = platform;
    }

    const interaction = await prisma.interaction.update({
      where: { id },
      data: updateData,
    });

    // Update the parent contact's updatedAt timestamp
    await prisma.contact.update({
      where: { id: interaction.contactId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(interaction);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Failed to update interaction:', error);
    return NextResponse.json(
      { error: 'Failed to update interaction' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/interactions/:id
 * @returns { success: true }
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await requireUserId();
    const { id } = await params;

    // Verify ownership via interaction's own userId (security pattern)
    const interaction = await prisma.interaction.findFirst({
      where: { id, userId },
    });

    if (!interaction) {
      return NextResponse.json(
        { error: 'Interaction not found' },
        { status: 404 }
      );
    }

    await prisma.interaction.delete({
      where: { id },
    });

    // Update the parent contact's updatedAt timestamp
    await prisma.contact.update({
      where: { id: interaction.contactId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Failed to delete interaction:', error);
    return NextResponse.json(
      { error: 'Failed to delete interaction' },
      { status: 500 }
    );
  }
}
