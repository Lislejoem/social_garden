---
name: voice-processing
description: Use when working on voice notes, AI extraction, interaction logging, or the ingest API. Covers the dry-run preview flow and manual interaction parsing.
allowed-tools: Read, Grep, Glob, Edit, Write, Bash
---

# Voice Processing & AI Extraction

Voice notes are transcribed and processed by Claude AI to extract structured contact data.

## Data Flow

1. User records voice → Web Speech API transcribes (browser-native, Chrome/Edge only)
2. `POST /api/ingest` with `dryRun: true` → Claude extracts structured data
3. `VoicePreviewModal` displays extraction for user editing
4. `POST /api/ingest` with edited `overrides` → Data saved to SQLite

## Ingest API

```typescript
// Dry run - preview extraction
POST /api/ingest
{ rawInput: "...", contactId: "...", dryRun: true }
// Returns: { extraction: AIExtraction, existingContact, isNewContact }

// Save - with optional overrides
POST /api/ingest
{ rawInput: "...", contactId: "...", overrides: AIExtraction }
// Returns: { contact, interaction }
```

## AI Extraction Structure

```typescript
interface AIExtraction {
  contactName: string;
  location?: string;
  preferences: {
    category: 'ALWAYS' | 'NEVER';
    content: string;
    preferenceType?: 'TOPIC' | 'PREFERENCE';  // Semantic classification
  }[];
  familyMembers: { name: string; relation: string }[];
  seedlings: { content: string }[];
  interactionSummary?: string;
  interactionType?: 'CALL' | 'MESSAGE' | 'MEET' | 'VOICE';
  messagePlatform?: 'text' | 'instagram' | 'telegram' | 'linkedin';
}
```

## Preference Type Classification

AI classifies each preference as either:

- **TOPIC**: Broad interests, passions, subjects they care about
  - Examples: "hiking", "sustainability", "AI technology", "photography"
  - These are conversation topics you could discuss at length
  - Only ALWAYS preferences can be TOPIC

- **PREFERENCE**: Specific likes/dislikes that inform how you interact
  - Examples: "allergic to shellfish", "loves Italian food", "hates small talk"
  - These are actionable items to remember
  - NEVER category items are always PREFERENCE

The "Topics They Care About" section on contact profiles filters by `preferenceType === 'TOPIC'`.

## Interaction Type Inference

AI infers interaction type from content using keywords in `app/src/lib/interactions.ts`:

- "called", "phone" → CALL
- "texted", "messaged", "DM" → MESSAGE
- "coffee", "lunch", "met up" → MEET
- Platform keywords: "instagram" → MESSAGE with platform: 'instagram'

## Manual Interaction Parsing

`QuickLogInteraction` component supports two modes:

1. **Without summary:** Direct save to `/api/interactions` (no AI)
2. **With summary:** Builds prompt via `buildRawInput()`, sends to `/api/ingest`, shows `VoicePreviewModal` for review

## Adding New Platforms

Update only `app/src/lib/interactions.ts`:
1. Add to `PLATFORMS` array
2. Add keywords to `PLATFORM_KEYWORDS`
3. Add label to `PLATFORM_LABELS`

AI prompt, UI, and types auto-update.

## Key Files

- `app/src/app/api/ingest/route.ts` - Main processing endpoint
- `app/src/lib/anthropic.ts` - `extractFromNote()` function
- `app/src/lib/interactions.ts` - Types, platforms, keywords config
- `app/src/components/VoicePreviewModal.tsx` - Preview/edit before save
- `app/src/components/VoiceRecorder.tsx` - Recording button
- `app/src/components/QuickLogInteraction.tsx` - Manual logging with optional AI
