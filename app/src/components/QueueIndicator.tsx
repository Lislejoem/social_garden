/**
 * @file QueueIndicator.tsx
 * @description Badge indicator showing the number of queued offline voice notes.
 * Uses garden metaphor: "seedlings waiting to be planted"
 */
'use client';

import { Sprout } from 'lucide-react';
import { useOfflineQueue } from '../contexts/OfflineQueueContext';

interface QueueIndicatorProps {
  /** Additional CSS classes */
  className?: string;
}

export default function QueueIndicator({ className = '' }: QueueIndicatorProps) {
  const { queueCount, isOnline } = useOfflineQueue();

  // Don't show anything if queue is empty
  if (queueCount === 0) {
    return null;
  }

  return (
    <div
      className={`absolute -top-2 -right-2 flex items-center justify-center ${className}`}
      title={`${queueCount} seedling${queueCount > 1 ? 's' : ''} waiting to be planted${!isOnline ? ' (offline)' : ''}`}
    >
      <span
        className={`min-w-[24px] h-6 px-1.5 flex items-center justify-center gap-0.5 text-xs font-bold rounded-full ${
          isOnline
            ? 'bg-lime-500 text-white'
            : 'bg-orange-500 text-white animate-pulse'
        }`}
      >
        <Sprout className="w-3 h-3" />
        {queueCount}
      </span>
    </div>
  );
}
