---
name: contact-briefing
description: Use when working on AI-generated contact briefings, conversation prep, or briefing caching. Covers the briefing API, modal component, and cache invalidation patterns.
allowed-tools: Read, Grep, Glob, Edit, Write, Bash
---

# Contact Briefing System

AI-generated "Conversation Prep" that helps users prepare before reaching out to a contact.

## Overview

- **Button:** `ContactBriefingButton.tsx` - "Prep for Chat" button in profile header
- **Modal:** `ContactBriefingModal.tsx` - Displays briefing with loading/error/cache states
- **API:** `POST /api/contacts/[id]/briefing` - Returns cached or freshly generated briefing
- **AI Function:** `generateBriefing()` in `app/src/lib/anthropic.ts`

## Briefing Content

The AI generates four sections:
1. **Relationship Summary** - High-level overview of the relationship
2. **Recent Highlights** - Key events from recent interactions
3. **Conversation Starters** - Specific questions to ask
4. **Upcoming Milestones** - Birthdays, follow-ups to remember

## Caching System

Briefings are cached to avoid regenerating on every request.

### Cache Fields (on Contact model)
- `cachedBriefing` - JSON string of ContactBriefing
- `briefingGeneratedAt` - Timestamp when last generated

### Cache Validity
```typescript
const cacheValid = briefingGeneratedAt >= contact.updatedAt;
```

### Cache Invalidation
When any of these change, `Contact.updatedAt` is touched to invalidate the cache:
- Preferences (added/updated/deleted)
- Interactions (added/updated/deleted)
- Seedlings (added/updated/deleted)
- Family members (added/updated/deleted)

The routes that touch `updatedAt`:
- `app/src/app/api/preferences/[id]/route.ts`
- `app/src/app/api/seedlings/[id]/route.ts`
- `app/src/app/api/family-members/[id]/route.ts`
- Interactions already update contact via `/api/ingest`

### Force Refresh
Pass `?forceRefresh=true` to bypass cache:
```typescript
fetch(`/api/contacts/${id}/briefing?forceRefresh=true`, { method: 'POST' });
```

## Modal Behavior

1. Opens when "Prep for Chat" button clicked
2. Fetches briefing on first open (tracks `fetchedForContact` to avoid re-fetching)
3. Shows "Cached" badge when `fromCache: true` in response
4. Refresh button triggers force refresh
5. Close and reopen within same session shows existing briefing (no re-fetch)
6. Navigate away and back → component remounts → fetch happens, server returns cache if valid

## API Response

```typescript
{
  success: true,
  briefing: {
    relationshipSummary: string,
    recentHighlights: string[],
    conversationStarters: string[],
    upcomingMilestones: string[]
  },
  fromCache: boolean
}
```

## Key Files

- `app/src/components/ContactBriefingButton.tsx` - Button component
- `app/src/components/ContactBriefingModal.tsx` - Modal with fetch logic
- `app/src/app/api/contacts/[id]/briefing/route.ts` - API with caching
- `app/src/lib/anthropic.ts` - `generateBriefing()` function
- `app/src/types/index.ts` - `ContactBriefing` interface
