'use client';

/**
 * @file OfflineQueueContext
 * @description React context for managing offline voice note queue.
 * Provides state management for queued notes and auto-sync when back online.
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import {
  addToQueue as addToQueueDb,
  getQueuedNotes as getQueuedNotesDb,
  getPendingNotes,
  removeFromQueue as removeFromQueueDb,
  updateNoteStatus,
  type QueuedVoiceNote,
} from '../lib/offline-queue';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface OfflineQueueContextValue {
  /** Number of items in the queue */
  queueCount: number;
  /** Current online status */
  isOnline: boolean;
  /** Add a transcript to the offline queue */
  addToQueue: (transcript: string) => Promise<QueuedVoiceNote>;
  /** Get all queued notes */
  getQueuedNotes: () => Promise<QueuedVoiceNote[]>;
  /** Remove a note from the queue */
  removeFromQueue: (id: string) => Promise<void>;
  /** Process all pending notes (called automatically when coming online) */
  processQueue: (
    processor: (note: QueuedVoiceNote) => Promise<void>
  ) => Promise<void>;
}

const OfflineQueueContext = createContext<OfflineQueueContextValue | null>(
  null
);

interface OfflineQueueProviderProps {
  children: ReactNode;
}

export function OfflineQueueProvider({ children }: OfflineQueueProviderProps) {
  const [queueCount, setQueueCount] = useState(0);
  const isOnline = useOnlineStatus();

  // Load queue count on mount
  useEffect(() => {
    const loadQueueCount = async () => {
      try {
        const notes = await getQueuedNotesDb();
        setQueueCount(notes.length);
      } catch (error) {
        console.error('Failed to load offline queue:', error);
      }
    };

    loadQueueCount();
  }, []);

  const addToQueue = useCallback(async (transcript: string) => {
    const note = await addToQueueDb(transcript);
    setQueueCount((prev) => prev + 1);
    return note;
  }, []);

  const getQueuedNotes = useCallback(async () => {
    return await getQueuedNotesDb();
  }, []);

  const removeFromQueue = useCallback(async (id: string) => {
    await removeFromQueueDb(id);
    setQueueCount((prev) => Math.max(0, prev - 1));
  }, []);

  const processQueue = useCallback(
    async (processor: (note: QueuedVoiceNote) => Promise<void>) => {
      const pending = await getPendingNotes();

      for (const note of pending) {
        try {
          await updateNoteStatus(note.id, 'processing');
          await processor(note);
          await removeFromQueueDb(note.id);
          setQueueCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          await updateNoteStatus(note.id, 'failed', errorMessage);
        }
      }
    },
    []
  );

  return (
    <OfflineQueueContext.Provider
      value={{
        queueCount,
        isOnline,
        addToQueue,
        getQueuedNotes,
        removeFromQueue,
        processQueue,
      }}
    >
      {children}
    </OfflineQueueContext.Provider>
  );
}

export function useOfflineQueue(): OfflineQueueContextValue {
  const context = useContext(OfflineQueueContext);
  if (!context) {
    throw new Error(
      'useOfflineQueue must be used within an OfflineQueueProvider'
    );
  }
  return context;
}
