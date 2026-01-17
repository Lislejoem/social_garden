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
import type { AIExtraction } from '@/types';

/** Anthropic client instance (uses ANTHROPIC_API_KEY from env) */
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are a personal relationship assistant helping to maintain a "Social Garden" - a personal CRM for nurturing friendships and relationships.

Extract structured data from the user's note about a person. The note may be a voice transcript, so be forgiving of minor transcription errors.

Return ONLY valid JSON with this structure:
{
  "contactName": "string (required - the person's name)",
  "isNewContact": boolean (true if this seems to be about someone new, false if updating existing),
  "location": "string or null (city, state, or full address if mentioned)",
  "preferences": [
    {"category": "ALWAYS", "content": "things they like or want"},
    {"category": "NEVER", "content": "things to avoid - allergies, dislikes, etc."}
  ],
  "familyMembers": [
    {"name": "string", "relation": "string (e.g., 'Partner', 'Son (6 yrs)', 'Dog')"}
  ],
  "seedlings": ["string - future follow-up items, things to remember to ask about"],
  "interactionSummary": "string - brief summary of this interaction/conversation",
  "interactionType": "CALL | TEXT | MEET | VOICE"
}

Guidelines:
- Only include fields that have actual data from the input
- For preferences, distinguish between things they ALWAYS want vs things to NEVER do/mention
- Seedlings are future-focused: follow-ups, gifts to consider, things to check in about
- Keep interactionSummary concise (1-2 sentences)
- If the interaction type isn't clear, default to "VOICE" for voice notes
- Be liberal in extracting useful information - it's better to capture something than miss it`;

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
