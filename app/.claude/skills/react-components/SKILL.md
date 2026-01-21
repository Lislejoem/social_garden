---
name: react-components
description: Use when creating or modifying React components. Covers component patterns, state management, and the editable component system used in this project.
allowed-tools: Read, Grep, Glob, Edit, Write
---

# React Component Patterns

## Component Location

All reusable components: `app/src/components/`

## Component Naming

- Reusable components: PascalCase (e.g., `ContactCard.tsx`)
- Page-level client components: `*Client.tsx` suffix
- Editable components: `Editable*.tsx` prefix

## Editable Component Pattern

This project uses a consistent pattern for inline editing:

```typescript
interface EditableTextProps {
  value: string | null;
  onSave: (value: string) => Promise<void>;
  placeholder?: string;
  className?: string;
}

function EditableText({ value, onSave, placeholder }: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');

  const handleSave = async () => {
    await onSave(editValue);
    setIsEditing(false);
  };

  if (isEditing) {
    return <input value={editValue} onChange={...} onBlur={handleSave} />;
  }

  return <span onClick={() => setIsEditing(true)}>{value || placeholder}</span>;
}
```

## State Management

This project uses local component state (`useState`). No global state library.

Common state patterns:
- `previewData` - Modal data state
- `toastMessage` - Notification state
- `isEditing` / `editValue` - Edit mode state

## API Integration Pattern

```typescript
const handleUpdate = async (field: string, value: string) => {
  const response = await fetch(`/api/contacts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ [field]: value }),
  });

  if (!response.ok) {
    throw new Error('Failed to update');
  }

  router.refresh(); // Refetch server data
};
```

## Icon Library

Using lucide-react for icons:

```typescript
import { ChevronLeft, Heart, Sprout, Trash2 } from 'lucide-react';

<Heart className="w-5 h-5 text-emerald-600" />
```

## Styling

Tailwind CSS with custom design system:
- Colors: emerald (primary), stone (neutral), amber, rose
- Border radius: `rounded-xl`, `rounded-2xl`, `rounded-4xl`, `rounded-5xl`, `rounded-6xl`
- Shadows: `shadow-sm`, `shadow-xl`, `shadow-2xl`

## TypeScript

Import types from centralized location:

```typescript
import type { Contact, Preference, HealthStatus } from '@/types';
```

## Avatar System

Profile photos use a multi-source approach with fallback chain.

### Fields (on Contact model)
- `avatarUrl` - The currently displayed avatar URL
- `avatarSource` - Where the current avatar came from ('manual', 'gravatar', etc.)
- `preferredAvatarSource` - User's preferred source for auto-fetch

### Current Sources
1. **Manual URL** - User pastes a URL directly
2. **Gravatar** - Auto-fetches from Gravatar based on email

### Adding New Sources
The system is designed for OAuth integration (LinkedIn, Instagram) in V2:
1. Add source to `avatarSource` enum in schema
2. Add fetch logic to `app/src/lib/avatar.ts`
3. Update `AvatarUpload.tsx` component with new option

### Key Files
- `app/src/lib/avatar.ts` - Gravatar fetch, URL validation
- `app/src/components/AvatarUpload.tsx` - Upload UI component
