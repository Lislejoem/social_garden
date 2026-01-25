/**
 * @file Tests for OfflineQueueContext
 * @description TDD tests for offline queue state management context
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import 'fake-indexeddb/auto';
import { OfflineQueueProvider, useOfflineQueue } from './OfflineQueueContext';
import { clearQueue } from '../lib/offline-queue';

// Wrapper component for testing hooks
const wrapper = ({ children }: { children: ReactNode }) => (
  <OfflineQueueProvider>{children}</OfflineQueueProvider>
);

describe('OfflineQueueContext', () => {
  beforeEach(async () => {
    // Reset navigator.onLine
    Object.defineProperty(global.navigator, 'onLine', {
      value: true,
      writable: true,
      configurable: true,
    });
    // Clear the queue (don't delete the DB, just clear it)
    try {
      await clearQueue();
    } catch {
      // Ignore if DB doesn't exist yet
    }
  });

  afterEach(async () => {
    // Clear queue after tests
    try {
      await clearQueue();
    } catch {
      // Ignore errors
    }
  });

  it('provides queue state to children', () => {
    const { result } = renderHook(() => useOfflineQueue(), { wrapper });

    expect(result.current.queueCount).toBe(0);
    expect(result.current.isOnline).toBe(true);
    expect(typeof result.current.addToQueue).toBe('function');
    expect(typeof result.current.processQueue).toBe('function');
  });

  it('throws error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useOfflineQueue());
    }).toThrow('useOfflineQueue must be used within an OfflineQueueProvider');

    consoleSpy.mockRestore();
  });

  it('adds to queue and updates count', async () => {
    const { result } = renderHook(() => useOfflineQueue(), { wrapper });

    expect(result.current.queueCount).toBe(0);

    await act(async () => {
      await result.current.addToQueue('Test transcript');
    });

    expect(result.current.queueCount).toBe(1);

    await act(async () => {
      await result.current.addToQueue('Another transcript');
    });

    expect(result.current.queueCount).toBe(2);
  });

  it('loads existing queue on mount', async () => {
    // First, add items to the queue directly
    const { addToQueue } = await import('../lib/offline-queue');
    await addToQueue('Pre-existing note 1');
    await addToQueue('Pre-existing note 2');

    const { result } = renderHook(() => useOfflineQueue(), { wrapper });

    // Wait for the queue to load
    await waitFor(() => {
      expect(result.current.queueCount).toBe(2);
    }, { timeout: 2000 });
  });

  it('reflects online/offline status', async () => {
    Object.defineProperty(global.navigator, 'onLine', {
      value: true,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useOfflineQueue(), { wrapper });

    expect(result.current.isOnline).toBe(true);

    await act(async () => {
      window.dispatchEvent(new Event('offline'));
    });

    expect(result.current.isOnline).toBe(false);

    await act(async () => {
      window.dispatchEvent(new Event('online'));
    });

    expect(result.current.isOnline).toBe(true);
  });

  it('provides queued notes via getQueuedNotes', async () => {
    const { result } = renderHook(() => useOfflineQueue(), { wrapper });

    await act(async () => {
      await result.current.addToQueue('First note');
    });
    await act(async () => {
      await result.current.addToQueue('Second note');
    });

    const notes = await result.current.getQueuedNotes();
    expect(notes).toHaveLength(2);
    // Check that both notes are present (order may vary due to timing)
    const transcripts = notes.map(n => n.transcript);
    expect(transcripts).toContain('First note');
    expect(transcripts).toContain('Second note');
  });

  it('removes from queue and updates count', async () => {
    const { result } = renderHook(() => useOfflineQueue(), { wrapper });

    await act(async () => {
      await result.current.addToQueue('To be removed');
    });

    expect(result.current.queueCount).toBe(1);

    const notes = await result.current.getQueuedNotes();

    await act(async () => {
      await result.current.removeFromQueue(notes[0].id);
    });

    expect(result.current.queueCount).toBe(0);
  });
});
