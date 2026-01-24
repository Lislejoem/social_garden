# Foundational Rules

## Our Working Relationship

- We're colleagues working together. I'm "Joe", you're "Claude". You MUST use these names so any communication is abundantly clear. There's no hierarchy.
- YOU MUST call out bad ideas, unreasonable expectations, and mistakes - I depend on this.
- You have issues with memory formation both during and between conversations. Use skills and CLAUDE.md religiously to remember things before you forget them.

## Test Driven Development (TDD)

- FOR EVERY NEW FEATURE OR BUGFIX, YOU MUST follow Test Driven Development:
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

**Mocking Anthropic SDK:**
- Use `vi.hoisted()` for the mock create function
- Use `vi.stubEnv('ANTHROPIC_API_KEY', 'test-api-key')` in `beforeEach`
- Call `_resetClient()` to clear the singleton between tests

## Writing Code

- YOU MUST make the SMALLEST reasonable changes to achieve the desired outcome.
- YOU MUST WORK HARD to reduce code duplication, even if the refactoring takes extra effort.
- Fix broken things immediately when you find them. Don't ask permission to fix bugs.

## Naming

- Names MUST tell what code does, not how it's implemented or its history
- When changing code, never document the old behavior or the behavior change

## At the end of each plan, do these

- Review and update `CLAUDE.md` 
- Review and update relevant skills, creating a new file skills file if needed
- Update `docs/PRODUCT_VISION.md` to reflect the current state of the project

---

# Social Garden

Personal CRM app for nurturing relationships. Voice notes and photos are processed by Claude AI to extract contact information, preferences, family members, and follow-up items.

## Tech Stack

- **Framework:** Next.js 14.2 with App Router
- **Language:** TypeScript 5 (strict mode)
- **Database:** PostgreSQL (Neon) with Prisma 5.22
- **Hosting:** Vercel
- **Styling:** Tailwind CSS 3.4
- **AI:** Anthropic Claude API (@anthropic-ai/sdk)
- **Icons:** lucide-react
- **Animations:** canvas-confetti (celebration effects)
- **Offline Storage:** idb (IndexedDB wrapper)

## Commands

```bash
npm run dev          # Start development server (port 3000)
npm run build        # Production build
npm test             # Run tests (Vitest)
npm run test:run     # Run tests once
npx prisma studio    # Visual database browser
npx prisma db push   # Sync schema to database
```

## Skills Reference

Detailed documentation lives in skills. Reference these when working on specific areas:

| Skill | When to use |
|-------|-------------|
| `nextjs-app-router` | Pages, layouts, API routes, Server/Client components |
| `prisma-patterns` | Database queries, schema changes, migrations |
| `react-components` | Creating/modifying components, editable pattern |
| `contact-briefing` | AI briefings, conversation prep, caching |
| `health-system` | Relationship health, cadence, gardening metaphor |
| `voice-processing` | Voice notes, AI extraction, ingest API |
| `photo-capture` | Photo/screenshot capture, image processing, Claude vision |
| `date-handling` | Dates, timezone-safe parsing, relative dates |
| `toast-celebration` | User feedback (toasts), celebration animations |
| `offline-support` | Offline queue, IndexedDB, online/offline detection |

Skills location: `app/.claude/skills/*/SKILL.md`

## Data Models

Five core models in `app/prisma/schema.prisma`:
- **Contact:** Person info + `cachedBriefing`, `briefingGeneratedAt` for AI briefings
- **Preference:** ALWAYS/NEVER items (likes, dislikes)
- **Interaction:** Contact log (CALL, MESSAGE, MEET, VOICE)
- **Seedling:** Follow-up items (ACTIVE or PLANTED)
- **FamilyMember:** Related people

Types: `app/src/types/index.ts`

## API Routes

| Route | Methods | Description |
|-------|---------|-------------|
| `/api/ingest` | POST | Voice/photo AI processing (see `voice-processing`, `photo-capture` skills) |
| `/api/contacts` | GET, POST | List/create contacts |
| `/api/contacts/[id]` | GET, PUT, DELETE | Single contact CRUD |
| `/api/contacts/[id]/briefing` | POST | AI briefing (see `contact-briefing` skill) |
| `/api/interactions` | POST | Create interaction |
| `/api/interactions/[id]` | PUT, DELETE | Update/delete interaction |
| `/api/preferences/[id]` | PUT, DELETE | Update/delete preference |
| `/api/seedlings/[id]` | PUT, DELETE | Update/delete seedling |
| `/api/family-members/[id]` | PUT, DELETE | Update/delete family member |

## Deployment

**Infrastructure:** Vercel (hosting) + Neon PostgreSQL (database)

**Environment Variables:**
- `ANTHROPIC_API_KEY` - Claude API key (required)
- `DATABASE_URL` - PostgreSQL connection string from Neon

**Local Development:**
1. Copy `.env.example` to `.env.local`
2. Add your Neon dev database connection string
3. Run `npx prisma db push` to sync schema

**Production:**
- Vercel auto-deploys from GitHub
- Database migrations: run `npx prisma db push` in Vercel dashboard

## Gotchas

- `socials` and `cachedBriefing` stored as JSON strings in PostgreSQL
- Next.js 14 async params: `const { id } = await params` (not destructure directly)
- Web Speech API only works in Chrome/Edge
- ANTHROPIC_API_KEY required in `.env.local`
- Anthropic client uses lazy initialization (validates API key on first use, not module load)
