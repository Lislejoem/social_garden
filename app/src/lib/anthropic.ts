/**
 * @file AI Extraction & Briefing
 * @description Extracts structured contact data from voice notes and images,
 * and generates contact briefings using AI via the Vercel AI SDK.
 *
 * @flow
 * 1. Receives raw transcript text, image, or contact data
 * 2. Sends to AI model with system prompt defining extraction rules
 * 3. AI returns validated JSON via generateObject() + Zod schemas
 * 4. Response is returned as AIExtraction or ContactBriefing type
 *
 * @requires GOOGLE_GENERATIVE_AI_API_KEY environment variable (for extraction)
 * @requires ANTHROPIC_API_KEY environment variable (for briefings)
 */
import { generateObject } from 'ai';
import type { AIExtraction, ContactBriefing, Preference, Interaction, Seedling, FamilyMember, Cadence } from '@/types';
import { generateTypeInferencePrompt } from './interactions';
import { MODELS, logUsage } from './ai';
import { aiExtractionSchema, contactBriefingSchema } from './ai-schemas';

/** Build the extraction system prompt with today's date */
function buildExtractionPrompt(): string {
  return `You are a personal relationship assistant helping to maintain "Grove" - a personal CRM for nurturing friendships and relationships.

Extract structured data from the user's note about a person. The note may be a voice transcript, so be forgiving of minor transcription errors.

Today's date is ${new Date().toISOString().split('T')[0]}.

Guidelines:
- Only include fields that have actual data from the input
- For preferences, distinguish between things they ALWAYS want vs things to NEVER do/mention
- Seedlings are future-focused: follow-ups, gifts to consider, things to check in about
- Keep interactionSummary concise (1-2 sentences)
- Be liberal in extracting useful information - it's better to capture something than miss it
- For interactionDate: parse relative dates like "yesterday", "last week", "2 days ago" into actual dates. If no date is mentioned, omit this field.

Preference Type Classification:
- TOPIC: Broad interests, passions, or subjects they care about (e.g., "hiking", "sustainability", "AI technology", "photography", "cooking"). These are conversation topics you could discuss at length.
- PREFERENCE: Specific likes/dislikes that inform how you interact (e.g., "allergic to shellfish", "loves Italian food", "hates small talk", "prefers morning calls"). These are actionable items to remember.
- NEVER category items are always PREFERENCE (dislikes aren't "topics")
- When in doubt, use PREFERENCE (safer default)
${generateTypeInferencePrompt()}`;
}

/** Build the image extraction system prompt with today's date */
function buildImageExtractionPrompt(): string {
  return `You are a personal relationship assistant helping to maintain "Grove" - a personal CRM for nurturing friendships and relationships.

Analyze the provided image to extract relationship information. The image may be:
1. A photo of a social situation (dinner, event, meeting, etc.)
2. A screenshot of a text/messaging conversation
3. A screenshot of social media content
4. A photo of a place or activity associated with a person

Today's date is ${new Date().toISOString().split('T')[0]}.

Image-specific guidelines:
- For screenshots of conversations: identify who the conversation is with, summarize key points, extract any plans or follow-ups
- For photos of events/meals: describe the context, note any preferences revealed (food, activities, locations)
- For social media screenshots: extract the person's name, what they posted about, any relevant preferences
- If you cannot identify a specific person from the image, use context clues or ask for clarification via interactionSummary
- Only include fields that have actual data from the image

Preference Type Classification:
- TOPIC: Broad interests, passions, or subjects (e.g., "hiking", "photography", "cooking")
- PREFERENCE: Specific likes/dislikes (e.g., "loves Italian food", "allergic to shellfish")
- NEVER category items are always PREFERENCE
${generateTypeInferencePrompt()}`;
}

const BRIEFING_SYSTEM_PROMPT = `You are a personal relationship assistant helping to prepare for conversations with contacts in "Grove" - a personal CRM for nurturing friendships and relationships.

Given information about a contact, generate a helpful briefing that prepares the user to have a meaningful conversation with them.

Guidelines:
- relationshipSummary should capture who they are and the nature of your relationship
- recentHighlights should focus on important events, news, or changes from recent interactions
- conversationStarters should be specific and actionable questions based on seedlings and recent context
- upcomingMilestones should include birthdays, family events, and things you said you'd follow up on
- If there's limited information, acknowledge it and suggest getting to know them better
- Keep all items concise and actionable
- Be warm and personal in tone - these are friends and relationships, not business contacts`;

/** Image data for extractFromImage */
export interface ImageData {
  base64: string;
  mimeType: string;
}

/** Input data for generating a contact briefing */
export interface BriefingInput {
  name: string;
  preferences: Preference[];
  interactions: Interaction[];
  seedlings: Seedling[];
  familyMembers: FamilyMember[];
  birthday: Date | null;
  cadence: Cadence;
  location: string | null;
}

/**
 * Extract structured contact information from a voice note transcript.
 *
 * @param rawInput - The voice transcript text to analyze
 * @returns AIExtraction object with parsed contact data
 * @throws Error if AI fails to generate valid structured output
 *
 * @example
 * const extraction = await extractFromNote("Just talked to Sarah, she loves hiking and her son Jake is turning 5");
 * // Returns: { contactName: "Sarah", preferences: [...], familyMembers: [...], ... }
 */
export async function extractFromNote(rawInput: string): Promise<AIExtraction> {
  const result = await generateObject({
    model: MODELS.extraction,
    schema: aiExtractionSchema,
    system: buildExtractionPrompt(),
    prompt: `Extract information from this note:\n\n${rawInput}`,
  });

  logUsage('extractFromNote', MODELS.extraction.modelId, result.usage);

  return result.object as AIExtraction;
}

/**
 * Extract structured contact information from an image.
 * Uses AI vision capabilities to analyze photos and screenshots.
 *
 * @param imageData - Object with base64-encoded image and MIME type
 * @param additionalContext - Optional text context to help with extraction
 * @returns AIExtraction object with parsed contact data
 * @throws Error if AI fails to generate valid structured output
 *
 * @example
 * const extraction = await extractFromImage(
 *   { base64: "...", mimeType: "image/jpeg" },
 *   "Dinner with Sarah at her favorite restaurant"
 * );
 */
export async function extractFromImage(
  imageData: ImageData,
  additionalContext?: string
): Promise<AIExtraction> {
  const textContent = additionalContext
    ? `Additional context from user: ${additionalContext}`
    : 'Analyze this image and extract relationship information.';

  const result = await generateObject({
    model: MODELS.extraction,
    schema: aiExtractionSchema,
    system: buildImageExtractionPrompt(),
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            image: `data:${imageData.mimeType};base64,${imageData.base64}`,
          },
          {
            type: 'text',
            text: textContent,
          },
        ],
      },
    ],
  });

  logUsage('extractFromImage', MODELS.extraction.modelId, result.usage);

  return result.object as AIExtraction;
}

/**
 * Generate an AI-powered briefing for a contact.
 * Provides relationship summary, recent highlights, and conversation starters.
 *
 * @param contactData - The contact's data including preferences, interactions, etc.
 * @returns ContactBriefing with summary, highlights, starters, and milestones
 * @throws Error if AI fails to generate valid structured output
 */
export async function generateBriefing(contactData: BriefingInput): Promise<ContactBriefing> {
  const formattedData = formatContactDataForBriefing(contactData);

  const result = await generateObject({
    model: MODELS.briefing,
    schema: contactBriefingSchema,
    system: BRIEFING_SYSTEM_PROMPT,
    prompt: `Generate a briefing for ${contactData.name}:\n\n${formattedData}`,
  });

  logUsage('generateBriefing', MODELS.briefing.modelId, result.usage);

  return result.object;
}

/**
 * Format contact data into a structured string for the AI prompt.
 */
function formatContactDataForBriefing(data: BriefingInput): string {
  const sections: string[] = [];

  // Basic info
  sections.push(`Name: ${data.name}`);
  if (data.location) {
    sections.push(`Location: ${data.location}`);
  }
  sections.push(`Contact Frequency: ${data.cadence}`);

  // Birthday
  if (data.birthday) {
    sections.push(`Birthday: ${data.birthday.toLocaleDateString()}`);
  }

  // Family members
  if (data.familyMembers.length > 0) {
    sections.push('\nImportant People:');
    data.familyMembers.forEach((fm) => {
      sections.push(`- ${fm.name} (${fm.relation})`);
    });
  }

  // Preferences
  const alwaysPrefs = data.preferences.filter((p) => p.category === 'ALWAYS');
  const neverPrefs = data.preferences.filter((p) => p.category === 'NEVER');

  if (alwaysPrefs.length > 0) {
    sections.push('\nThings they like (ALWAYS):');
    alwaysPrefs.forEach((p) => sections.push(`- ${p.content}`));
  }

  if (neverPrefs.length > 0) {
    sections.push('\nThings to avoid (NEVER):');
    neverPrefs.forEach((p) => sections.push(`- ${p.content}`));
  }

  // Active seedlings (follow-ups)
  const activeSeedlings = data.seedlings.filter((s) => s.status === 'ACTIVE');
  if (activeSeedlings.length > 0) {
    sections.push('\nActive Follow-ups:');
    activeSeedlings.forEach((s) => sections.push(`- ${s.content}`));
  }

  // Recent interactions (last 10)
  if (data.interactions.length > 0) {
    sections.push('\nRecent Interactions:');
    const recentInteractions = data.interactions.slice(0, 10);
    recentInteractions.forEach((i) => {
      const date = new Date(i.date).toLocaleDateString();
      sections.push(`- [${date}] ${i.type}: ${i.summary}`);
    });
  }

  return sections.join('\n');
}
