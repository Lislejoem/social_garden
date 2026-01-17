---
name: nextjs-app-router
description: Use when building pages, layouts, API routes, or routing in Next.js. Covers App Router patterns, Server/Client Components, data fetching, and file-based routing.
allowed-tools: Read, Grep, Glob, Edit, Write, Bash
---

# Next.js App Router Patterns

## Server-First Architecture

Default to Server Components. Only use `"use client"` when you need:
- Event handlers (onClick, onChange)
- Browser APIs (localStorage, window, Web Speech API)
- React hooks (useState, useEffect)

## Project-Specific Conventions

This project uses the naming convention:
- `page.tsx` - Server Component (fetches data)
- `*Client.tsx` - Client Component (handles interactivity)

Example: `app/contact/[id]/page.tsx` fetches contact data, `ProfileClient.tsx` handles editing.

## File Structure

```
app/
├── layout.tsx          # Root layout
├── page.tsx            # Home/Dashboard
├── loading.tsx         # Loading UI (optional)
├── error.tsx           # Error boundary (optional)
├── contact/
│   ├── new/page.tsx    # New contact form
│   └── [id]/page.tsx   # Dynamic contact profile
└── api/
    └── route.ts        # API routes
```

## API Routes

```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ data: 'value' });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json(result, { status: 201 });
}
```

## Dynamic Route Parameters (Next.js 14)

Parameters are now async - destructure with `await`:

```typescript
// CORRECT
interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;  // Must await!
  // ...
}
```

## Data Fetching in Server Components

```typescript
// page.tsx (Server Component)
async function ContactPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contact = await prisma.contact.findUnique({ where: { id } });

  return <ProfileClient contact={contact} />;
}
```

## Common Patterns in This Project

- Use `router.refresh()` after mutations to refetch server data
- API routes return NextResponse.json() with appropriate status codes
- Prisma queries are done in API routes or Server Components only
