'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import EditableInteraction from './EditableInteraction';
import type { Interaction, InteractionType, MessagePlatform } from '@/types';

interface InteractionTimelineProps {
  interactions: Interaction[];
  onUpdate?: (id: string, data: { summary?: string; date?: string; type?: InteractionType; platform?: MessagePlatform | null }) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export default function InteractionTimeline({
  interactions,
  onUpdate,
  onDelete,
}: InteractionTimelineProps) {
  const [showAll, setShowAll] = useState(false);

  if (interactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-ink-muted italic">No interactions recorded yet</p>
        <p className="text-ink-muted/60 text-sm mt-2">
          Use the voice recorder or quick log buttons to record your conversations
        </p>
      </div>
    );
  }

  // If handlers are provided, use editable interactions
  const isEditable = onUpdate && onDelete;
  const hasMore = interactions.length > 5;
  const displayedInteractions = showAll ? interactions : interactions.slice(0, 5);

  return (
    <div className="space-y-8 pt-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif font-bold text-ink-rich">Recent Growth</h2>
        {hasMore && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-1 text-sm font-bold text-grove-primary hover:text-grove-primary-hover soft-press transition-colors"
          >
            {showAll ? (
              <>
                Show Less
                <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                View All History ({interactions.length})
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>
      <div className="space-y-6">
        {displayedInteractions.map((log) =>
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

      {/* Collapsed state indicator */}
      {hasMore && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full py-4 text-center text-ink-muted hover:text-grove-primary text-sm font-medium transition-colors rounded-2xl hover:bg-white/30 soft-press"
        >
          + {interactions.length - 5} more interactions
        </button>
      )}
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

  const getDisplayLabel = (type: InteractionType, platform?: MessagePlatform | null): string => {
    if (type === 'MESSAGE' && platform) {
      return platform.charAt(0).toUpperCase() + platform.slice(1);
    }
    return type;
  };

  return (
    <div className="relative pl-8 pb-8 border-l-2 border-white/50 last:border-0 last:pb-0">
      <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-grove-primary shadow-sm" />
      <div className="flex items-center gap-3 mb-2">
        <span className="text-xs font-bold text-ink-muted uppercase tracking-widest">
          {formatDate(interaction.date)}
        </span>
        <span className="px-2 py-0.5 bg-white/50 text-[10px] font-bold rounded-md text-ink-muted">
          {getDisplayLabel(interaction.type, interaction.platform)}
        </span>
      </div>
      <p className="text-ink-rich leading-relaxed glass-card p-5 rounded-2xl">
        {interaction.summary}
      </p>
    </div>
  );
}
