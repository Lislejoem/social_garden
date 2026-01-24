/**
 * @file Offline Queue Operations
 * @description IndexedDB-based queue for storing voice note transcripts when offline.
 * Notes are persisted locally and processed when the user comes back online.
 */

import { openDB, type IDBPDatabase } from 'idb';
import { v4 as uuidv4 } from 'uuid';

const DB_NAME = 'social-garden-offline';
const DB_VERSION = 1;
const STORE_NAME = 'voiceQueue';

/** Status of a queued voice note */
export type QueueStatus = 'pending' | 'processing' | 'failed';

/** A voice note stored in the offline queue */
export interface QueuedVoiceNote {
  id: string;
  transcript: string;
  queuedAt: Date;
  status: QueueStatus;
  errorMessage?: string;
  retryCount: number;
}

/** Database schema for type safety */
interface OfflineDbSchema {
  voiceQueue: {
    key: string;
    value: QueuedVoiceNote;
    indexes: {
      'by-status': QueueStatus;
      'by-queuedAt': Date;
    };
  };
}

/** Cached database instance */
let dbInstance: IDBPDatabase<OfflineDbSchema> | null = null;

/**
 * Initialize or get the IndexedDB database instance.
 * Creates the database and object store if they don't exist.
 */
export async function initOfflineDb(): Promise<IDBPDatabase<OfflineDbSchema>> {
  // Check if cached instance is still valid
  if (dbInstance) {
    try {
      // Attempt a simple operation to verify the connection
      void dbInstance.objectStoreNames;
      return dbInstance;
    } catch {
      // Connection is stale, clear the cache
      dbInstance = null;
    }
  }

  dbInstance = await openDB<OfflineDbSchema>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('by-status', 'status');
        store.createIndex('by-queuedAt', 'queuedAt');
      }
    },
  });

  return dbInstance;
}

/**
 * Close the database connection and clear the cached instance.
 * Useful for testing cleanup.
 */
export function closeOfflineDb(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

/**
 * Add a voice note transcript to the offline queue.
 *
 * @param transcript - The voice note transcript text
 * @returns The created queue entry
 */
export async function addToQueue(transcript: string): Promise<QueuedVoiceNote> {
  const db = await initOfflineDb();

  const note: QueuedVoiceNote = {
    id: uuidv4(),
    transcript,
    queuedAt: new Date(),
    status: 'pending',
    retryCount: 0,
  };

  await db.put(STORE_NAME, note);
  return note;
}

/**
 * Get all queued voice notes, sorted by queue time (oldest first).
 */
export async function getQueuedNotes(): Promise<QueuedVoiceNote[]> {
  const db = await initOfflineDb();
  const notes = await db.getAllFromIndex(STORE_NAME, 'by-queuedAt');
  return notes;
}

/**
 * Get only pending voice notes (not processing or failed).
 */
export async function getPendingNotes(): Promise<QueuedVoiceNote[]> {
  const db = await initOfflineDb();
  const notes = await db.getAllFromIndex(STORE_NAME, 'by-status', 'pending');
  return notes;
}

/**
 * Update the status of a queued note.
 *
 * @param id - The note ID
 * @param status - New status
 * @param errorMessage - Error message (for failed status)
 * @throws Error if note doesn't exist
 */
export async function updateNoteStatus(
  id: string,
  status: QueueStatus,
  errorMessage?: string
): Promise<void> {
  const db = await initOfflineDb();
  const note = await db.get(STORE_NAME, id);

  if (!note) {
    throw new Error(`Note with id ${id} not found`);
  }

  const updatedNote: QueuedVoiceNote = {
    ...note,
    status,
    errorMessage: status === 'failed' ? errorMessage : undefined,
    retryCount: status === 'failed' ? note.retryCount + 1 : note.retryCount,
  };

  await db.put(STORE_NAME, updatedNote);
}

/**
 * Remove a note from the queue by ID.
 */
export async function removeFromQueue(id: string): Promise<void> {
  const db = await initOfflineDb();
  await db.delete(STORE_NAME, id);
}

/**
 * Clear all notes from the queue.
 */
export async function clearQueue(): Promise<void> {
  const db = await initOfflineDb();
  await db.clear(STORE_NAME);
}
