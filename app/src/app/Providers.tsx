'use client';

import { ReactNode } from 'react';
import { ToastProvider } from '../contexts/ToastContext';
import { OfflineQueueProvider } from '../contexts/OfflineQueueContext';
import { UserSettingsProvider } from '../contexts/UserSettingsContext';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <OfflineQueueProvider>
        <UserSettingsProvider>{children}</UserSettingsProvider>
      </OfflineQueueProvider>
    </ToastProvider>
  );
}
