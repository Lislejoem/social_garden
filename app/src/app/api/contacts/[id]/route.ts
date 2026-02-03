/**
 * @file Single Contact API Routes
 * @description CRUD operations for individual contacts.
 *
 * @endpoints
 * GET    /api/contacts/:id - Fetch contact with all related data
 * PUT    /api/contacts/:id - Update contact fields
 * DELETE /api/contacts/:id - Delete contact (cascades to related records)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/contacts/:id
 * @returns Contact with preferences, interactions, seedlings, familyMembers
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await requireUserId();
    const { id } = await params;

    // Use findFirst with id AND userId for ownership verification (security pattern)
    const contact = await prisma.contact.findFirst({
      where: { id, userId },
      include: {
        preferences: true,
        interactions: {
          orderBy: { date: 'desc' },
        },
        seedlings: {
          orderBy: { createdAt: 'desc' },
        },
        familyMembers: true,
      },
    });

    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(contact);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Failed to fetch contact:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/contacts/:id
 * @body Partial<Contact> - Any subset of contact fields to update
 * @returns Updated Contact
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const body = await request.json();
    const { name, avatarUrl, avatarSource, preferredAvatarSource, location, birthday, birthdayMonth, birthdayDay, cadence, socials, hiddenAt } = body;

    // Verify ownership before update (security pattern)
    const existing = await prisma.contact.findFirst({
      where: { id, userId },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    const contact = await prisma.contact.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(avatarSource !== undefined && { avatarSource }),
        ...(preferredAvatarSource !== undefined && { preferredAvatarSource }),
        ...(location !== undefined && { location }),
        ...(birthday !== undefined && {
          birthday: birthday ? new Date(birthday) : null,
        }),
        ...(birthdayMonth !== undefined && { birthdayMonth }),
        ...(birthdayDay !== undefined && { birthdayDay }),
        ...(cadence && { cadence }),
        ...(socials !== undefined && {
          socials: socials ? JSON.stringify(socials) : null,
        }),
        ...(hiddenAt !== undefined && {
          hiddenAt: hiddenAt ? new Date(hiddenAt) : null,
        }),
      },
    });

    return NextResponse.json(contact);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Failed to update contact:', error);
    return NextResponse.json(
      { error: 'Failed to update contact' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/contacts/:id
 * Cascades to delete preferences, interactions, seedlings, familyMembers
 * @returns { success: true }
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await requireUserId();
    const { id } = await params;

    // Verify ownership before delete (security pattern)
    const existing = await prisma.contact.findFirst({
      where: { id, userId },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    await prisma.contact.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Failed to delete contact:', error);
    return NextResponse.json(
      { error: 'Failed to delete contact' },
      { status: 500 }
    );
  }
}
