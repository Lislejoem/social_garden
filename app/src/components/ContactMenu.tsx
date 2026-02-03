'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, EyeOff, Eye, Trash2, Loader2 } from 'lucide-react';
import ConfirmationDialog from './ConfirmationDialog';

interface ContactMenuProps {
  contactName: string;
  isHidden?: boolean;
  onHide: () => Promise<void>;
  onRestore?: () => Promise<void>;
  onDelete: () => Promise<void>;
  triggerClassName?: string;
}

export default function ContactMenu({
  contactName,
  isHidden = false,
  onHide,
  onRestore,
  onDelete,
  triggerClassName = '',
}: ContactMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<'hide' | 'restore' | 'delete' | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleHide = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    setLoadingAction('hide');
    try {
      await onHide();
      setIsOpen(false);
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  const handleRestore = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onRestore) return;
    setIsLoading(true);
    setLoadingAction('restore');
    try {
      await onRestore();
      setIsOpen(false);
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsLoading(true);
    setLoadingAction('delete');
    try {
      await onDelete();
      setIsConfirmOpen(false);
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={handleTriggerClick}
          className={`p-1 text-stone-300 hover:text-stone-600 transition-colors ${triggerClassName}`}
          aria-haspopup="menu"
          aria-expanded={isOpen}
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>

        {isOpen && (
          <div
            className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
            role="menu"
          >
            {/* Hide/Restore option */}
            {isHidden ? (
              <button
                onClick={handleRestore}
                disabled={isLoading}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-stone-50 transition-colors text-left disabled:opacity-50"
                role="menuitem"
              >
                {loadingAction === 'restore' ? (
                  <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
                ) : (
                  <Eye className="w-5 h-5 text-emerald-600" />
                )}
                <div>
                  <p className="font-medium text-stone-800">Restore to Grove</p>
                  <p className="text-xs text-stone-400">Show in your grove again</p>
                </div>
              </button>
            ) : (
              <button
                onClick={handleHide}
                disabled={isLoading}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-stone-50 transition-colors text-left disabled:opacity-50"
                role="menuitem"
              >
                {loadingAction === 'hide' ? (
                  <Loader2 className="w-5 h-5 text-stone-600 animate-spin" />
                ) : (
                  <EyeOff className="w-5 h-5 text-stone-600" />
                )}
                <div>
                  <p className="font-medium text-stone-800">Hide from Grove</p>
                  <p className="text-xs text-stone-400">Keep their info, just don&apos;t show them</p>
                </div>
              </button>
            )}

            {/* Divider */}
            <div className="my-2 border-t border-stone-100" />

            {/* Delete option */}
            <button
              onClick={handleDeleteClick}
              disabled={isLoading}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-50 transition-colors text-left disabled:opacity-50"
              role="menuitem"
            >
              <Trash2 className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-medium text-red-600">Remove Permanently</p>
                <p className="text-xs text-stone-400">Delete this contact and all their data</p>
              </div>
            </button>
          </div>
        )}
      </div>

      <ConfirmationDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title={`Remove ${contactName} permanently?`}
        message={`This will delete ${contactName} and all their interactions, preferences, and seedlings. This can't be undone.`}
        confirmText="Remove Permanently"
        confirmVariant="danger"
        isLoading={loadingAction === 'delete'}
      />
    </>
  );
}
