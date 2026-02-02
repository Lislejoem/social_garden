'use client';

import { Loader2 } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmText: string;
  confirmVariant?: 'danger' | 'default';
  isLoading?: boolean;
}

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  confirmVariant = 'default',
  isLoading = false,
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  const confirmButtonClass =
    confirmVariant === 'danger'
      ? 'bg-red-600 hover:bg-red-700 text-white'
      : 'bg-grove-primary hover:bg-grove-primary/90 text-white';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={isLoading ? undefined : onClose}
      />

      {/* Modal */}
      <div className="relative glass-floating rounded-3xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Content */}
        <div className="p-6">
          <h2 className="text-xl font-serif font-bold text-ink-rich mb-3">
            {title}
          </h2>
          <p className="text-ink-muted">{message}</p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-white/30 bg-white/30">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2.5 text-stone-600 text-sm font-medium rounded-xl border border-stone-200 hover:bg-white disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2.5 text-sm font-medium rounded-xl disabled:opacity-50 flex items-center gap-2 transition-colors ${confirmButtonClass}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {confirmText}
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
