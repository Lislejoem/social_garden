/**
 * @file Contact Seedlings API
 * @description Create seedlings (follow-up items) for a specific contact.
 *
 * @endpoint POST /api/contacts/:id/seedlings - Create a new ACTIVE seedling
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/contacts/:id/seedlings
 * @body { content: string } - The follow-up item text
 * @returns Created Seedling with status ACTIVE (201)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Verify contact exists and belongs to user (security pattern)
    const contact = await prisma.contact.findFirst({
      where: { id, userId },
    });

    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    const seedling = await prisma.seedling.create({
      data: {
        userId,
        contactId: id,
        content,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json(seedling, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Failed to create seedling:', error);
    return NextResponse.json(
      { error: 'Failed to create seedling' },
      { status: 500 }
    );
  }
}
