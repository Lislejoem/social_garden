import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/seedlings/[id] - Update a seedling
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { content, status } = body;

    const seedling = await prisma.seedling.update({
      where: { id },
      data: {
        ...(content !== undefined && { content }),
        ...(status && { status }),
      },
    });

    return NextResponse.json(seedling);
  } catch (error) {
    console.error('Failed to update seedling:', error);
    return NextResponse.json(
      { error: 'Failed to update seedling' },
      { status: 500 }
    );
  }
}

// DELETE /api/seedlings/[id] - Delete a seedling
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    await prisma.seedling.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete seedling:', error);
    return NextResponse.json(
      { error: 'Failed to delete seedling' },
      { status: 500 }
    );
  }
}
