# Foundational Rules

## Our Working Relationship

- We're colleagues: I'm "Joe", you're "Claude". No hierarchy. Joe has a Windows machine.
- YOU MUST call out bad ideas, unreasonable expectations, and mistakes.
- Use skills and CLAUDE.md to remember things between conversations.
- **Ask before acting** on decisions that affect project structure, tooling, or workflow. Discuss options first.

## Joe's Environment

- **Testing**: Joe tests exclusively on Vercel preview deployments, never localhost
- **Bug reports**: When Joe reports a bug, it's on a deployed Vercel preview
- **Database**: Always Neon PostgreSQL in the cloud (no local database)
- **Debugging approach**: Check Vercel deployment status and build output first

## Workflow

Follow steps in this order. You **MUST** do these whenever you adjust any code outside of documentation and you **MUST** do these without Joe requesting it. If Joe has to prompt you, you are failing in your role.
1. **Advisors:** Select the advisors whose opinions you'd like on the task and confirm the list with Joe.
2. **TDD Required:** Write failing test → Run to confirm failure → Write minimal code to pass → Confirm → Refactor
3. **Retrospective:** Ask "What context, instructions, resources, or perspective would have helped had I known them beforehand?".
4. **Future Claude:** Ask "What did I learn in this session that I should document for future Claude?".
5. **Confirm with Joe:** Confirm proposed documentation updates with Joe
6. **Update Documentation:** Update `CLAUDE.md` and relevant skills or create new ones

## Issue Workflow

- **When fixing a bug:** Add `status-testing` label after deploying the fix
- **When looking up issues:** Also check for `status-testing` issues and ask Joe if they're verified
- **When verified:** Close the issue
- **Priority labels:** `priority-high`, `priority-medium`, `priority-low`

## Git Workflow

- **After every push:** Verify the push succeeded by running `git log --oneline origin/<branch> -3` and confirm the expected commits appear on the remote. Only proceed with creating a PR if an issue is fixed and should be deployed in main.
- **Before creating PRs:** Ensure the branch is pushed and verify with `git fetch origin && git log --oneline <branch> ^origin/<branch>` shows no unpushed commits
- **After merging PRs:** If continuing work on the same branch, verify the merge completed and the commits are in main

## Documentation Maintenance

**With every commit**, ensure documentation stays current:
- **CLAUDE.md**: Update if workflows, gotchas, or project structure change
- **Skills**: Update relevant skill files if domain knowledge changes
- **GitHub Issues**: Close completed issues, and review/update other issues to ensure the descriptions are accurate according to our changes in this commit
- **Other docs**: Update `app/docs/ARCHITECTURE.md` or `docs/BRAND_DIRECTION.md` as needed

Stale documentation is worse than no documentation. If you change something, update the docs in the same commit.

## Development Practices

- **Smallest Changes:** Make the smallest reasonable changes to achieve the outcome.
- **No Duplication:** Work hard to reduce code duplication.
- **Fix Bugs Immediately:** Don't ask permission.
- **Clear Names:** Names tell what code does, not how or its history.
- **Stay in Scope:** When fixing a bug or implementing a feature *in auto accept mode*, don't expand into related features. If you discover something useful to add, create a GitHub issue instead of implementing it. Err on the side of asking.

## Testing Guidelines

- **New utility functions**: Always write tests
- **New API routes**: Write tests for happy path + error cases
- **New UI components**: Tests optional for simple presentational components; required for components with complex logic or user interactions
- **Bug fixes**: Add regression test if the bug was non-obvious

---

# Grove

Personal CRM app for nurturing relationships. Voice notes and photos processed by Claude AI to extract contacts, preferences, and follow-ups.

## Tech Stack

Next.js 14.2 (App Router) • TypeScript 5 • PostgreSQL (Neon) + Prisma • Clerk Auth • Vercel • Tailwind CSS • Anthropic Claude API

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
| `skill-discovery` | **Required** before creating new skills - finds and synthesizes existing skills |
| `testing` | Writing tests, mocking Anthropic SDK |
| `prisma-patterns` | Database queries, schema, migrations |
| `nextjs-app-router` | Pages, layouts, API routes, static vs dynamic rendering issues |
| `react-components` | Components, state management, optimistic updates, dashboard mutations |
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

16 AI advisors provide perspectives on product decisions. Invoke as skills (e.g., `/advisor-ux-mobile`).

| Category | Advisors |
|----------|----------|
| Expert | `ux-mobile`, `privacy-security`, `security-pentest`, `ai-llm`, `performance`, `content`, `behavioral-psych`, `agent-first`, `growth-marketer` |
| Persona | `persona-busy-parent`, `persona-connector`, `persona-infrequent`, `persona-early-adopter` |
| Critical | `edge-cases`, `devils-advocate`, `startup-ceo` |

## Product Principles

- **Friction-free capture**: Minimize effort to log interactions (voice, photos, future integrations)
- **Agent-first**: AI agents and human users are equals - same data access, same capabilities via API
- **Mobile-primary**: 75% mobile, 25% desktop
- **Proactive**: App actively reminds users to nurture relationships
- **Privacy + Security**: All-in on integrations, but security is first-class
- **Gardening metaphor**: Core to brand, extend don't replace

## Brand Direction

See `docs/BRAND_DIRECTION.md` for:
- Visual design system (glassmorphism, gradients, typography)
- Brand voice and tone guidelines
- Gardening metaphor usage (when to use, when not to)
- Name rationale and domain strategy

## Gotchas

- `socials` and `cachedBriefing` are JSON strings in PostgreSQL
- Next.js 14 async params: `const { id } = await params`
- Web Speech API: Chrome/Edge only
- Anthropic client validates API key on first use, not module load
- Prisma migrations: Use `prisma db push` (non-interactive env doesn't support `prisma migrate dev`)
- DATABASE_URL is in `.env.local`, not `.env` (Prisma looks at `.env` by default)
- Windows NUL files: Bash commands with Windows syntax (e.g., `2>NUL`) can create junk files named "NUL". Delete them if found.
- Clerk middleware: Place at `src/middleware.ts`, NOT inside `app/` directory
- Clerk keys: `CLERK_SECRET_KEY` is server-only; `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is intentionally public (required for frontend SDK)
- Clerk custom pages: Set `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in` and `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up` env vars to use embedded pages instead of Clerk's hosted pages
- Auth helper: Use `requireUserId()` from `@/lib/auth` in all API routes and server components - throws "Unauthorized" if not authenticated
- Multi-tenant queries: Always filter by `userId` - use `findFirst({ where: { id, userId } })` for ownership verification (returns 404, not 403)
- Child record security: Preference, Interaction, Seedling, FamilyMember have their own `userId` field - verify their userId directly (defense in depth)
- Vitest mock hoisting: `vi.mock()` is hoisted, so use literal values in mock factory, then declare constants after
- Server/client auth wrapper: For client pages needing server-side auth, create `page.tsx` as server component calling `requireUserId()`, then render a `*Client.tsx` component (e.g., `NewContactClient.tsx`)