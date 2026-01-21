'use client';

import { useEffect, useState } from 'react';
import { Check, X, AlertCircle, RotateCcw } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  onRetry?: () => void;
  duration?: number;
}

export default function Toast({
  message,
  type,
  onClose,
  onRetry,
  duration,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const defaultDuration = type === 'error' ? 6000 : 4000;
  const actualDuration = duration ?? defaultDuration;

  useEffect(() => {
    // Trigger entrance animation
    const showTimer = setTimeout(() => setIsVisible(true), 10);

    // Auto-dismiss
    const dismissTimer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(onClose, 300);
    }, actualDuration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(dismissTimer);
    };
  }, [actualDuration, onClose]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(onClose, 300);
  };

  const isSuccess = type === 'success';
  const bgColor = isSuccess ? 'bg-emerald-900' : 'bg-red-600';
  const iconBgColor = isSuccess ? 'bg-emerald-700' : 'bg-red-700';
  const hoverColor = isSuccess ? 'hover:bg-emerald-800' : 'hover:bg-red-700';
  const Icon = isSuccess ? Check : AlertCircle;

  return (
    <div
      className={`fixed bottom-6 left-1/2 z-50 transform -translate-x-1/2 transition-all duration-300 ${
        isVisible && !isLeaving
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4'
      }`}
    >
      <div className={`${bgColor} text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-4`}>
        <div className={`w-8 h-8 ${iconBgColor} rounded-full flex items-center justify-center shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
        <p className="font-medium">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className={`px-3 py-1.5 ${hoverColor} rounded-lg transition-colors flex items-center gap-1.5 text-sm font-medium`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Retry
          </button>
        )}
        <button
          onClick={handleClose}
          className={`p-1.5 ${hoverColor} rounded-lg transition-colors shrink-0`}
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
