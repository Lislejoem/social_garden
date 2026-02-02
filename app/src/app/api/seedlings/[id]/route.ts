/**
 * @file Seedlings API Routes
 * @description Update and delete seedlings (follow-up items).
 *
 * @endpoints
 * PUT    /api/seedlings/:id - Update content or mark as PLANTED
 * DELETE /api/seedlings/:id - Delete a seedling
 *
 * @status
 * ACTIVE  - Pending follow-up
 * PLANTED - Completed/actioned
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PUT /api/seedlings/:id
 * @body { content?: string, status?: 'ACTIVE' | 'PLANTED' }
 * @returns Updated Seedling
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const body = await request.json();
    const { content, status } = body;

    // Verify ownership via seedling's own userId (security pattern)
    const existing = await prisma.seedling.findFirst({
      where: { id, userId },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Seedling not found' },
        { status: 404 }
      );
    }

    const seedling = await prisma.seedling.update({
      where: { id },
      data: {
        ...(content !== undefined && { content }),
        ...(status && { status }),
      },
    });

    // Touch Contact.updatedAt to invalidate cached briefing
    await prisma.contact.update({
      where: { id: seedling.contactId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(seedling);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Failed to update seedling:', error);
    return NextResponse.json(
      { error: 'Failed to update seedling' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/seedlings/:id
 * @returns { success: true }
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await requireUserId();
    const { id } = await params;

    // Verify ownership via seedling's own userId (security pattern)
    const seedling = await prisma.seedling.findFirst({
      where: { id, userId },
      select: { contactId: true },
    });

    if (!seedling) {
      return NextResponse.json(
        { error: 'Seedling not found' },
        { status: 404 }
      );
    }

    await prisma.seedling.delete({
      where: { id },
    });

    // Touch Contact.updatedAt to invalidate cached briefing
    await prisma.contact.update({
      where: { id: seedling.contactId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Failed to delete seedling:', error);
    return NextResponse.json(
      { error: 'Failed to delete seedling' },
      { status: 500 }
    );
  }
}
