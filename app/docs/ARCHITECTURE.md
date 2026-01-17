# Social Garden Architecture

## Overview

Social Garden is a personal CRM app that uses AI to process voice notes and extract relationship information. Built with Next.js 14, it follows a server-first architecture with client components for interactivity.

## Data Flow

### Voice Note Processing

```
┌─────────────────┐
│   User speaks   │
│   into browser  │
└────────┬────────┘
         │
         v
┌─────────────────┐
│  Web Speech API │  (Browser-native, Chrome/Edge only)
│  Transcription  │
└────────┬────────┘
         │ transcript string
         v
┌─────────────────┐
│  VoiceRecorder  │  Client Component
│  Component      │
└────────┬────────┘
         │ onTranscriptComplete(transcript)
         v
┌─────────────────┐
│  POST /api/     │
│  ingest         │  dryRun=true
│  (preview)      │
└────────┬────────┘
         │
         v
┌─────────────────┐
│  Claude AI      │  Extracts structured data:
│  (Anthropic)    │  - contactName, location
└────────┬────────┘  - preferences (ALWAYS/NEVER)
         │           - familyMembers
         v           - seedlings (follow-ups)
┌─────────────────┐  - interactionSummary
│  VoicePreview   │
│  Modal          │  User can edit extracted data
└────────┬────────┘
         │ edited data
         v
┌─────────────────┐
│  POST /api/     │
│  ingest         │  dryRun=false, overrides=editedData
│  (save)         │
└────────┬────────┘
         │
         v
┌─────────────────┐
│  SQLite via     │  Creates/updates:
│  Prisma         │  Contact, Preferences, FamilyMembers,
└────────┬────────┘  Seedlings, Interaction
         │
         v
┌─────────────────┐
│  router.refresh │  Refetches server data
│  ()             │
└─────────────────┘
```

## Component Hierarchy

```
layout.tsx (Server)
│
├── page.tsx (Server - Dashboard)
│   └── DashboardClient.tsx (Client)
│       ├── SearchBar.tsx
│       ├── ContactCard.tsx (×n)
│       ├── VoiceRecorder.tsx
│       ├── VoicePreviewModal.tsx
│       └── ConfirmationToast.tsx
│
└── contact/[id]/page.tsx (Server - Profile)
    └── ProfileClient.tsx (Client)
        ├── EditableText.tsx
        ├── EditableCadence.tsx
        ├── EditableFamilyMember.tsx (×n)
        ├── EditablePreference.tsx (×n)
        ├── EditableSeedling.tsx (×n)
        ├── InteractionTimeline.tsx
        ├── VoiceRecorder.tsx
        ├── VoicePreviewModal.tsx
        └── ConfirmationToast.tsx
```

## API Structure

```
/api
├── /contacts
│   ├── GET     → List all contacts
│   ├── POST    → Create contact
│   └── /[id]
│       ├── GET     → Get contact with relations
│       ├── PUT     → Update contact fields
│       ├── DELETE  → Delete contact (cascades)
│       └── /seedlings
│           └── POST → Add seedling to contact
│
├── /preferences/[id]
│   ├── PUT     → Update preference
│   └── DELETE  → Delete preference
│
├── /family-members/[id]
│   ├── PUT     → Update family member
│   └── DELETE  → Delete family member
│
├── /seedlings/[id]
│   ├── PUT     → Update seedling (content or status)
│   └── DELETE  → Delete seedling
│
└── /ingest
    └── POST    → Process voice note (AI extraction)
                  - dryRun=true → Preview
                  - dryRun=false → Save
```

## Database Schema

```
┌───────────────┐       ┌───────────────┐
│   Contact     │       │  Preference   │
├───────────────┤       ├───────────────┤
│ id            │←──┐   │ id            │
│ name          │   │   │ contactId  ───┤
│ avatarUrl     │   │   │ category      │  ALWAYS | NEVER
│ location      │   │   │ content       │
│ birthday      │   │   └───────────────┘
│ cadence       │   │
│ socials (JSON)│   │   ┌───────────────┐
│ createdAt     │   │   │  Interaction  │
│ updatedAt     │   │   ├───────────────┤
└───────────────┘   │   │ id            │
                    ├───│ contactId     │
                    │   │ date          │
                    │   │ type          │  CALL | TEXT | MEET | VOICE
                    │   │ summary       │
                    │   └───────────────┘
                    │
                    │   ┌───────────────┐
                    │   │   Seedling    │
                    │   ├───────────────┤
                    │   │ id            │
                    ├───│ contactId     │
                    │   │ content       │
                    │   │ status        │  ACTIVE | PLANTED
                    │   │ createdAt     │
                    │   └───────────────┘
                    │
                    │   ┌───────────────┐
                    │   │ FamilyMember  │
                    │   ├───────────────┤
                    │   │ id            │
                    └───│ contactId     │
                        │ name          │
                        │ relation      │
                        └───────────────┘
```

## Health System

Relationship health is computed dynamically based on:
1. **Cadence** - Desired contact frequency
2. **Last Interaction** - Most recent interaction date

```
                    THRIVING    GROWING     THIRSTY     PARCHED
Cadence             (<50%)      (<100%)     (<parched)  (>parched)
─────────────────────────────────────────────────────────────────
OFTEN               0-5 days    5-10 days   10-14 days  14+ days
REGULARLY           0-15 days   15-30 days  30-45 days  45+ days
SELDOMLY            0-45 days   45-90 days  90-120 days 120+ days
RARELY              0-90 days   90-180 days 180-365 days 365+ days
```

Health is displayed with themed colors and icons:
- **Thriving** (Flower) - emerald-100
- **Growing** (Sprout) - emerald-50
- **Thirsty** (Leaf) - lime-50
- **Parched** (Droplets) - orange-50

## State Management

No global state library - uses local component state:

| State | Location | Purpose |
|-------|----------|---------|
| `previewData` | DashboardClient, ProfileClient | Voice preview modal data |
| `toastMessage` | DashboardClient, ProfileClient | Confirmation notifications |
| `editingField` | VoicePreviewModal | Current field being edited |
| `isEditing` | Editable* components | Edit mode toggle |

## Key Files Quick Reference

| Purpose | File |
|---------|------|
| AI Extraction | `src/lib/anthropic.ts` |
| Health Calculation | `src/lib/health.ts` |
| Type Definitions | `src/types/index.ts` |
| Database Schema | `prisma/schema.prisma` |
| Voice Note API | `src/app/api/ingest/route.ts` |
| Dashboard | `src/app/DashboardClient.tsx` |
| Contact Profile | `src/app/contact/[id]/ProfileClient.tsx` |
