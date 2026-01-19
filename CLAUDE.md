# Social Garden

Personal CRM app for nurturing relationships. Voice notes are transcribed and processed by Claude AI to extract contact information, preferences, family members, and follow-up items.

## Tech Stack

- **Framework:** Next.js 14.2 with App Router
- **Language:** TypeScript 5 (strict mode)
- **Database:** SQLite with Prisma 5.22
- **Styling:** Tailwind CSS 3.4
- **AI:** Anthropic Claude API (@anthropic-ai/sdk)
- **Icons:** lucide-react

## Directory Structure

```
app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Dashboard (server component)
│   │   ├── DashboardClient.tsx # Dashboard interactivity
│   │   ├── contact/
│   │   │   ├── new/           # New contact form
│   │   │   └── [id]/          # Contact profile pages
│   │   └── api/               # API routes
│   │       ├── ingest/        # Voice note AI processing
│   │       ├── contacts/      # Contact CRUD
│   │       ├── preferences/   # Preference CRUD
│   │       ├── seedlings/     # Follow-up items
│   │       └── family-members/
│   ├── components/            # React components (all client-side)
│   ├── lib/                   # Utilities
│   │   ├── anthropic.ts      # Claude AI integration
│   │   ├── health.ts         # Health status calculation
│   │   └── prisma.ts         # Database client
│   └── types/                 # TypeScript interfaces
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── dev.db                # SQLite database
└── public/                    # Static assets
```

## Commands

```bash
npm run dev          # Start development server (port 3000)
npm run build        # Production build
npm run lint         # ESLint check
npx prisma studio    # Visual database browser
npx prisma db push   # Sync schema to database
npx prisma generate  # Regenerate Prisma client
```

## Architecture

### Data Flow (Voice Note Processing)

1. User records voice → Web Speech API transcribes (browser-native)
2. POST to `/api/ingest` with `dryRun: true` → Claude extracts structured data
3. VoicePreviewModal displays extraction for user editing
4. POST to `/api/ingest` with edited `overrides` → Data saved to SQLite

### Component Patterns

- **Server Components:** `page.tsx` files fetch data directly
- **Client Components:** `*Client.tsx` suffix for interactivity (state, events)
- **Editable Components:** `Editable*.tsx` for inline editing (text, cadence, etc.)

### Health System

Relationship health computed from `cadence` vs days since last interaction:

| Cadence | Thriving | Growing | Thirsty | Parched |
|---------|----------|---------|---------|---------|
| OFTEN | <5 days | <10 days | <14 days | 14+ days |
| REGULARLY | <15 days | <30 days | <45 days | 45+ days |
| SELDOMLY | <45 days | <90 days | <120 days | 120+ days |
| RARELY | <90 days | <180 days | <365 days | 365+ days |

See `app/src/lib/health.ts` for implementation.

## Data Models

Five core models in `app/prisma/schema.prisma`:
- **Contact:** Person info (name, location, birthday, cadence, socials)
- **Preference:** ALWAYS/NEVER items (likes, dislikes, allergies)
- **Interaction:** Contact log (CALL, TEXT, MEET, VOICE with summary)
- **Seedling:** Follow-up items (ACTIVE or PLANTED status)
- **FamilyMember:** Related people (partner, children, pets)

TypeScript interfaces at `app/src/types/index.ts`.

## Code Style

- Functional React components with TypeScript
- Named exports preferred
- Import aliases: `@/` maps to `src/`
- Color palette: emerald (primary), stone (neutral)
- Custom border radius: `rounded-4xl`, `rounded-5xl`, `rounded-6xl`

## Key Files

- **AI Extraction:** `app/src/lib/anthropic.ts` - Claude system prompt and parsing
- **Health Logic:** `app/src/lib/health.ts` - calculateHealth(), formatLastContact()
- **Main API:** `app/src/app/api/ingest/route.ts` - Voice note processing
- **Types:** `app/src/types/index.ts` - All TypeScript interfaces

## Gotchas

- `socials` field stored as JSON string in SQLite, parsed in components
- Next.js 14 async params: `const { id } = await params` (not destructure directly)
- Web Speech API only works in Chrome/Edge (not Firefox/Safari)
- No test framework installed yet
- ANTHROPIC_API_KEY required in `.env.local`

## At the end of each plan, do these

- Review and update `CLAUDE.md`, skills, subagents, and documentation files with every code run to ensure they are always up to date. If a file is missing, add one.
- Update `docs/PRODUCT_VISION.md` to reflect the current state of the project. Add recommendations for next steps.