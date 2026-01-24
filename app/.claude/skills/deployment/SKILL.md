# Deployment Skill

Use when deploying to production, managing environment variables, or running database migrations.

## Infrastructure

| Component | Service | URL/Details |
|-----------|---------|-------------|
| Hosting | Vercel | https://app-five-zeta-92.vercel.app |
| Database | Neon PostgreSQL | Project: Social Garden |
| AI | Anthropic Claude API | claude-sonnet-4-20250514 |

## Vercel CLI

Requires a token for Claude to use autonomously. User creates token at https://vercel.com/account/tokens.

### Commands

```bash
# Deploy to production
vercel deploy --prod --token $VERCEL_TOKEN

# List environment variables
vercel env ls --token $VERCEL_TOKEN

# Add environment variable (pipe the value)
echo "value" | vercel env add VAR_NAME production --token $VERCEL_TOKEN

# Pull env vars to local .env file
vercel env pull --token $VERCEL_TOKEN

# View deployment logs
vercel inspect <deployment-url> --logs --token $VERCEL_TOKEN
```

### Initial Setup

```bash
# Link project (run once in app directory)
vercel link --token $VERCEL_TOKEN --yes
```

This creates `.vercel/` folder (gitignored) with project configuration.

## Neon CLI

Uses OAuth authentication (no token needed after initial `neonctl auth`).

### Commands

```bash
# Get database connection string
neonctl connection-string

# List projects
neonctl projects list

# List branches
neonctl branches list

# Create a new branch (for testing/dev)
neonctl branches create --name feature-branch

# Set default project context
neonctl set-context --project-id <id> --org-id <org-id>
```

### Project Info

- Project ID: `silent-glitter-05290559`
- Org ID: `org-sparkling-poetry-01492235`
- Database: `neondb`

## Database Migrations

After schema changes in `prisma/schema.prisma`:

```bash
# Get connection string and run migration
DATABASE_URL=$(neonctl connection-string) npx prisma db push
```

Or if you have the connection string:

```bash
DATABASE_URL="postgresql://..." npx prisma db push
```

## Environment Variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `ANTHROPIC_API_KEY` | Vercel (production) | Claude API access |
| `DATABASE_URL` | Vercel (production) | Neon PostgreSQL connection |
| `VERCEL_TOKEN` | User's terminal only | CLI authentication (never commit) |

## Deployment Workflow

1. **Code changes** - Make changes, run tests locally
2. **Push to GitHub** - Vercel auto-deploys from main branch
3. **Or manual deploy** - `vercel deploy --prod --token $TOKEN`
4. **Schema changes** - Run `prisma db push` with production DATABASE_URL

## Common Issues

### Build fails with ESLint errors
- Fix all unused variables/imports
- Underscore prefix (`_var`) doesn't work - remove the variable entirely

### Database connection error during build
- Ensure `DATABASE_URL` is set in Vercel environment variables
- Must be a valid `postgresql://` URL

### Prisma client not generated
- `postinstall` script runs `prisma generate`
- Ensure `vercel.json` has: `"buildCommand": "prisma generate && next build"`

## Security Notes

- Vercel token: Revoke at https://vercel.com/account/tokens
- Neon CLI: Uses OAuth, credentials stored locally
- Never commit tokens to git
- Environment variables in Vercel are encrypted
