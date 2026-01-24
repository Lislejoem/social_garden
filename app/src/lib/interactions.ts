/**
 * @file Interaction Types and Platforms Configuration
 * @description Single source of truth for interaction types and messaging platforms.
 *
 * To add a new platform (e.g., WhatsApp):
 * 1. Add to PLATFORMS array
 * 2. Add keywords to PLATFORM_KEYWORDS
 * 3. Add display label to PLATFORM_LABELS
 *
 * To add a new interaction type (e.g., EMAIL):
 * 1. Add to INTERACTION_TYPES array
 * 2. Add keywords to TYPE_KEYWORDS
 * 3. Add display label to TYPE_LABELS
 *
 * The AI prompt, UI, and types will automatically update.
 */

// Interaction types - VOICE should be last (it's the default fallback)
export const INTERACTION_TYPES = ['CALL', 'MESSAGE', 'MEET', 'VOICE'] as const;
export type InteractionType = typeof INTERACTION_TYPES[number];

// Message platforms - text should be first (it's the default)
export const PLATFORMS = ['text', 'instagram', 'telegram', 'linkedin'] as const;
export type MessagePlatform = typeof PLATFORMS[number];

// Keywords used by AI to infer interaction type from voice note content
export const TYPE_KEYWORDS: Record<InteractionType, string[]> = {
  CALL: ['called', 'spoke on the phone', 'phoned', 'had a call', 'phone call', 'talked on the phone'],
  MEET: ['met', 'saw', 'grabbed coffee', 'grabbed lunch', 'hung out', 'ran into', 'dinner with', 'visited', 'coffee with', 'lunch with', 'drinks with'],
  MESSAGE: ['texted', 'messaged', 'DMed', 'sent a message', 'chatted online', 'sent a text'],
  VOICE: [], // Default when no clear interaction method is mentioned
};

// Keywords used by AI to infer platform from voice note content
export const PLATFORM_KEYWORDS: Record<MessagePlatform, string[]> = {
  text: ['texted', 'text message', 'SMS', 'iMessage', 'sent a text'],
  instagram: ['instagram', 'IG', 'insta DM', 'insta', 'on Instagram'],
  telegram: ['telegram', 'on Telegram'],
  linkedin: ['linkedin', 'LinkedIn message', 'on LinkedIn'],
};

// UI display labels for interaction types
export const TYPE_LABELS: Record<InteractionType, string> = {
  CALL: 'Call',
  MESSAGE: 'Message',
  MEET: 'Meet',
  VOICE: 'Voice Note',
};

// UI display labels for platforms
export const PLATFORM_LABELS: Record<MessagePlatform, string> = {
  text: 'Text',
  instagram: 'Instagram',
  telegram: 'Telegram',
  linkedin: 'LinkedIn',
};

/**
 * Generate the AI prompt section for inferring interaction type and platform.
 * This is automatically included in the extraction prompt.
 */
export function generateTypeInferencePrompt(): string {
  const typeGuidelines = INTERACTION_TYPES
    .filter(t => TYPE_KEYWORDS[t].length > 0)
    .map(t => `- ${t}: Look for "${TYPE_KEYWORDS[t].join('", "')}"`)
    .join('\n');

  const platformGuidelines = PLATFORMS
    .map(p => `- ${p}: "${PLATFORM_KEYWORDS[p].join('", "')}"`)
    .join('\n');

  return `
Interaction Type Inference:
${typeGuidelines}
- VOICE: Default when no clear interaction method is mentioned

Platform Detection (only for MESSAGE type):
${platformGuidelines}
If platform unclear but it's a message, default to "text".
`;
}
