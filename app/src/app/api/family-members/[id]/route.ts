import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/family-members/[id] - Update a family member
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, relation } = body;

    const familyMember = await prisma.familyMember.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(relation !== undefined && { relation }),
      },
    });

    return NextResponse.json(familyMember);
  } catch (error) {
    console.error('Failed to update family member:', error);
    return NextResponse.json(
      { error: 'Failed to update family member' },
      { status: 500 }
    );
  }
}

// DELETE /api/family-members/[id] - Delete a family member
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    await prisma.familyMember.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete family member:', error);
    return NextResponse.json(
      { error: 'Failed to delete family member' },
      { status: 500 }
    );
  }
}
