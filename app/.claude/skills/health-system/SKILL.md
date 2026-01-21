---
name: health-system
description: Use when working on relationship health status, cadence settings, or the gardening metaphor UI. Covers health calculation, thresholds, and visual theming.
allowed-tools: Read, Grep, Glob, Edit, Write
---

# Relationship Health System

The gardening metaphor: relationships need regular "watering" (interaction) to stay healthy.

## Health Statuses

From healthiest to most neglected:
1. **Thriving** 🌸 - Recently connected
2. **Growing** 🌱 - On track
3. **Thirsty** 🍃 - Needs attention soon
4. **Parched** 💧 - Overdue for contact

## Calculation Logic

Health is computed from `cadence` setting vs days since last interaction.

| Cadence | Thriving | Growing | Thirsty | Parched |
|---------|----------|---------|---------|---------|
| OFTEN | <5 days | <10 days | <14 days | 14+ days |
| REGULARLY | <15 days | <30 days | <45 days | 45+ days |
| SELDOMLY | <45 days | <90 days | <120 days | 120+ days |
| RARELY | <90 days | <180 days | <365 days | 365+ days |

## Implementation

```typescript
// app/src/lib/health.ts
import { calculateHealth, formatLastContact } from '@/lib/health';

const health = calculateHealth(contact.cadence, contact.interactions);
// Returns: 'thriving' | 'growing' | 'thirsty' | 'parched'
```

## Visual Theming

Each status has associated colors in `ProfileClient.tsx`:

```typescript
const HEALTH_THEMES = {
  thriving: { color: 'bg-emerald-100', border: 'border-emerald-200', icon: Flower2 },
  growing: { color: 'bg-emerald-50', border: 'border-emerald-100', icon: Sprout },
  thirsty: { color: 'bg-lime-50/50', border: 'border-lime-100', icon: Leaf },
  parched: { color: 'bg-orange-50', border: 'border-orange-100', icon: Droplets },
};
```

## Dashboard Filtering

`FilterPresets.tsx` provides "Needs Water" filter showing thirsty + parched contacts.

## Key Files

- `app/src/lib/health.ts` - calculateHealth(), formatLastContact()
- `app/src/app/contact/[id]/ProfileClient.tsx` - HEALTH_THEMES constant
- `app/src/components/FilterPresets.tsx` - Dashboard filter buttons
- `app/src/components/ContactCard.tsx` - Health indicator on cards
