# Foundational Rules

## Our Working Relationship

- We're colleagues: I'm "Joe", you're "Claude". No hierarchy.
- YOU MUST call out bad ideas, unreasonable expectations, and mistakes.
- Use skills and CLAUDE.md to remember things between conversations.

## Development Process

- **TDD Required:** Write failing test → Run to confirm failure → Write minimal code to pass → Confirm → Refactor
- **Smallest Changes:** Make the smallest reasonable changes to achieve the outcome.
- **No Duplication:** Work hard to reduce code duplication.
- **Fix Bugs Immediately:** Don't ask permission.
- **Clear Names:** Names tell what code does, not how or its history.

## At End of Each Plan

- Update `CLAUDE.md` if needed
- Update relevant skills (or create new ones)

---

# Social Garden

Personal CRM app for nurturing relationships. Voice notes and photos processed by Claude AI to extract contacts, preferences, and follow-ups.

## Tech Stack

Next.js 14.2 (App Router) • TypeScript 5 • PostgreSQL (Neon) + Prisma • Vercel • Tailwind CSS • Anthropic Claude API

## Commands

```bash
npm run dev          # Dev server (port 3000)
npm run build        # Production build
npm test             # Tests (watch mode)
npm run test:run     # Tests (single run)
npx prisma studio    # Database browser
```

## Skills

Load skills for detailed guidance on specific areas:

| Skill | When to use |
|-------|-------------|
| `testing` | Writing tests, mocking Anthropic SDK |
| `prisma-patterns` | Database queries, schema, migrations |
| `nextjs-app-router` | Pages, layouts, API routes |
| `react-components` | Components, editable pattern |
| `deployment` | Vercel, Neon, production deploys |
| `github-workflow` | Issues, PRs, CI/CD, project board |
| `voice-processing` | Voice notes, AI extraction |
| `photo-capture` | Image processing, Claude vision |
| `contact-briefing` | AI briefings, caching |
| `health-system` | Relationship health, gardening metaphor |
| `date-handling` | Timezone-safe dates |
| `toast-celebration` | Toasts, confetti |

Skills location: `app/.claude/skills/*/SKILL.md`

## Advisors

12 AI advisors provide perspectives on product decisions. Invoke as skills (e.g., `/advisor-ux-mobile`).

| Category | Advisors |
|----------|----------|
| Expert | `ux-mobile`, `privacy-security`, `ai-llm`, `performance`, `content`, `behavioral-psych`, `agent-first` |
| Persona | `persona-busy-parent`, `persona-connector`, `persona-infrequent` |
| Critical | `edge-cases`, `devils-advocate` |

## Product Principles

- **Friction-free capture**: Minimize effort to log interactions (voice, photos, future integrations)
- **Agent-first**: AI agents and human users are equals - same data access, same capabilities via API
- **Mobile-primary**: 75% mobile, 25% desktop
- **Proactive**: App actively reminds users to nurture relationships
- **Privacy + Security**: All-in on integrations, but security is first-class
- **Gardening metaphor**: Core to brand, extend don't replace

## Gotchas

- `socials` and `cachedBriefing` are JSON strings in PostgreSQL
- Next.js 14 async params: `const { id } = await params`
- Web Speech API: Chrome/Edge only
- Anthropic client validates API key on first use, not module load
