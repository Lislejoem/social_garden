---
name: toast-celebration
description: Use when implementing user feedback (success/error messages) or celebration effects. Covers Toast system, ToastContext, and confetti animations.
allowed-tools: Read, Grep, Glob, Edit, Write
---

# Toast & Celebration System

## Toast System

Global toast notifications for user feedback (success/error messages).

### Usage

```typescript
import { useToast } from '@/contexts/ToastContext';

function MyComponent() {
  const { showToast, showError } = useToast();

  // Success message (emerald, 4s duration)
  showToast('Logged interaction with Sarah');

  // Error message (red, 6s duration)
  showError('Failed to save. Please try again.');

  // Error with retry button
  showError('Connection failed', () => retryAction());
}
```

### Provider Requirement

Components using `useToast()` must be wrapped in `ToastProvider`. The root layout already includes this via `Providers.tsx`.

**In tests**, wrap components manually:

```typescript
import { ToastProvider } from '@/contexts/ToastContext';

function renderComponent() {
  return render(
    <ToastProvider>
      <MyComponent />
    </ToastProvider>
  );
}
```

### Key Files

| File | Purpose |
|------|---------|
| `app/src/components/Toast.tsx` | Toast component (success/error variants) |
| `app/src/contexts/ToastContext.tsx` | Context provider and `useToast` hook |
| `app/src/app/Providers.tsx` | Client wrapper for root layout |

### Toast Variants

| Variant | Background | Icon | Duration |
|---------|------------|------|----------|
| success | emerald-900 | Check | 4000ms |
| error | red-600 | AlertCircle | 6000ms |

---

## Celebration Animation

Garden-themed confetti burst for positive reinforcement when logging interactions.

### Usage

```typescript
import { celebrateInteraction } from '@/utils/celebrate';

// Default: burst from center of screen
celebrateInteraction();

// Burst from specific element (e.g., the button clicked)
celebrateInteraction(buttonRef.current);
```

### When to Use

- **DO** trigger after successfully logging an interaction
- **DON'T** use for simple edits (editing a name, preference, etc.)

### Garden Color Palette

```typescript
export const GARDEN_COLORS = [
  '#10b981', // emerald-500
  '#34d399', // emerald-400
  '#84cc16', // lime-500
  '#a3e635', // lime-400
  '#65a30d', // lime-600
];
```

### Key Files

| File | Purpose |
|------|---------|
| `app/src/utils/celebrate.ts` | `celebrateInteraction()` function |
| `app/src/utils/celebrate.test.ts` | Tests |

### Dependencies

- `canvas-confetti` - Lightweight confetti animation library

---

## Testing Notes

### Mocking canvas-confetti

Use `vi.hoisted()` for proper mock initialization:

```typescript
const mockConfetti = vi.hoisted(() => vi.fn());

vi.mock('canvas-confetti', () => ({
  default: mockConfetti,
}));
```

### Testing Toast Context

Avoid `waitFor` with fake timers - use synchronous assertions:

```typescript
// Good: synchronous check
expect(screen.getByText('Error message')).toBeInTheDocument();

// Bad: can hang with fake timers
await waitFor(() => expect(...));
```
