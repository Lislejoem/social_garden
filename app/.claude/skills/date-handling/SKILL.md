---
name: date-handling
description: Use when working with dates, date inputs, or date parsing. Covers timezone-safe patterns and relative date parsing.
allowed-tools: Read, Grep, Glob, Edit, Write
---

# Date Handling

Consistent patterns for working with dates to avoid timezone issues.

## The Problem

JavaScript's `new Date("2025-01-20")` interprets date-only strings as UTC midnight, causing off-by-one errors when displayed in local timezones.

## The Solution

Use the utilities in `app/src/lib/dates.ts`:

```typescript
import { parseDateFromInput, formatDateForInput, parseRelativeDate } from '@/lib/dates';
```

## Core Functions

### parseDateFromInput(dateString)

Parse HTML date input values (YYYY-MM-DD) to local dates at noon.

```typescript
// From date picker
const date = parseDateFromInput('2025-01-20');
// Returns: Date at noon local time (avoids DST issues)
```

### formatDateForInput(date)

Format Date objects for HTML date inputs.

```typescript
// For date picker value
const value = formatDateForInput(new Date());
// Returns: "2025-01-20"
```

### parseRelativeDate(text)

Parse natural language relative dates from text.

```typescript
parseRelativeDate('Met them yesterday');     // → Date for yesterday
parseRelativeDate('Called 2 days ago');      // → Date for 2 days ago
parseRelativeDate('Texted last week');       // → Date for 7 days ago
parseRelativeDate('Saw them last month');    // → Date for 1 month ago
parseRelativeDate('No date here');           // → null
```

Supported patterns:
- "today"
- "yesterday"
- "last week" / "a week ago"
- "last month"
- "X days ago" / "X weeks ago"
- "a few days ago" (3 days)

## Usage Patterns

### API Routes - Receiving Dates

```typescript
// CORRECT: Use parseDateFromInput for date strings from forms
import { parseDateFromInput } from '@/lib/dates';

if (date !== undefined) {
  updateData.date = parseDateFromInput(date);
}
```

```typescript
// WRONG: This causes timezone issues
updateData.date = new Date(date);
```

### Components - Date Inputs

```typescript
import { formatDateForInput } from '@/lib/dates';

// Initialize date input value
const [editDate, setEditDate] = useState(formatDateForInput(interaction.date));

// In JSX
<input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
```

### AI Extraction - Date Parsing

The AI extracts `interactionDate` in YYYY-MM-DD format. The ingest API uses this with fallback parsing:

```typescript
let interactionDate: Date;
if (extraction.interactionDate) {
  interactionDate = parseDateFromInput(extraction.interactionDate);
} else {
  const parsedRelative = parseRelativeDate(extraction.interactionSummary);
  interactionDate = parsedRelative || new Date();
}
```

## Key Files

- `app/src/lib/dates.ts` - Date utilities
- `app/src/lib/dates.test.ts` - Tests (18 tests)
- `app/src/app/api/interactions/[id]/route.ts` - Uses parseDateFromInput
- `app/src/app/api/ingest/route.ts` - Uses both parse functions
- `app/src/components/EditableInteraction.tsx` - Uses formatDateForInput

## Rules

1. **Never use `new Date(dateString)` for date-only strings** - Always use `parseDateFromInput`
2. **Always set time to noon** for date-only values - Avoids DST boundary issues
3. **Test with different timezones** - Date bugs often only appear in certain timezones
