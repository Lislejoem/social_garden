'use client';

import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';

interface ConfirmationToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export default function ConfirmationToast({
  message,
  onClose,
  duration = 4000,
}: ConfirmationToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const showTimer = setTimeout(() => setIsVisible(true), 10);

    // Auto-dismiss
    const dismissTimer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(onClose, 300);
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(dismissTimer);
    };
  }, [duration, onClose]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`fixed bottom-6 left-1/2 z-50 transform -translate-x-1/2 transition-all duration-300 ${
        isVisible && !isLeaving
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="bg-emerald-900 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-4">
        <div className="w-8 h-8 bg-emerald-700 rounded-full flex items-center justify-center shrink-0">
          <Check className="w-5 h-5" />
        </div>
        <p className="font-medium">{message}</p>
        <button
          onClick={handleClose}
          className="p-1.5 hover:bg-emerald-800 rounded-lg transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
