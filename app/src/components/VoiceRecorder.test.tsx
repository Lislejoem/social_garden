import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import VoiceRecorder from './VoiceRecorder';
import { OfflineQueueProvider } from '../contexts/OfflineQueueContext';

// Mock the offline-queue module to avoid IndexedDB issues in tests
vi.mock('../lib/offline-queue', () => ({
  addToQueue: vi.fn(),
  getQueuedNotes: vi.fn().mockResolvedValue([]),
  getPendingNotes: vi.fn().mockResolvedValue([]),
  removeFromQueue: vi.fn(),
  updateNoteStatus: vi.fn(),
}));

// Wrapper with required providers
const renderWithProviders = (ui: React.ReactElement) => {
  return render(<OfflineQueueProvider>{ui}</OfflineQueueProvider>);
};

// Store mock instance for test access
let mockRecognitionInstance: MockSpeechRecognition | null = null;

// Mock SpeechRecognition class
class MockSpeechRecognition {
  continuous = false;
  interimResults = false;
  lang = '';
  onresult: ((event: unknown) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;
  onend: (() => void) | null = null;

  start = vi.fn();
  stop = vi.fn();
  abort = vi.fn();

  constructor() {
    mockRecognitionInstance = this;
  }
}

// Helper to create mock SpeechRecognitionEvent
const createMockResultEvent = (
  results: Array<{ transcript: string; isFinal: boolean }>,
  resultIndex: number = 0
) => ({
  resultIndex,
  results: {
    length: results.length,
    item: (index: number) => ({
      isFinal: results[index].isFinal,
      length: 1,
      item: () => ({ transcript: results[index].transcript, confidence: 0.9 }),
      0: { transcript: results[index].transcript, confidence: 0.9 },
    }),
    ...results.reduce(
      (acc, r, i) => ({
        ...acc,
        [i]: {
          isFinal: r.isFinal,
          length: 1,
          item: () => ({ transcript: r.transcript, confidence: 0.9 }),
          0: { transcript: r.transcript, confidence: 0.9 },
        },
      }),
      {}
    ),
  },
});

describe('VoiceRecorder', () => {
  const mockOnTranscriptComplete = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    mockRecognitionInstance = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).SpeechRecognition = MockSpeechRecognition;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).webkitSpeechRecognition = MockSpeechRecognition;
    vi.clearAllMocks();
  });

  afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).SpeechRecognition;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).webkitSpeechRecognition;
    mockRecognitionInstance = null;
  });

  const startRecording = () => {
    const micButton = screen.getByTitle('Record a voice note');
    fireEvent.click(micButton);
  };

  describe('transcript handling', () => {
    it('displays interim results while speaking', () => {
      renderWithProviders(<VoiceRecorder onTranscriptComplete={mockOnTranscriptComplete} />);
      startRecording();

      act(() => {
        mockRecognitionInstance?.onresult?.(
          createMockResultEvent([{ transcript: "I'm at", isFinal: false }], 0)
        );
      });

      expect(screen.getByText("I'm at")).toBeInTheDocument();
    });

    it('does not duplicate finalized text on subsequent events (Android fix)', () => {
      renderWithProviders(<VoiceRecorder onTranscriptComplete={mockOnTranscriptComplete} />);
      startRecording();

      // Event 1: First interim result
      act(() => {
        mockRecognitionInstance?.onresult?.(
          createMockResultEvent([{ transcript: "I'm", isFinal: false }], 0)
        );
      });

      // Event 2: First result finalized, new interim starts
      act(() => {
        mockRecognitionInstance?.onresult?.(
          createMockResultEvent(
            [
              { transcript: "I'm", isFinal: true },
              { transcript: 'at', isFinal: false },
            ],
            0
          )
        );
      });

      // Event 3: resultIndex=1 means result[0] unchanged
      act(() => {
        mockRecognitionInstance?.onresult?.(
          createMockResultEvent(
            [
              { transcript: "I'm", isFinal: true },
              { transcript: 'at the', isFinal: false },
            ],
            1
          )
        );
      });

      // Should show "I'm at the", NOT "I'm I'm at the"
      const transcriptArea = screen.getByText(/I'm/);
      expect(transcriptArea.textContent).toBe("I'm at the");
    });

    it('accumulates finalized text correctly across multiple segments', () => {
      renderWithProviders(<VoiceRecorder onTranscriptComplete={mockOnTranscriptComplete} />);
      startRecording();

      // First segment finalized
      act(() => {
        mockRecognitionInstance?.onresult?.(
          createMockResultEvent([{ transcript: 'Hello there', isFinal: true }], 0)
        );
      });

      // Second segment finalized (resultIndex=1)
      act(() => {
        mockRecognitionInstance?.onresult?.(
          createMockResultEvent(
            [
              { transcript: 'Hello there', isFinal: true },
              { transcript: 'how are you', isFinal: true },
            ],
            1
          )
        );
      });

      expect(screen.getByText('Hello there how are you')).toBeInTheDocument();
    });

    it('shows only current interim result, not concatenated interims', () => {
      renderWithProviders(<VoiceRecorder onTranscriptComplete={mockOnTranscriptComplete} />);
      startRecording();

      // First interim
      act(() => {
        mockRecognitionInstance?.onresult?.(
          createMockResultEvent([{ transcript: 'I', isFinal: false }], 0)
        );
      });

      // Updated interim (same index, updated transcript)
      act(() => {
        mockRecognitionInstance?.onresult?.(
          createMockResultEvent([{ transcript: 'I am', isFinal: false }], 0)
        );
      });

      // Should show "I am", NOT "I I am"
      const text = screen.getByText(/I am/);
      expect(text.textContent).toBe('I am');
    });

    it('resets transcript when starting new recording', () => {
      renderWithProviders(<VoiceRecorder onTranscriptComplete={mockOnTranscriptComplete} />);

      // First recording
      startRecording();

      act(() => {
        mockRecognitionInstance?.onresult?.(
          createMockResultEvent([{ transcript: 'First recording', isFinal: true }], 0)
        );
      });

      expect(screen.getByText(/First recording/)).toBeInTheDocument();

      // Stop recording
      fireEvent.click(screen.getByText('Stop Recording'));

      // Start new recording via "Record More"
      fireEvent.click(screen.getByText('Record More'));

      // New recording should start fresh
      act(() => {
        mockRecognitionInstance?.onresult?.(
          createMockResultEvent([{ transcript: 'Second recording', isFinal: false }], 0)
        );
      });

      // Should NOT contain "First recording"
      expect(screen.queryByText(/First recording/)).not.toBeInTheDocument();
      expect(screen.getByText('Second recording')).toBeInTheDocument();
    });
  });
});
