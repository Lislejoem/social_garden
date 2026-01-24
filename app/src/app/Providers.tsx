'use client';

import { ReactNode } from 'react';
import { ToastProvider } from '../contexts/ToastContext';
import { OfflineQueueProvider } from '../contexts/OfflineQueueContext';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <OfflineQueueProvider>{children}</OfflineQueueProvider>
    </ToastProvider>
  );
}
