# Offline Support Skill

Offline queuing for voice note transcripts using IndexedDB.

## Overview

When users are offline, voice note transcripts are stored locally in IndexedDB. When the user comes back online, queued notes are automatically processed through the normal preview → confirm flow.

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/offline-queue.ts` | IndexedDB CRUD operations |
| `src/hooks/useOnlineStatus.ts` | Online/offline detection hook |
| `src/contexts/OfflineQueueContext.tsx` | Queue state management |
| `src/components/QueueIndicator.tsx` | Badge showing queue count |

## Data Model

```typescript
interface QueuedVoiceNote {
  id: string;              // UUID
  transcript: string;      // Voice note text
  queuedAt: Date;         // When queued
  status: 'pending' | 'processing' | 'failed';
  errorMessage?: string;  // If failed
  retryCount: number;     // Retry attempts
}
```

## Usage

### Check if online
```typescript
import { useOfflineQueue } from '@/contexts/OfflineQueueContext';

const { isOnline } = useOfflineQueue();
```

### Add to queue (when offline)
```typescript
const { addToQueue, isOnline } = useOfflineQueue();

if (!isOnline) {
  await addToQueue(transcript);
  showToast('Saved offline. Will sync when you reconnect.');
}
```

### Get queue count for UI
```typescript
const { queueCount } = useOfflineQueue();
// queueCount === 0 means queue is empty
```

## User Flow

1. **User records voice note while offline**
   - Transcript queued to IndexedDB
   - Toast: "Saved offline. Will sync when you reconnect."
   - Badge appears on mic button showing count

2. **User comes back online**
   - Queue auto-processes sequentially
   - Each note shows preview modal
   - User confirms or cancels each

3. **After confirmation**
   - Note removed from queue
   - Next queued note processed (if any)
   - Celebrate animation + toast

## Testing

IndexedDB tests use `fake-indexeddb`:

```typescript
import 'fake-indexeddb/auto';
import { deleteDB } from 'idb';
import { closeOfflineDb, clearQueue } from '../lib/offline-queue';

beforeEach(async () => {
  closeOfflineDb();
  await clearQueue();
});
```

## Garden Metaphor

- Queued notes = "Seedlings waiting to be planted"
- QueueIndicator uses Sprout icon
- Orange color when offline (needs attention)
- Lime color when online (will sync)
