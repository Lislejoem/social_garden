---
allowed-tools: Bash(npm run build:*), Read, Grep
description: Production build with error checking
---

# Production Build

Create a production build and check for errors.

## Command

```bash
cd app && npm run build
```

## Pre-Build Checklist

1. Run `/typecheck` first to catch type errors
2. Run `/lint` to fix linting issues
3. Ensure `.env.local` has required variables

## Required Environment Variables

```
ANTHROPIC_API_KEY=your-api-key
DATABASE_URL="file:./dev.db"
```

## Common Build Failures

### 1. TypeScript Errors

Build fails on any type error. Run `/typecheck` to see details.

### 2. Missing Environment Variables

If `ANTHROPIC_API_KEY` is missing, API routes will fail:

```bash
echo "ANTHROPIC_API_KEY=your-key" >> app/.env.local
```

### 3. Server/Client Component Mismatch

Error: "You're importing a component that needs X"

- Move the hook/API to a Client Component (`'use client'`)
- Or lift the client logic to a parent Client Component

### 4. Dynamic Import Errors

If using Web APIs (like Web Speech), ensure they're only accessed in Client Components and wrapped in browser checks:

```typescript
if (typeof window !== 'undefined') {
  // Safe to use browser APIs
}
```

## After Successful Build

The build output will be in `app/.next/`

To start production server:

```bash
cd app && npm run start
```

$ARGUMENTS
