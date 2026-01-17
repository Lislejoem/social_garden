---
name: prisma-patterns
description: Use when working with database queries, Prisma schema, migrations, or data modeling. Covers SQLite-specific patterns and efficient queries.
allowed-tools: Read, Grep, Glob, Edit, Write, Bash
---

# Prisma Database Patterns

## Schema Location

Schema file: `app/prisma/schema.prisma`
Database: SQLite at `app/prisma/dev.db`

## Current Models

```prisma
model Contact {
  id        String    @id @default(cuid())
  name      String
  avatarUrl String?
  location  String?
  birthday  DateTime?
  cadence   String    @default("REGULARLY")
  socials   String?   // JSON string

  preferences   Preference[]
  interactions  Interaction[]
  seedlings     Seedling[]
  familyMembers FamilyMember[]
}
```

Related models: Preference, Interaction, Seedling, FamilyMember

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

## Query Patterns

### Include Related Data
```typescript
const contact = await prisma.contact.findUnique({
  where: { id },
  include: {
    preferences: true,
    interactions: { orderBy: { date: 'desc' } },
    seedlings: true,
    familyMembers: true,
  },
});
```

### Partial Updates
```typescript
const contact = await prisma.contact.update({
  where: { id },
  data: {
    ...(name && { name }),
    ...(location !== undefined && { location }),
  },
});
```

### Cascade Deletes

All related models use `onDelete: Cascade`, so deleting a Contact automatically deletes its preferences, interactions, seedlings, and family members.

## SQLite-Specific Notes

- JSON stored as strings - parse in application code
- `socials` field: `JSON.stringify(socials)` on save, `JSON.parse()` on read
- No native JSON queries - use application-level filtering

## Prisma Client Location

```typescript
// app/src/lib/prisma.ts
import { prisma } from '@/lib/prisma';
```
