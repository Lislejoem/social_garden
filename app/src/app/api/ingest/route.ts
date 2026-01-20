/**
 * @file Voice Note Ingestion API
 * @description Processes voice transcripts using Claude AI to extract and store
 * contact information, preferences, family members, and follow-up items (seedlings).
 *
 * @flow
 * 1. Receives raw transcript (+ optional contactId for existing contacts)
 * 2. Calls Claude AI to extract structured data (AIExtraction)
 * 3. If dryRun=true, returns preview without saving (for user review)
 * 4. If dryRun=false, creates/updates contact and related records
 *
 * @endpoint POST /api/ingest
 * @body {
 *   rawInput: string        - Voice transcript text (required)
 *   contactId?: string      - Existing contact ID (for updates)
 *   dryRun?: boolean        - If true, returns preview without saving
 *   overrides?: AIExtraction - User-edited data to save instead of AI extraction
 * }
 * @returns IngestPreviewResponse (if dryRun) or IngestResponse with saved data summary
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractFromNote } from '@/lib/anthropic';
import type { AIExtraction, IngestPreviewResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rawInput, contactId, dryRun, overrides } = body;

    if (!rawInput) {
      return NextResponse.json(
        { error: 'rawInput is required' },
        { status: 400 }
      );
    }

    // Extract structured data using Claude (or use overrides if provided)
    const extraction: AIExtraction = overrides || await extractFromNote(rawInput);

    if (!extraction.contactName) {
      return NextResponse.json(
        { error: 'Could not identify a person in the note' },
        { status: 400 }
      );
    }

    // Check if contact exists
    let existingContact = null;
    let isNewContact = true;

    if (contactId) {
      existingContact = await prisma.contact.findUnique({
        where: { id: contactId },
        select: { id: true, name: true, location: true },
      });

      if (!existingContact) {
        return NextResponse.json(
          { error: 'Contact not found' },
          { status: 404 }
        );
      }
      isNewContact = false;
    } else {
      // Try to find existing contact by name (case-insensitive)
      const existingContacts = await prisma.contact.findMany({
        where: {
          name: {
            equals: extraction.contactName,
          },
        },
        select: { id: true, name: true, location: true },
      });

      if (existingContacts.length > 0) {
        existingContact = existingContacts[0];
        isNewContact = false;
      }
    }

    // If dryRun, return preview without saving
    if (dryRun) {
      const previewResponse: IngestPreviewResponse = {
        success: true,
        preview: true,
        extraction,
        existingContact,
        isNewContact,
      };
      return NextResponse.json(previewResponse);
    }

    // Actual save logic
    let contact;

    if (existingContact) {
      contact = await prisma.contact.findUnique({
        where: { id: existingContact.id },
      });
    } else {
      // Create new contact
      contact = await prisma.contact.create({
        data: {
          name: extraction.contactName,
          location: extraction.location || null,
        },
      });
    }

    if (!contact) {
      return NextResponse.json(
        { error: 'Failed to find or create contact' },
        { status: 500 }
      );
    }

    // Track what was updated
    const updates: {
      preferences: number;
      familyMembers: number;
      seedlings: number;
      interaction: boolean;
    } = {
      preferences: 0,
      familyMembers: 0,
      seedlings: 0,
      interaction: false,
    };

    // Update location if provided and contact doesn't have one
    if (extraction.location && !contact.location) {
      await prisma.contact.update({
        where: { id: contact.id },
        data: { location: extraction.location },
      });
    }

    // Add preferences (with deduplication)
    // Uses first 20 characters for partial matching to avoid near-duplicates
    // e.g., "Loves Italian food" won't duplicate "Loves Italian food from that place"
    if (extraction.preferences && extraction.preferences.length > 0) {
      for (const pref of extraction.preferences) {
        // Check if similar preference already exists using partial match
        const existing = await prisma.preference.findFirst({
          where: {
            contactId: contact.id,
            content: {
              contains: pref.content.substring(0, 20),
            },
          },
        });

        if (!existing) {
          await prisma.preference.create({
            data: {
              contactId: contact.id,
              category: pref.category,
              content: pref.content,
            },
          });
          updates.preferences++;
        }
      }
    }

    // Add family members
    if (extraction.familyMembers && extraction.familyMembers.length > 0) {
      for (const member of extraction.familyMembers) {
        // Check if family member already exists
        const existing = await prisma.familyMember.findFirst({
          where: {
            contactId: contact.id,
            name: member.name,
          },
        });

        if (!existing) {
          await prisma.familyMember.create({
            data: {
              contactId: contact.id,
              name: member.name,
              relation: member.relation,
            },
          });
          updates.familyMembers++;
        }
      }
    }

    // Add seedlings
    if (extraction.seedlings && extraction.seedlings.length > 0) {
      for (const seedlingContent of extraction.seedlings) {
        await prisma.seedling.create({
          data: {
            contactId: contact.id,
            content: seedlingContent,
            status: 'ACTIVE',
          },
        });
        updates.seedlings++;
      }
    }

    // Add interaction
    if (extraction.interactionSummary) {
      const interactionType = extraction.interactionType || 'VOICE';
      await prisma.interaction.create({
        data: {
          contactId: contact.id,
          type: interactionType,
          platform: interactionType === 'MESSAGE' ? (extraction.interactionPlatform || 'text') : null,
          summary: extraction.interactionSummary,
        },
      });
      updates.interaction = true;
    }

    // Build summary message
    const summaryParts: string[] = [];
    if (isNewContact) {
      summaryParts.push(`Created new contact: ${contact.name}`);
    } else {
      summaryParts.push(`Updated ${contact.name}`);
    }

    if (updates.preferences > 0) {
      summaryParts.push(`${updates.preferences} preference(s)`);
    }
    if (updates.familyMembers > 0) {
      summaryParts.push(`${updates.familyMembers} family member(s)`);
    }
    if (updates.seedlings > 0) {
      summaryParts.push(`${updates.seedlings} seedling(s)`);
    }
    if (updates.interaction) {
      summaryParts.push('interaction logged');
    }

    return NextResponse.json({
      success: true,
      contactId: contact.id,
      isNewContact,
      summary: summaryParts.join(', '),
      updates,
    });
  } catch (error) {
    console.error('Failed to process note:', error);
    return NextResponse.json(
      { error: 'Failed to process note. Please try again.' },
      { status: 500 }
    );
  }
}
