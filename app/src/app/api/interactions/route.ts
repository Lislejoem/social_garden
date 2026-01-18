/**
 * @file Interactions API Routes
 * @description Create interactions (contact logs) directly without voice processing.
 *
 * @endpoint POST /api/interactions - Create a new interaction
 *
 * @types
 * CALL  - Phone call
 * TEXT  - Text message
 * MEET  - In-person meeting
 * VOICE - Voice note (typically created via /api/ingest)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/interactions
 * @body { contactId: string, type: string, summary?: string, date?: string }
 * @returns Created Interaction (201)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contactId, type, summary, date } = body;

    if (!contactId) {
      return NextResponse.json(
        { error: 'contactId is required' },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { error: 'type is required' },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = ['CALL', 'TEXT', 'MEET', 'VOICE'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `type must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Verify contact exists
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    const interaction = await prisma.interaction.create({
      data: {
        contactId,
        type,
        summary: summary || `${type.charAt(0) + type.slice(1).toLowerCase()} with ${contact.name}`,
        date: date ? new Date(date) : new Date(),
      },
    });

    // Update contact's updatedAt timestamp
    await prisma.contact.update({
      where: { id: contactId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(interaction, { status: 201 });
  } catch (error) {
    console.error('Failed to create interaction:', error);
    return NextResponse.json(
      { error: 'Failed to create interaction' },
      { status: 500 }
    );
  }
}
