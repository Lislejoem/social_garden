/**
 * @file Interaction Detail API Routes
 * @description Update and delete individual interactions.
 *
 * @endpoints
 * PUT    /api/interactions/:id - Update summary, date, or type
 * DELETE /api/interactions/:id - Delete an interaction
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PUT /api/interactions/:id
 * @body { summary?: string, date?: string, type?: string }
 * @returns Updated Interaction
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { summary, date, type } = body;

    // Validate type if provided
    if (type) {
      const validTypes = ['CALL', 'TEXT', 'MEET', 'VOICE'];
      if (!validTypes.includes(type)) {
        return NextResponse.json(
          { error: `type must be one of: ${validTypes.join(', ')}` },
          { status: 400 }
        );
      }
    }

    const interaction = await prisma.interaction.update({
      where: { id },
      data: {
        ...(summary !== undefined && { summary }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(type && { type }),
      },
    });

    // Update the parent contact's updatedAt timestamp
    await prisma.contact.update({
      where: { id: interaction.contactId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(interaction);
  } catch (error) {
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
    const { id } = await params;

    // Get the interaction first to know the contactId
    const interaction = await prisma.interaction.findUnique({
      where: { id },
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
    console.error('Failed to delete interaction:', error);
    return NextResponse.json(
      { error: 'Failed to delete interaction' },
      { status: 500 }
    );
  }
}
