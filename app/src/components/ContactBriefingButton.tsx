'use client';

import { Sparkles } from 'lucide-react';

interface ContactBriefingButtonProps {
  onClick: () => void;
}

export default function ContactBriefingButton({ onClick }: ContactBriefingButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:from-violet-500 hover:to-indigo-500 transition-all"
    >
      <Sparkles className="w-4 h-4" />
      Prep for Chat
    </button>
  );
}
