/**
 * @file Contact Briefing API Route
 * @description Generates AI-powered briefings for contacts.
 *
 * @endpoints
 * POST /api/contacts/:id/briefing - Generate a briefing for a contact
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateBriefing } from '@/lib/anthropic';
import type { Cadence } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/contacts/:id/briefing
 * Generates an AI-powered briefing for the contact.
 * @returns ContactBriefing with relationship summary, highlights, conversation starters
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Fetch the contact with all related data
    const contact = await prisma.contact.findUnique({
      where: { id },
      include: {
        preferences: true,
        interactions: {
          orderBy: { date: 'desc' },
          take: 20, // Limit to recent interactions for context
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

    // Generate the briefing using AI
    const briefing = await generateBriefing({
      name: contact.name,
      preferences: contact.preferences.map((p) => ({
        id: p.id,
        category: p.category as 'ALWAYS' | 'NEVER',
        content: p.content,
      })),
      interactions: contact.interactions.map((i) => ({
        id: i.id,
        date: i.date,
        type: i.type as 'CALL' | 'MESSAGE' | 'MEET' | 'VOICE',
        platform: i.platform as 'text' | 'instagram' | 'telegram' | 'linkedin' | null,
        summary: i.summary,
      })),
      seedlings: contact.seedlings.map((s) => ({
        id: s.id,
        content: s.content,
        status: s.status as 'ACTIVE' | 'PLANTED',
        createdAt: s.createdAt,
      })),
      familyMembers: contact.familyMembers.map((fm) => ({
        id: fm.id,
        name: fm.name,
        relation: fm.relation,
      })),
      birthday: contact.birthday,
      cadence: contact.cadence as Cadence,
      location: contact.location,
    });

    return NextResponse.json({
      success: true,
      briefing,
    });
  } catch (error) {
    console.error('Failed to generate briefing:', error);
    return NextResponse.json(
      { error: 'Failed to generate briefing' },
      { status: 500 }
    );
  }
}
