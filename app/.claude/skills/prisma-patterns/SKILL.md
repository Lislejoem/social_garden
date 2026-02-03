---
name: prisma-patterns
description: Use when working with database queries, Prisma schema, migrations, or data modeling. Covers PostgreSQL patterns, multi-tenant queries, and efficient queries.
allowed-tools: Read, Grep, Glob, Edit, Write, Bash
---

# Prisma Database Patterns

## Schema Location

Schema file: `app/prisma/schema.prisma`
Database: PostgreSQL (Neon) - cloud only, no local DB

## Current Models

All models have `userId` for multi-tenant isolation:

```prisma
model Contact {
  id        String    @id @default(cuid())
  userId    String    // Clerk user ID
  name      String
  // ... other fields

  @@unique([userId, name])      // Unique name per user
  @@index([userId, updatedAt])  // Query optimization
  @@index([userId, hiddenAt])
}

model Preference {
  id        String  @id @default(cuid())
  userId    String  // Own userId for defense in depth
  contactId String
  // ...
  @@index([userId])
}
```

Related models: Preference, Interaction, Seedling, FamilyMember (all have userId)

## Common Commands

```bash
# Apply schema changes (development)
npx prisma db push

# Regenerate Prisma client
npx prisma generate

# Visual database browser
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma db push --force-reset
```

## Multi-Tenant Query Patterns

### Always Filter by userId
```typescript
const userId = await requireUserId();  // from @/lib/auth

const contacts = await prisma.contact.findMany({
  where: { userId, hiddenAt: null },
  orderBy: { updatedAt: 'desc' },
});
```

### Ownership Verification (Single Record)
```typescript
// Use findFirst with id AND userId - returns 404 for other users' data
const contact = await prisma.contact.findFirst({
  where: { id, userId },
  include: { preferences: true },
});

if (!contact) {
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
```

### Create with userId
```typescript
// Always set userId from server-side auth, NEVER from request body
const contact = await prisma.contact.create({
  data: {
    userId,  // From requireUserId()
    name,
    // ...
  },
});
```

### Child Record Security
```typescript
// Verify child record's own userId, not just parent's
const preference = await prisma.preference.findFirst({
  where: { id, userId },  // Check preference's userId directly
});
```

## Partial Updates
```typescript
const contact = await prisma.contact.update({
  where: { id },
  data: {
    ...(name && { name }),
    ...(location !== undefined && { location }),
  },
});
```

## Cascade Deletes

All related models use `onDelete: Cascade`, so deleting a Contact automatically deletes its preferences, interactions, seedlings, and family members.

## PostgreSQL Notes

- JSON stored as strings - parse in application code
- `socials` field: `JSON.stringify(socials)` on save, `JSON.parse()` on read
- `cachedBriefing` field: same pattern for AI briefing cache
- DATABASE_URL must be in `.env.local` (not `.env`)

## Prisma Client Location

```typescript
// app/src/lib/prisma.ts
import { prisma } from '@/lib/prisma';
```
