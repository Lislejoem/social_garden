'use client';

import { useState, useRef, useEffect } from 'react';
import { Clock, ChevronDown, Check, Loader2 } from 'lucide-react';
import type { Cadence } from '@/types';

const CADENCE_OPTIONS: { value: Cadence; label: string; description: string }[] = [
  { value: 'OFTEN', label: 'Often', description: 'Weekly or more' },
  { value: 'REGULARLY', label: 'Regularly', description: 'Every 2-3 weeks' },
  { value: 'SELDOMLY', label: 'Seldomly', description: 'Monthly' },
  { value: 'RARELY', label: 'Rarely', description: 'A few times a year' },
];

interface EditableCadenceProps {
  value: Cadence;
  onSave: (value: Cadence) => Promise<void>;
}

export default function EditableCadence({ value, onSave }: EditableCadenceProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentOption = CADENCE_OPTIONS.find((opt) => opt.value === value);

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

  const handleSelect = async (newValue: Cadence) => {
    if (newValue === value) {
      setIsOpen(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(newValue);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to save cadence:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSaving}
        className="flex items-center gap-1.5 px-3 py-1 bg-white border border-stone-100 rounded-full text-xs font-bold uppercase tracking-wider hover:border-stone-200 hover:bg-stone-50 transition-all"
      >
        {isSaving ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Clock className="w-3.5 h-3.5" />
        )}
        <span>{currentOption?.label}</span>
        <ChevronDown
          className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {CADENCE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-stone-50 transition-colors"
            >
              <div className="text-left">
                <p className="font-medium text-stone-800">{option.label}</p>
                <p className="text-xs text-stone-400">{option.description}</p>
              </div>
              {option.value === value && (
                <Check className="w-4 h-4 text-emerald-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
