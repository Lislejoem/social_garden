/**
 * @file useOnlineStatus Hook
 * @description React hook for detecting online/offline network status.
 * Listens to browser online/offline events and updates state accordingly.
 */

import { useState, useEffect } from 'react';

/**
 * Hook that returns the current online status and updates when it changes.
 *
 * @returns true if online, false if offline
 *
 * @example
 * const isOnline = useOnlineStatus();
 * if (!isOnline) {
 *   showToast('You are offline. Changes will be saved locally.');
 * }
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(() => {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    // Default to true for SSR
    return true;
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
