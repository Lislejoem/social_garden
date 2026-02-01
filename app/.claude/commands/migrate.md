---
allowed-tools: Bash(npx prisma:*), Read, Edit
description: Prisma database migration workflow
---

# Prisma Migration

Database workflow for Grove (PostgreSQL).

## Schema Location

`app/prisma/schema.prisma`

## Development Workflow

### 1. Apply Schema Changes

After modifying schema.prisma:

```bash
cd app && npx prisma db push
```

### 2. Regenerate Client

After schema changes, regenerate the TypeScript client:

```bash
cd app && npx prisma generate
```

### 3. View Data

Open the visual database browser:

```bash
cd app && npx prisma studio
```

## Reset Database

**WARNING: This deletes all data!**

```bash
cd app && npx prisma db push --force-reset
```

## Adding a New Model

1. Add model to `prisma/schema.prisma`
2. Run `npx prisma db push`
3. Run `npx prisma generate`
4. Add TypeScript interface to `src/types/index.ts`
5. Create API routes as needed

## Adding a Field

1. Edit model in `prisma/schema.prisma`
2. Run `npx prisma db push`
3. Run `npx prisma generate`
4. Update TypeScript types if needed

$ARGUMENTS
