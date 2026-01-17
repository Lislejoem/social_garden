---
allowed-tools: Bash(npx tsc:*), Read, Grep
description: Run TypeScript type checking and analyze errors
---

# TypeScript Type Check

Run TypeScript compiler without emitting files to check for type errors.

## Command

```bash
cd app && npx tsc --noEmit
```

## Common Issues in This Project

### 1. Prisma Types Out of Sync

If you see errors about Prisma types, regenerate the client:

```bash
cd app && npx prisma generate
```

### 2. Async Params in Next.js 14

Route params are now async. This is wrong:

```typescript
// WRONG
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
```

This is correct:

```typescript
// CORRECT
interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
```

### 3. Missing Type Imports

Types should be imported from `@/types`:

```typescript
import type { Contact, Preference, HealthStatus } from '@/types';
```

## After Fixing Errors

Run typecheck again to verify all issues are resolved.

$ARGUMENTS
