/**
 * @file Tests for offline queue operations
 * @description TDD tests for IndexedDB-based voice note queue
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import 'fake-indexeddb/auto';
import { deleteDB } from 'idb';
import {
  initOfflineDb,
  addToQueue,
  getQueuedNotes,
  getPendingNotes,
  updateNoteStatus,
  removeFromQueue,
  clearQueue,
  closeOfflineDb,
} from './offline-queue';

const DB_NAME = 'grove-offline';

describe('offline-queue', () => {
  beforeEach(async () => {
    // Close any existing connection and clean up database before each test
    closeOfflineDb();
    await deleteDB(DB_NAME);
  });

  afterEach(async () => {
    // Close connection and clean up after each test
    closeOfflineDb();
    await deleteDB(DB_NAME);
  });

  describe('initOfflineDb', () => {
    it('creates database with voiceQueue store', async () => {
      const db = await initOfflineDb();
      expect(db.objectStoreNames.contains('voiceQueue')).toBe(true);
      db.close();
    });
  });

  describe('addToQueue', () => {
    it('adds a voice note to the queue', async () => {
      const note = await addToQueue('Test transcript');
      expect(note.transcript).toBe('Test transcript');
    });

    it('generates a unique ID for the note', async () => {
      const note1 = await addToQueue('Transcript 1');
      const note2 = await addToQueue('Transcript 2');
      expect(note1.id).toBeDefined();
      expect(note2.id).toBeDefined();
      expect(note1.id).not.toBe(note2.id);
    });

    it('sets initial status to pending', async () => {
      const note = await addToQueue('Test transcript');
      expect(note.status).toBe('pending');
    });

    it('sets retryCount to 0', async () => {
      const note = await addToQueue('Test transcript');
      expect(note.retryCount).toBe(0);
    });

    it('sets queuedAt to current time', async () => {
      const before = new Date();
      const note = await addToQueue('Test transcript');
      const after = new Date();

      expect(new Date(note.queuedAt).getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(new Date(note.queuedAt).getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('getQueuedNotes', () => {
    it('returns all queued notes', async () => {
      await addToQueue('Transcript 1');
      await addToQueue('Transcript 2');
      await addToQueue('Transcript 3');

      const notes = await getQueuedNotes();
      expect(notes).toHaveLength(3);
    });

    it('returns notes sorted by queuedAt (oldest first)', async () => {
      // Add notes with explicit delays to ensure different timestamps
      await addToQueue('First');
      await new Promise(resolve => setTimeout(resolve, 10));
      await addToQueue('Second');
      await new Promise(resolve => setTimeout(resolve, 10));
      await addToQueue('Third');

      const notes = await getQueuedNotes();
      expect(notes[0].transcript).toBe('First');
      expect(notes[1].transcript).toBe('Second');
      expect(notes[2].transcript).toBe('Third');
    });

    it('returns empty array when queue is empty', async () => {
      const notes = await getQueuedNotes();
      expect(notes).toHaveLength(0);
    });
  });

  describe('getPendingNotes', () => {
    it('returns only notes with pending status', async () => {
      await addToQueue('Pending 1');
      await addToQueue('Pending 2');
      const note3 = await addToQueue('Will be processing');

      await updateNoteStatus(note3.id, 'processing');

      const pending = await getPendingNotes();
      expect(pending).toHaveLength(2);
      expect(pending.map(n => n.transcript)).toContain('Pending 1');
      expect(pending.map(n => n.transcript)).toContain('Pending 2');
    });

    it('excludes failed notes', async () => {
      await addToQueue('Pending');
      const note2 = await addToQueue('Failed');

      await updateNoteStatus(note2.id, 'failed', 'Some error');

      const pending = await getPendingNotes();
      expect(pending).toHaveLength(1);
      expect(pending[0].transcript).toBe('Pending');
    });
  });

  describe('updateNoteStatus', () => {
    it('updates status to processing', async () => {
      const note = await addToQueue('Test');
      await updateNoteStatus(note.id, 'processing');

      const notes = await getQueuedNotes();
      expect(notes[0].status).toBe('processing');
    });

    it('updates status to failed with error message', async () => {
      const note = await addToQueue('Test');
      await updateNoteStatus(note.id, 'failed', 'Network error');

      const notes = await getQueuedNotes();
      expect(notes[0].status).toBe('failed');
      expect(notes[0].errorMessage).toBe('Network error');
    });

    it('increments retryCount when updating to failed', async () => {
      const note = await addToQueue('Test');

      await updateNoteStatus(note.id, 'failed', 'Error 1');
      let notes = await getQueuedNotes();
      expect(notes[0].retryCount).toBe(1);

      await updateNoteStatus(notes[0].id, 'pending'); // Reset to retry
      await updateNoteStatus(notes[0].id, 'failed', 'Error 2');

      notes = await getQueuedNotes();
      expect(notes[0].retryCount).toBe(2);
    });

    it('throws error for non-existent note', async () => {
      await expect(updateNoteStatus('non-existent-id', 'processing'))
        .rejects.toThrow();
    });
  });

  describe('removeFromQueue', () => {
    it('removes a note by ID', async () => {
      await addToQueue('To keep');
      const note2 = await addToQueue('To remove');

      await removeFromQueue(note2.id);

      const notes = await getQueuedNotes();
      expect(notes).toHaveLength(1);
      expect(notes[0].transcript).toBe('To keep');
    });

    it('does nothing if note does not exist', async () => {
      await addToQueue('Test');

      // Should not throw
      await removeFromQueue('non-existent-id');

      const notes = await getQueuedNotes();
      expect(notes).toHaveLength(1);
    });
  });

  describe('clearQueue', () => {
    it('removes all notes from queue', async () => {
      await addToQueue('Note 1');
      await addToQueue('Note 2');
      await addToQueue('Note 3');

      await clearQueue();

      const notes = await getQueuedNotes();
      expect(notes).toHaveLength(0);
    });

    it('works when queue is already empty', async () => {
      await clearQueue();
      const notes = await getQueuedNotes();
      expect(notes).toHaveLength(0);
    });
  });
});
