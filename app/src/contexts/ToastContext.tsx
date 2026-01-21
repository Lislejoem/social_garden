'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import Toast from '../components/Toast';

interface ToastState {
  message: string;
  type: 'success' | 'error';
  onRetry?: () => void;
}

interface ToastContextValue {
  showToast: (message: string, type?: 'success' | 'error') => void;
  showError: (message: string, onRetry?: () => void) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  }, []);

  const showError = useCallback((message: string, onRetry?: () => void) => {
    setToast({ message, type: 'error', onRetry });
  }, []);

  const handleClose = useCallback(() => {
    setToast(null);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, showError }}>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={handleClose}
          onRetry={toast.onRetry}
        />
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
