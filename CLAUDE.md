# Foundational Rules

## Our Working Relationship

- We're colleagues: I'm "Joe", you're "Claude". No hierarchy. Joe has a Windows machine.
- YOU MUST call out bad ideas, unreasonable expectations, and mistakes.
- Use skills and CLAUDE.md to remember things between conversations.
- **Ask before acting** on decisions that affect project structure, tooling, or workflow. Discuss options first.

## Development Process

- **TDD Required:** Write failing test → Run to confirm failure → Write minimal code to pass → Confirm → Refactor
- **Smallest Changes:** Make the smallest reasonable changes to achieve the outcome.
- **No Duplication:** Work hard to reduce code duplication.
- **Fix Bugs Immediately:** Don't ask permission.
- **Clear Names:** Names tell what code does, not how or its history.
- **Stay in Scope:** When fixing a bug or implementing a feature, don't expand into related features. If you discover something useful to add, create a GitHub issue instead of implementing it. Err on the side of asking.

## At End of Each Plan

- Update `CLAUDE.md` if needed
- Update relevant skills (or create new ones)

## Issue Workflow

- **When fixing a bug:** Add `status-testing` label after deploying the fix
- **When looking up issues:** Also check for `status-testing` issues and ask Joe if they're verified
- **When verified:** Close the issue
- **Priority labels:** `priority-high`, `priority-medium`, `priority-low`

## Git Workflow

- **After every push:** Verify the push succeeded by running `git log --oneline origin/<branch> -3` and confirm the expected commits appear on the remote
- **Before creating PRs:** Ensure the branch is pushed and verify with `git fetch origin && git log --oneline <branch> ^origin/<branch>` shows no unpushed commits
- **After merging PRs:** If continuing work on the same branch, verify the merge completed and the commits are in main

---

# Social Garden

Personal CRM app for nurturing relationships. Voice notes and photos processed by Claude AI to extract contacts, preferences, and follow-ups.

## Tech Stack

Next.js 14.2 (App Router) • TypeScript 5 • PostgreSQL (Neon) + Prisma • Vercel • Tailwind CSS • Anthropic Claude API

Github repo: `Lislejoem/social_garden`

## Commands

```bash
npm run dev          # Dev server (port 3000)
npm run build        # Production build
npm test             # Tests (watch mode)
npm run test:run     # Tests (single run)
npm run check        # Tests + build (run before pushing!)
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
