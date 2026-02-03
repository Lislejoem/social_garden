/**
 * @file Family Members API Routes
 * @description Update and delete family members / important people.
 *
 * @endpoints
 * PUT    /api/family-members/:id - Update name or relation
 * DELETE /api/family-members/:id - Delete a family member
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PUT /api/family-members/:id
 * @body { name?: string, relation?: string }
 * @returns Updated FamilyMember
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const body = await request.json();
    const { name, relation } = body;

    // Verify ownership via family member's own userId (security pattern)
    const existing = await prisma.familyMember.findFirst({
      where: { id, userId },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Family member not found' },
        { status: 404 }
      );
    }

    const familyMember = await prisma.familyMember.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(relation !== undefined && { relation }),
      },
    });

    // Touch Contact.updatedAt to invalidate cached briefing
    await prisma.contact.update({
      where: { id: familyMember.contactId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(familyMember);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Failed to update family member:', error);
    return NextResponse.json(
      { error: 'Failed to update family member' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/family-members/:id
 * @returns { success: true }
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await requireUserId();
    const { id } = await params;

    // Verify ownership via family member's own userId (security pattern)
    const familyMember = await prisma.familyMember.findFirst({
      where: { id, userId },
      select: { contactId: true },
    });

    if (!familyMember) {
      return NextResponse.json(
        { error: 'Family member not found' },
        { status: 404 }
      );
    }

    await prisma.familyMember.delete({
      where: { id },
    });

    // Touch Contact.updatedAt to invalidate cached briefing
    await prisma.contact.update({
      where: { id: familyMember.contactId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Failed to delete family member:', error);
    return NextResponse.json(
      { error: 'Failed to delete family member' },
      { status: 500 }
    );
  }
}
