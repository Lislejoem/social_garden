# Foundational Rules

## Our Working Relationship

- We're colleagues working together. I'm "Joe", you're "Claude". You MUST use these names so any communication is abundantly clear. There's no hierarchy.
- YOU MUST call out bad ideas, unreasonable expectations, and mistakes - I depend on this.
- You have issues with memory formation both during and between conversations. Use skills and documentation religiously to remember things before you forget them.

## Test Driven Development  (TDD)
 
- FOR EVERY NEW FEATURE OR BUGFIX, YOU MUST follow Test Driven Development :
    1. Write a failing test that correctly validates the desired functionality
    2. Run the test to confirm it fails as expected
    3. Write ONLY enough code to make the failing test pass
    4. Run the test to confirm success
    5. Refactor if needed while keeping tests green

## Testing

Tests use Vitest with React Testing Library. Test files follow `*.test.ts(x)` pattern.

```bash
npm test             # Watch mode
npm run test:run     # Single run
```

Test configuration in `vitest.config.ts`. Mocking Anthropic SDK requires `vi.hoisted()` for proper initialization order.

## Writing Code

- YOU MUST make the SMALLEST reasonable changes to achieve the desired outcome.
- YOU MUST WORK HARD to reduce code duplication, even if the refactoring takes extra effort.
- Fix broken things immediately when you find them. Don't ask permission to fix bugs.

## Naming

- Names MUST tell what code does, not how it's implemented or its history
- When changing code, never document the old behavior or the behavior change

## At the end of each plan, do these

- Review and update `CLAUDE.md` and relevant skills, subagents, documentation, and test files with every code run to ensure they are always up to date. If a skill, subagent, documentation file, or test file is missing, create one.
- Update `docs/PRODUCT_VISION.md` to reflect the current state of the project. Add recommendations for next steps and update other listed features based on what was just updated.

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
npm test             # Run tests in watch mode (Vitest)
npm run test:run     # Run tests once
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
- **Contact:** Person info (name, location, birthday, birthdayMonth, birthdayDay, cadence, socials)
- **Preference:** ALWAYS/NEVER items (likes, dislikes, allergies)
- **Interaction:** Contact log (CALL, MESSAGE, MEET, VOICE with summary + platform for MESSAGE type)
- **Seedling:** Follow-up items (ACTIVE or PLANTED status)
- **FamilyMember:** Related people (partner, children, pets)

TypeScript interfaces at `app/src/types/index.ts`.

### Interaction Types
Centralized in `app/src/lib/interactions.ts`. To add a new platform/type, update only this file.

- `CALL` - Phone call
- `MESSAGE` - Text/chat message with platform: text, instagram, telegram, linkedin
- `MEET` - In-person meeting
- `VOICE` - Voice note (default when type can't be inferred)

AI automatically infers interaction type from voice note content (e.g., "grabbed coffee" → MEET).

## Code Style

- Functional React components with TypeScript
- Named exports preferred
- Import aliases: `@/` maps to `src/`
- Color palette: emerald (primary), stone (neutral)
- Custom border radius: `rounded-4xl`, `rounded-5xl`, `rounded-6xl`

## Key Files

- **AI Integration:** `app/src/lib/anthropic.ts` - extractFromNote() and generateBriefing() functions
- **Avatar Utilities:** `app/src/lib/avatar.ts` - getGravatarUrl(), resolveAvatarUrl(), getAvailableAvatarSources()
- **Health Logic:** `app/src/lib/health.ts` - calculateHealth(), formatLastContact()
- **Birthday Logic:** `app/src/lib/birthday.ts` - Age, zodiac, countdown calculations
- **Interactions Config:** `app/src/lib/interactions.ts` - Types, platforms, keywords for AI inference
- **Voice Processing API:** `app/src/app/api/ingest/route.ts` - Voice note processing
- **Briefing API:** `app/src/app/api/contacts/[id]/briefing/route.ts` - AI briefing generation
- **Types:** `app/src/types/index.ts` - All TypeScript interfaces

## API Routes

| Route | Methods | Description |
|-------|---------|-------------|
| `/api/ingest` | POST | Voice note & manual interaction AI processing (dry-run + save) |
| `/api/contacts` | GET, POST | List all contacts, create new contact |
| `/api/contacts/[id]` | GET, PUT, DELETE | Single contact CRUD |
| `/api/contacts/[id]/briefing` | POST | Generate AI-powered contact briefing |
| `/api/interactions` | POST | Create new interaction |
| `/api/interactions/[id]` | PUT, DELETE | Update/delete interaction |
| `/api/preferences/[id]` | PUT, DELETE | Update/delete preference |
| `/api/seedlings/[id]` | PUT, DELETE | Update/delete seedling |
| `/api/family-members/[id]` | PUT, DELETE | Update/delete family member |

## Components

### Core UI Components
| Component | Description |
|-----------|-------------|
| `ContactCard.tsx` | Dashboard card showing contact health, name, preferences |
| `ContactBriefing.tsx` | AI-generated conversation prep (summary, highlights, starters) |
| `QuickLogInteraction.tsx` | Quick tap buttons for logging calls/texts/meetings. With summary: uses AI processing via `/api/ingest`. Without summary: direct save to `/api/interactions`. |
| `BirthdaySection.tsx` | Birthday display/edit with zodiac and countdown |
| `EditSocialsModal.tsx` | Modal for editing social links |
| `EditAvatarModal.tsx` | Modal for editing avatar (manual URL or Gravatar) |
| `InteractionTimeline.tsx` | Timeline of recent interactions |
| `EditableInteraction.tsx` | Editable interaction item in timeline |
| `FilterPresets.tsx` | Dashboard filter buttons (All/Needs Water/Birthdays) |
| `SearchBar.tsx` | Dashboard search input |

### Editable Components
| Component | Description |
|-----------|-------------|
| `EditableText.tsx` | Inline text editing with hover reveal |
| `EditableCadence.tsx` | Cadence dropdown editor |
| `EditableLocation.tsx` | Location field editor |
| `EditablePreference.tsx` | Single preference item editor |
| `EditableSeedling.tsx` | Seedling item editor with status toggle |
| `EditableFamilyMember.tsx` | Family member editor |

### Voice Components
| Component | Description |
|-----------|-------------|
| `VoiceButton.tsx` | Recording button with Web Speech API |
| `VoicePreviewModal.tsx` | Preview/edit AI extraction before save |

## Gotchas

- `socials` field stored as JSON string in SQLite, parsed in components
- Next.js 14 async params: `const { id } = await params` (not destructure directly)
- Web Speech API only works in Chrome/Edge (not Firefox/Safari)
- ANTHROPIC_API_KEY required in `.env.local`