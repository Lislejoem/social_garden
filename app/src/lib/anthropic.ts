/**
 * @file Anthropic Claude API Integration
 * @description Extracts structured contact data from voice note transcripts using Claude AI.
 *
 * @flow
 * 1. Receives raw transcript text from voice note
 * 2. Sends to Claude with SYSTEM_PROMPT defining extraction rules
 * 3. Claude returns JSON with contact info, preferences, family, seedlings
 * 4. Response is parsed and returned as AIExtraction type
 *
 * @requires ANTHROPIC_API_KEY environment variable
 */
import Anthropic from '@anthropic-ai/sdk';
import type { AIExtraction, ContactBriefing, Preference, Interaction, Seedling, FamilyMember, Cadence } from '@/types';
import { generateTypeInferencePrompt, INTERACTION_TYPES, PLATFORMS } from './interactions';

/** Anthropic client instance (uses ANTHROPIC_API_KEY from env) */
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are a personal relationship assistant helping to maintain a "Social Garden" - a personal CRM for nurturing friendships and relationships.

Extract structured data from the user's note about a person. The note may be a voice transcript, so be forgiving of minor transcription errors.

Today's date is ${new Date().toISOString().split('T')[0]}.

Return ONLY valid JSON with this structure:
{
  "contactName": "string (required - the person's name)",
  "isNewContact": boolean (true if this seems to be about someone new, false if updating existing),
  "location": "string or null (city, state, or full address if mentioned)",
  "preferences": [
    {"category": "ALWAYS", "content": "description", "preferenceType": "TOPIC or PREFERENCE"},
    {"category": "NEVER", "content": "things to avoid", "preferenceType": "PREFERENCE"}
  ],
  "familyMembers": [
    {"name": "string", "relation": "string (e.g., 'Partner', 'Son (6 yrs)', 'Dog')"}
  ],
  "seedlings": ["string - future follow-up items, things to remember to ask about"],
  "interactionSummary": "string - brief summary of this interaction/conversation",
  "interactionType": "${INTERACTION_TYPES.join(' | ')}",
  "interactionPlatform": "${PLATFORMS.join(' | ')}" (only include if interactionType is MESSAGE),
  "interactionDate": "YYYY-MM-DD format - when the interaction occurred"
}

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

/**
 * Extract structured contact information from a voice note transcript.
 *
 * @param rawInput - The voice transcript text to analyze
 * @returns AIExtraction object with parsed contact data
 * @throws Error if Claude returns no text or invalid JSON
 *
 * @example
 * const extraction = await extractFromNote("Just talked to Sarah, she loves hiking and her son Jake is turning 5");
 * // Returns: { contactName: "Sarah", preferences: [...], familyMembers: [...], ... }
 */
export async function extractFromNote(rawInput: string): Promise<AIExtraction> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Extract information from this note:\n\n${rawInput}`,
      },
    ],
    system: SYSTEM_PROMPT,
  });

  // Extract the text content from the response
  const textContent = message.content.find((block) => block.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from Claude');
  }

  // Parse the JSON response
  try {
    // Try to find JSON in the response (Claude sometimes adds extra text)
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    return JSON.parse(jsonMatch[0]) as AIExtraction;
  } catch (e) {
    console.error('Failed to parse Claude response:', textContent.text);
    throw new Error('Failed to parse AI response as JSON');
  }
}

/** Supported image MIME types for Claude vision API */
type ImageMediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

/** Image data for extractFromImage */
export interface ImageData {
  base64: string;
  mimeType: ImageMediaType | string;
}

const IMAGE_SYSTEM_PROMPT = `You are a personal relationship assistant helping to maintain a "Social Garden" - a personal CRM for nurturing friendships and relationships.

Analyze the provided image to extract relationship information. The image may be:
1. A photo of a social situation (dinner, event, meeting, etc.)
2. A screenshot of a text/messaging conversation
3. A screenshot of social media content
4. A photo of a place or activity associated with a person

Today's date is ${new Date().toISOString().split('T')[0]}.

Return ONLY valid JSON with this structure:
{
  "contactName": "string (required - the person's name, infer from context or conversation)",
  "isNewContact": boolean (true if this seems to be about someone new, false if updating existing),
  "location": "string or null (if identifiable from image or context)",
  "preferences": [
    {"category": "ALWAYS", "content": "description", "preferenceType": "TOPIC or PREFERENCE"},
    {"category": "NEVER", "content": "things to avoid", "preferenceType": "PREFERENCE"}
  ],
  "familyMembers": [
    {"name": "string", "relation": "string (e.g., 'Partner', 'Son (6 yrs)', 'Dog')"}
  ],
  "seedlings": ["string - future follow-up items, things to remember to ask about"],
  "interactionSummary": "string - brief summary of what the image shows about the interaction",
  "interactionType": "${INTERACTION_TYPES.join(' | ')}",
  "interactionPlatform": "${PLATFORMS.join(' | ')}" (only include if interactionType is MESSAGE),
  "interactionDate": "YYYY-MM-DD format - if date is visible or mentioned"
}

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

/**
 * Extract structured contact information from an image.
 * Uses Claude's vision capabilities to analyze photos and screenshots.
 *
 * @param imageData - Object with base64-encoded image and MIME type
 * @param additionalContext - Optional text context to help with extraction
 * @returns AIExtraction object with parsed contact data
 * @throws Error if Claude returns no text or invalid JSON
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
  // Validate and cast mimeType to allowed values
  const validTypes: ImageMediaType[] = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const mediaType = validTypes.includes(imageData.mimeType as ImageMediaType)
    ? (imageData.mimeType as ImageMediaType)
    : 'image/jpeg'; // Default to JPEG if unknown type

  const contentBlocks: Array<
    | { type: 'image'; source: { type: 'base64'; media_type: ImageMediaType; data: string } }
    | { type: 'text'; text: string }
  > = [
    {
      type: 'image',
      source: {
        type: 'base64',
        media_type: mediaType,
        data: imageData.base64,
      },
    },
  ];

  // Add text context if provided
  if (additionalContext) {
    contentBlocks.push({
      type: 'text',
      text: `Additional context from user: ${additionalContext}`,
    });
  } else {
    contentBlocks.push({
      type: 'text',
      text: 'Analyze this image and extract relationship information.',
    });
  }

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: contentBlocks,
      },
    ],
    system: IMAGE_SYSTEM_PROMPT,
  });

  // Extract the text content from the response
  const textContent = message.content.find((block) => block.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from Claude');
  }

  // Parse the JSON response
  try {
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    return JSON.parse(jsonMatch[0]) as AIExtraction;
  } catch (e) {
    console.error('Failed to parse Claude image response:', textContent.text);
    throw new Error('Failed to parse AI response as JSON');
  }
}

const BRIEFING_SYSTEM_PROMPT = `You are a personal relationship assistant helping to prepare for conversations with contacts in a "Social Garden" - a personal CRM for nurturing friendships and relationships.

Given information about a contact, generate a helpful briefing that prepares the user to have a meaningful conversation with them.

Return ONLY valid JSON with this structure:
{
  "relationshipSummary": "string - 1-2 sentence high-level summary of the relationship and what you know about them",
  "recentHighlights": ["string - key things that happened in recent interactions (3-5 items max)"],
  "conversationStarters": ["string - specific questions or topics to bring up based on their situation (3-5 items)"],
  "upcomingMilestones": ["string - birthdays, events, or things to remember (2-4 items max)"]
}

Guidelines:
- relationshipSummary should capture who they are and the nature of your relationship
- recentHighlights should focus on important events, news, or changes from recent interactions
- conversationStarters should be specific and actionable questions based on seedlings and recent context
- upcomingMilestones should include birthdays, family events, and things you said you'd follow up on
- If there's limited information, acknowledge it and suggest getting to know them better
- Keep all items concise and actionable
- Be warm and personal in tone - these are friends and relationships, not business contacts`;

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
 * Generate an AI-powered briefing for a contact.
 * Provides relationship summary, recent highlights, and conversation starters.
 *
 * @param contactData - The contact's data including preferences, interactions, etc.
 * @returns ContactBriefing with summary, highlights, starters, and milestones
 * @throws Error if Claude returns no text or invalid JSON
 */
export async function generateBriefing(contactData: BriefingInput): Promise<ContactBriefing> {
  // Format the contact data for the prompt
  const formattedData = formatContactDataForBriefing(contactData);

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Generate a briefing for ${contactData.name}:\n\n${formattedData}`,
      },
    ],
    system: BRIEFING_SYSTEM_PROMPT,
  });

  // Extract the text content from the response
  const textContent = message.content.find((block) => block.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from Claude');
  }

  // Parse the JSON response
  try {
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    return JSON.parse(jsonMatch[0]) as ContactBriefing;
  } catch (e) {
    console.error('Failed to parse Claude briefing response:', textContent.text);
    throw new Error('Failed to parse AI response as JSON');
  }
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
