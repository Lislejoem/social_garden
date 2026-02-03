/**
 * @file Contacts API Routes
 * @description CRUD operations for contacts collection.
 *
 * @endpoints
 * GET  /api/contacts - Fetch all contacts with preferences and last interaction
 * POST /api/contacts - Create a new contact
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId } from '@/lib/auth';

/**
 * GET /api/contacts
 * @query hiddenOnly - If true, returns only hidden contacts
 * @returns Contact[] with preferences and most recent interaction
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const { searchParams } = new URL(request.url);
    const hiddenOnly = searchParams.get('hiddenOnly') === 'true';

    const contacts = await prisma.contact.findMany({
      where: {
        userId,
        ...(hiddenOnly
          ? { hiddenAt: { not: null } }
          : { hiddenAt: null }),
      },
      include: {
        preferences: true,
        interactions: {
          orderBy: { date: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(contacts);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Failed to fetch contacts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/contacts
 * @body { name: string, avatarUrl?: string, location?: string, birthday?: string, cadence?: Cadence, socials?: Socials }
 * @returns Created Contact (201) or error
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const { name, avatarUrl, location, birthday, cadence, socials } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const contact = await prisma.contact.create({
      data: {
        userId,
        name,
        avatarUrl: avatarUrl || null,
        location: location || null,
        birthday: birthday ? new Date(birthday) : null,
        cadence: cadence || 'REGULARLY',
        socials: socials ? JSON.stringify(socials) : null,
      },
    });

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Failed to create contact:', error);
    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    );
  }
}
