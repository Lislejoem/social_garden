'use client';

import EditableInteraction from './EditableInteraction';
import type { Interaction, InteractionType } from '@/types';

interface InteractionTimelineProps {
  interactions: Interaction[];
  onUpdate?: (id: string, data: { summary?: string; date?: string; type?: InteractionType }) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export default function InteractionTimeline({
  interactions,
  onUpdate,
  onDelete,
}: InteractionTimelineProps) {
  if (interactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-stone-400 italic">No interactions recorded yet</p>
        <p className="text-stone-300 text-sm mt-2">
          Use the voice recorder or quick log buttons to record your conversations
        </p>
      </div>
    );
  }

  // If handlers are provided, use editable interactions
  const isEditable = onUpdate && onDelete;

  return (
    <div className="space-y-8 pt-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif font-bold">Recent Growth</h2>
        {interactions.length > 5 && (
          <button className="text-sm font-bold text-emerald-800 hover:underline">
            View All History
          </button>
        )}
      </div>
      <div className="space-y-6">
        {interactions.slice(0, 5).map((log) =>
          isEditable ? (
            <EditableInteraction
              key={log.id}
              interaction={log}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ) : (
            <ReadOnlyInteraction key={log.id} interaction={log} />
          )
        )}
      </div>
    </div>
  );
}

// Fallback read-only component for backwards compatibility
function ReadOnlyInteraction({ interaction }: { interaction: Interaction }) {
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="relative pl-8 pb-8 border-l-2 border-stone-100 last:border-0 last:pb-0">
      <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-emerald-400 shadow-sm" />
      <div className="flex items-center gap-3 mb-2">
        <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">
          {formatDate(interaction.date)}
        </span>
        <span className="px-2 py-0.5 bg-stone-100 text-[10px] font-bold rounded-md text-stone-500">
          {interaction.type}
        </span>
      </div>
      <p className="text-stone-700 leading-relaxed bg-white p-5 rounded-3xl border border-stone-50 shadow-sm">
        {interaction.summary}
      </p>
    </div>
  );
}
