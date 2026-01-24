---
name: photo-capture
description: Use when working on photo/screenshot capture, image processing, or the image extraction flow. Covers image compression, Claude vision API, and the capture UI.
allowed-tools: Read, Grep, Glob, Edit, Write, Bash
---

# Photo & Screenshot Capture

Photos and screenshots are processed by Claude's vision API to extract structured contact data, similar to voice notes.

## Data Flow

1. User clicks camera button → `PhotoCapture` modal opens
2. User selects/drops image or uses camera capture (mobile)
3. Image compressed client-side if needed (max 2048x2048)
4. `POST /api/ingest` with `imageData` + `dryRun: true` → Claude extracts structured data
5. `VoicePreviewModal` displays extraction for user editing
6. `POST /api/ingest` with edited `overrides` → Data saved to SQLite

## Use Cases

- **Photo of event/meal**: Extracts who was there, what happened, food/activity preferences
- **Screenshot of text conversation**: Summarizes exchange, extracts follow-ups, identifies contact
- **Screenshot of social media**: Extracts person's name, interests, topics they posted about

## Ingest API (Image Mode)

```typescript
// Dry run - preview extraction from image
POST /api/ingest
{
  imageData: { base64: "...", mimeType: "image/jpeg" },
  additionalContext: "Dinner with Sarah", // optional
  dryRun: true
}
// Returns: { extraction: AIExtraction, existingContact, isNewContact }

// Save - with optional overrides
POST /api/ingest
{
  imageData: { base64: "...", mimeType: "image/jpeg" },
  additionalContext: "...",
  overrides: AIExtraction
}
// Returns: { contact, interaction }
```

## Image Utilities

`app/src/lib/image-utils.ts` provides:

```typescript
// Validate file type and size
validateImageFile(file: File): { valid: boolean; error?: string }

// Convert File to base64 string
fileToBase64(file: File): Promise<string>

// Compress/resize large images
compressImage(file: File, maxDimension?: number): Promise<File>
```

**Constraints:**
- Supported types: JPEG, PNG, GIF, WebP
- Max file size: 5MB
- Max dimensions: 2048x2048 (Claude vision limit)
- Compression quality: 0.8 JPEG

## Claude Vision API

`app/src/lib/anthropic.ts` - `extractFromImage()` function:

```typescript
const message = await anthropic.messages.create({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 1024,
  messages: [{
    role: 'user',
    content: [
      {
        type: 'image',
        source: {
          type: 'base64',
          media_type: 'image/jpeg',
          data: base64String,
        },
      },
      { type: 'text', text: 'Additional context...' },
    ],
  }],
  system: IMAGE_SYSTEM_PROMPT,
});
```

## Offline Behavior

Photo capture requires online connection. Unlike voice notes, images are not queued offline because:
- Base64 images are large (can't easily fit multiple in IndexedDB)
- Preview/editing requires AI processing

If offline, `showError('Photo capture requires an internet connection.')` is displayed.

## Key Files

- `app/src/components/PhotoCapture.tsx` - Camera button and capture modal
- `app/src/lib/image-utils.ts` - Compression, validation, base64 conversion
- `app/src/lib/anthropic.ts` - `extractFromImage()` with Claude vision
- `app/src/app/api/ingest/route.ts` - Handles `imageData` alongside `rawInput`
- `app/src/app/DashboardClient.tsx` - `handlePhotoCapture()` function
