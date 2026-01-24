/**
 * @file Interactions API Routes
 * @description Create interactions (contact logs) directly without voice processing.
 *
 * @endpoint POST /api/interactions - Create a new interaction
 *
 * @types
 * CALL    - Phone call
 * MESSAGE - Text/chat message (with platform: text, instagram, telegram, linkedin)
 * MEET    - In-person meeting
 * VOICE   - Voice note (typically created via /api/ingest)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const VALID_TYPES = ['CALL', 'MESSAGE', 'MEET', 'VOICE'];
const VALID_PLATFORMS = ['text', 'instagram', 'telegram', 'linkedin'];

/**
 * POST /api/interactions
 * @body { contactId: string, type: string, platform?: string, summary?: string, date?: string }
 * @returns Created Interaction (201)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contactId, type, platform, summary, date } = body;

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
    if (!VALID_TYPES.includes(type)) {
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

    // Generate default summary based on type and platform
    let defaultSummary: string;
    if (type === 'MESSAGE' && platform && platform !== 'text') {
      const platformLabel = platform.charAt(0).toUpperCase() + platform.slice(1);
      defaultSummary = `${platformLabel} message with ${contact.name}`;
    } else {
      defaultSummary = `${type.charAt(0) + type.slice(1).toLowerCase()} with ${contact.name}`;
    }

    const interaction = await prisma.interaction.create({
      data: {
        contactId,
        type,
        platform: type === 'MESSAGE' ? (platform || 'text') : null,
        summary: summary || defaultSummary,
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
