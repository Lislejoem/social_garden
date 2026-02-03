/**
 * @file AI Output Schemas
 * @description Zod schemas for validating AI-generated structured output.
 * These mirror the AIExtraction and ContactBriefing TypeScript interfaces
 * and are used with Vercel AI SDK's generateObject() for type-safe responses.
 */
import { z } from 'zod';
import { INTERACTION_TYPES, PLATFORMS } from './interactions';

/** Schema for AI extraction from voice notes and images */
export const aiExtractionSchema = z.object({
  contactName: z.string().describe('The person\'s name'),
  isNewContact: z.boolean().optional().describe('True if this is about someone new'),
  location: z.string().optional().describe('City, state, or address if mentioned'),
  preferences: z.array(z.object({
    category: z.enum(['ALWAYS', 'NEVER']).describe('ALWAYS for likes, NEVER for dislikes'),
    content: z.string().describe('Description of the preference'),
    preferenceType: z.enum(['TOPIC', 'PREFERENCE']).optional().describe('TOPIC for broad interests, PREFERENCE for specific likes/dislikes'),
  })).optional(),
  familyMembers: z.array(z.object({
    name: z.string(),
    relation: z.string().describe('e.g., Partner, Son (6 yrs), Dog'),
  })).optional(),
  seedlings: z.array(z.string()).optional().describe('Future follow-up items'),
  interactionSummary: z.string().optional().describe('Brief summary of the interaction'),
  interactionType: z.enum(INTERACTION_TYPES).optional(),
  interactionPlatform: z.enum(PLATFORMS).optional().describe('Only include if interactionType is MESSAGE'),
  interactionDate: z.string().optional().describe('YYYY-MM-DD format'),
});

/** Schema for AI-generated contact briefing */
export const contactBriefingSchema = z.object({
  relationshipSummary: z.string().describe('1-2 sentence summary of the relationship'),
  recentHighlights: z.array(z.string()).describe('Key things from recent interactions (3-5 items)'),
  conversationStarters: z.array(z.string()).describe('Specific questions or topics to bring up (3-5 items)'),
  upcomingMilestones: z.array(z.string()).describe('Birthdays, events, or things to remember (2-4 items)'),
});
