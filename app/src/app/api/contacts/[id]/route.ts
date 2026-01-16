import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/contacts/[id] - Get a single contact
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const contact = await prisma.contact.findUnique({
      where: { id },
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
    console.error('Failed to fetch contact:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact' },
      { status: 500 }
    );
  }
}

// PUT /api/contacts/[id] - Update a contact
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, avatarUrl, location, birthday, cadence, socials } = body;

    const contact = await prisma.contact.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(location !== undefined && { location }),
        ...(birthday !== undefined && {
          birthday: birthday ? new Date(birthday) : null,
        }),
        ...(cadence && { cadence }),
        ...(socials !== undefined && {
          socials: socials ? JSON.stringify(socials) : null,
        }),
      },
    });

    return NextResponse.json(contact);
  } catch (error) {
    console.error('Failed to update contact:', error);
    return NextResponse.json(
      { error: 'Failed to update contact' },
      { status: 500 }
    );
  }
}

// DELETE /api/contacts/[id] - Delete a contact
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    await prisma.contact.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete contact:', error);
    return NextResponse.json(
      { error: 'Failed to delete contact' },
      { status: 500 }
    );
  }
}
