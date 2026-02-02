'use client';

import { useState, useEffect } from 'react';
import { X, RefreshCw, Sparkles, MessageCircle, Calendar, TrendingUp, Clock } from 'lucide-react';
import type { ContactBriefing as BriefingType } from '@/types';

interface ContactBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactId: string;
  contactName: string;
}

export default function ContactBriefingModal({
  isOpen,
  onClose,
  contactId,
  contactName,
}: ContactBriefingModalProps) {
  const [briefing, setBriefing] = useState<BriefingType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const [fetchedForContact, setFetchedForContact] = useState<string | null>(null);

  const fetchBriefing = async (forceRefresh = false) => {
    try {
      setError(null);
      if (forceRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const url = forceRefresh
        ? `/api/contacts/${contactId}/briefing?forceRefresh=true`
        : `/api/contacts/${contactId}/briefing`;

      const response = await fetch(url, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate briefing');
      }

      const data = await response.json();
      setBriefing(data.briefing);
      setIsFromCache(data.fromCache ?? false);
      setFetchedForContact(contactId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate briefing');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Fetch when modal opens, but only if we haven't already fetched for this contact
  useEffect(() => {
    if (isOpen && fetchedForContact !== contactId) {
      fetchBriefing();
    }
  }, [isOpen, contactId, fetchedForContact]);

  const handleRefresh = () => {
    fetchBriefing(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative glass-floating rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/30">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-grove-primary/10 rounded-2xl text-grove-primary">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-ink-rich">
                Conversation Prep
              </h2>
              <p className="text-sm text-grove-primary">{contactName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isFromCache && !isLoading && !isRefreshing && briefing && (
              <span className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-grove-primary bg-grove-primary/10 rounded-full">
                <Clock className="w-3 h-3" />
                Cached
              </span>
            )}
            {briefing && !isLoading && (
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-grove-primary bg-white/50 rounded-xl border border-grove-primary/20 hover:bg-grove-primary/10 transition-colors disabled:opacity-50"
                aria-label="Refresh briefing"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-600 hover:bg-white/50 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 text-grove-primary animate-spin mr-3" />
              <span className="text-grove-primary">Generating briefing for {contactName}...</span>
            </div>
          )}

          {error && !isLoading && (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">Failed to generate briefing. Please try again.</p>
              <button
                onClick={() => fetchBriefing()}
                className="flex items-center gap-2 mx-auto px-4 py-2 text-sm font-medium text-grove-primary bg-white/50 rounded-xl border border-grove-primary/20 hover:bg-grove-primary/10 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          )}

          {briefing && !isLoading && (
            <div className={isRefreshing ? 'opacity-50' : ''}>
              {/* Relationship Summary */}
              <div className="mb-6 p-4 glass-card">
                <p className="text-ink-rich leading-relaxed">{briefing.relationshipSummary}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Highlights */}
                {briefing.recentHighlights.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-4 h-4 text-grove-primary" />
                      <h3 className="font-semibold text-ink-rich">Recent Highlights</h3>
                    </div>
                    <ul className="space-y-2">
                      {briefing.recentHighlights.map((highlight, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-ink-muted">
                          <span className="text-grove-primary mt-1">•</span>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Conversation Starters */}
                {briefing.conversationStarters.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <MessageCircle className="w-4 h-4 text-grove-primary" />
                      <h3 className="font-semibold text-ink-rich">Ask About</h3>
                    </div>
                    <ul className="space-y-2">
                      {briefing.conversationStarters.map((starter, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-ink-muted">
                          <span className="text-grove-primary mt-1">•</span>
                          {starter}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Upcoming Milestones */}
              {briefing.upcomingMilestones.length > 0 && (
                <div className="mt-6 pt-6 border-t border-white/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-grove-primary" />
                    <h3 className="font-semibold text-ink-rich">Remember</h3>
                  </div>
                  <ul className="space-y-2">
                    {briefing.upcomingMilestones.map((milestone, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-ink-muted">
                        <span className="text-grove-primary mt-1">•</span>
                        {milestone}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
