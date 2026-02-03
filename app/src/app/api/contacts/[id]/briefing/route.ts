/**
 * @file Contact Briefing API Route
 * @description Generates AI-powered briefings for contacts with caching.
 *
 * @endpoints
 * POST /api/contacts/:id/briefing - Get or generate a briefing for a contact
 *   Query params:
 *   - forceRefresh=true - Bypass cache and generate a new briefing
 *
 * @caching
 * Briefings are cached on the Contact record (cachedBriefing, briefingGeneratedAt).
 * Cache is valid when briefingGeneratedAt >= updatedAt. When contact data changes
 * (interactions, preferences, seedlings, family members), updatedAt advances and
 * the cache is invalidated.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId } from '@/lib/auth';
import { generateBriefing } from '@/lib/anthropic';
import type { Cadence, ContactBriefing } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/contacts/:id/briefing
 * Returns cached briefing if valid, otherwise generates a new one.
 * @query forceRefresh - Set to "true" to bypass cache
 * @returns { success: true, briefing: ContactBriefing, fromCache: boolean }
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('forceRefresh') === 'true';

    // Fetch the contact with all related data (security: verify ownership)
    const contact = await prisma.contact.findFirst({
      where: { id, userId },
      include: {
        preferences: true,
        interactions: {
          orderBy: { date: 'desc' },
          take: 20,
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

    // Check cache validity
    const cacheValid =
      !forceRefresh &&
      contact.cachedBriefing &&
      contact.briefingGeneratedAt &&
      contact.briefingGeneratedAt >= contact.updatedAt;

    if (cacheValid) {
      const cachedBriefing = JSON.parse(contact.cachedBriefing!) as ContactBriefing;
      return NextResponse.json({
        success: true,
        briefing: cachedBriefing,
        fromCache: true,
      });
    }

    // Generate the briefing using AI
    const briefing = await generateBriefing({
      name: contact.name,
      preferences: contact.preferences.map((p) => ({
        id: p.id,
        category: p.category as 'ALWAYS' | 'NEVER',
        preferenceType: p.preferenceType as 'TOPIC' | 'PREFERENCE',
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

    // Cache the briefing
    await prisma.contact.update({
      where: { id },
      data: {
        cachedBriefing: JSON.stringify(briefing),
        briefingGeneratedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      briefing,
      fromCache: false,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Failed to generate briefing:', error);
    return NextResponse.json(
      { error: 'Failed to generate briefing' },
      { status: 500 }
    );
  }
}
