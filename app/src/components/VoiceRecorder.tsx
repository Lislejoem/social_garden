/**
 * @file VoiceRecorder.tsx
 * @description Floating voice recorder button with modal for recording voice notes.
 * Uses Web Speech API for browser-native speech recognition (Chrome/Edge only).
 *
 * @props
 * - onTranscriptComplete: Callback with final transcript text
 *
 * @flow
 * 1. User clicks floating mic button
 * 2. Modal opens with recording interface
 * 3. Speech recognition captures audio and displays interim results
 * 4. User clicks send to submit final transcript
 * 5. onTranscriptComplete callback invoked
 */
'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, X, Send, Loader2 } from 'lucide-react';
import QueueIndicator from './QueueIndicator';

// Web Speech API type declarations
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

interface VoiceRecorderProps {
  onTranscriptComplete: (transcript: string) => Promise<void>;
}

export default function VoiceRecorder({
  onTranscriptComplete,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const finalizedTextRef = useRef<string>('');

  useEffect(() => {
    // Check for browser support
    const SpeechRecognitionAPI =
      typeof window !== 'undefined'
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null;

    if (!SpeechRecognitionAPI) {
      setError('Speech recognition is not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      // Check if all results are final (needed for Android detection)
      let allFinal = true;
      for (let i = 0; i < event.results.length; i++) {
        if (!event.results[i].isFinal) {
          allFinal = false;
          break;
        }
      }

      // Detect Android cumulative mode: all results final AND each result
      // contains the previous (e.g., "I'm" -> "I'm at" -> "I'm at my")
      let isCumulative = false;
      if (allFinal && event.results.length >= 2) {
        // Find the last two non-empty results and check if cumulative
        let last = '';
        let secondToLast = '';
        for (let i = event.results.length - 1; i >= 0; i--) {
          const t = event.results[i][0].transcript.trim();
          if (t) {
            if (!last) {
              last = t;
            } else {
              secondToLast = t;
              break;
            }
          }
        }
        // If the last result starts with the second-to-last, it's cumulative
        if (last && secondToLast && last.startsWith(secondToLast)) {
          isCumulative = true;
        }
      }

      let newTranscript: string;

      if (isCumulative) {
        // Android behavior: all results are final and cumulative
        // Just use the last non-empty result as the complete transcript
        let lastNonEmpty = '';
        for (let i = event.results.length - 1; i >= 0; i--) {
          const transcript = event.results[i][0].transcript.trim();
          if (transcript) {
            lastNonEmpty = transcript;
            break;
          }
        }
        newTranscript = lastNonEmpty;
        // Keep finalizedTextRef in sync for when recording stops
        finalizedTextRef.current = lastNonEmpty ? lastNonEmpty + ' ' : '';
      } else if (allFinal) {
        // Desktop with all-final results but NOT cumulative (segmented)
        // Accumulate all segments
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalizedTextRef.current += result[0].transcript + ' ';
          }
        }
        newTranscript = finalizedTextRef.current.trim();
      } else {
        // Desktop behavior: mix of final and interim results
        // Accumulate finalized segments, show current interim
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalizedTextRef.current += result[0].transcript + ' ';
          }
        }

        let currentInterim = '';
        const lastResult = event.results[event.results.length - 1];
        if (lastResult && !lastResult.isFinal) {
          currentInterim = lastResult[0].transcript;
        }

        newTranscript = finalizedTextRef.current + currentInterim;
      }

      setTranscript(newTranscript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setError(`Error: ${event.error}`);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, []);

  const startRecording = () => {
    if (!recognitionRef.current) return;

    setError(null);
    setTranscript('');
    finalizedTextRef.current = '';
    setIsExpanded(true);
    setIsRecording(true);
    recognitionRef.current.start();
  };

  const stopRecording = () => {
    if (!recognitionRef.current) return;

    recognitionRef.current.stop();
    setIsRecording(false);
  };

  const handleSend = async () => {
    if (!transcript.trim()) return;

    setIsProcessing(true);
    try {
      await onTranscriptComplete(transcript.trim());
      setTranscript('');
      setIsExpanded(false);
    } catch {
      setError('Failed to process note. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    stopRecording();
    setTranscript('');
    setIsExpanded(false);
    setError(null);
  };

  if (!isExpanded) {
    return (
      <div className="fixed bottom-10 right-10 z-50">
        <div className="relative">
          <button
            onClick={startRecording}
            className="w-20 h-20 glass-floating bg-grove-primary/90 text-white rounded-4xl flex items-center justify-center hover:scale-110 hover:-rotate-6 soft-press transition-all"
            title="Record a voice note"
          >
            <Mic className="w-10 h-10" />
          </button>
          <QueueIndicator />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-end justify-center p-4 md:items-center">
      <div className="glass-floating rounded-4xl w-full max-w-lg overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="p-6 border-b border-white/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                isRecording ? 'bg-red-500 animate-pulse' : 'bg-ink-muted'
              }`}
            />
            <h3 className="font-serif text-xl font-bold">
              {isRecording ? 'Listening...' : 'Voice Note'}
            </h3>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 text-ink-muted hover:text-ink-rich rounded-xl hover:bg-white/20 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 glass-card bg-red-500/10 text-red-700 rounded-2xl text-sm">
              {error}
            </div>
          )}

          {/* Recording visualization */}
          {isRecording && (
            <div className="flex items-center justify-center gap-1 h-16 mb-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-grove-primary rounded-full animate-pulse"
                  style={{
                    height: `${20 + Math.random() * 30}px`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '0.5s',
                  }}
                />
              ))}
            </div>
          )}

          {/* Transcript */}
          <div className="min-h-[120px] max-h-[200px] overflow-y-auto">
            {transcript ? (
              <p className="text-ink-rich leading-relaxed">{transcript}</p>
            ) : (
              <p className="text-ink-muted italic">
                {isRecording
                  ? 'Start speaking...'
                  : 'Press the microphone to start recording'}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-white/30 flex gap-3">
          {isRecording ? (
            <button
              onClick={stopRecording}
              className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-600 soft-press transition-all"
            >
              <MicOff className="w-5 h-5" />
              Stop Recording
            </button>
          ) : (
            <>
              <button
                onClick={startRecording}
                className="flex-1 py-4 bg-white/50 text-ink-rich rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/70 soft-press transition-all"
              >
                <Mic className="w-5 h-5" />
                Record More
              </button>
              <button
                onClick={handleSend}
                disabled={!transcript.trim() || isProcessing}
                className="flex-1 py-4 bg-grove-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-grove-primary-hover soft-press transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send to Grove
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
