'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Sparkles, MessageCircle, Calendar, TrendingUp } from 'lucide-react';
import type { ContactBriefing as BriefingType } from '@/types';

interface ContactBriefingProps {
  contactId: string;
  contactName: string;
}

export default function ContactBriefing({ contactId, contactName }: ContactBriefingProps) {
  const [briefing, setBriefing] = useState<BriefingType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBriefing = async () => {
    try {
      setError(null);
      const response = await fetch(`/api/contacts/${contactId}/briefing`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate briefing');
      }

      const data = await response.json();
      setBriefing(data.briefing);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate briefing');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBriefing();
  }, [contactId]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchBriefing();
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-5xl p-8 border border-violet-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-violet-100 rounded-2xl text-violet-600 animate-pulse">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-violet-900">
            Conversation Prep
          </h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 text-violet-400 animate-spin mr-3" />
          <span className="text-violet-600">Generating briefing for {contactName}...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-5xl p-8 border border-violet-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-violet-100 rounded-2xl text-violet-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-violet-900">
              Conversation Prep
            </h2>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-violet-600 bg-white rounded-xl border border-violet-200 hover:bg-violet-50 transition-colors"
            aria-label="Refresh briefing"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
        <div className="text-center py-8 text-red-600">
          <p>Failed to generate briefing. Please try again.</p>
        </div>
      </div>
    );
  }

  if (!briefing) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-5xl p-8 border border-violet-100 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-violet-100 rounded-2xl text-violet-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-violet-900">
            Conversation Prep
          </h2>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-violet-600 bg-white rounded-xl border border-violet-200 hover:bg-violet-50 transition-colors disabled:opacity-50"
          aria-label="Refresh briefing"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Relationship Summary */}
      <div className="mb-6 p-4 bg-white/60 rounded-2xl">
        <p className="text-stone-700 leading-relaxed">{briefing.relationshipSummary}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Highlights */}
        {briefing.recentHighlights.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-violet-500" />
              <h3 className="font-semibold text-violet-900">Recent Highlights</h3>
            </div>
            <ul className="space-y-2">
              {briefing.recentHighlights.map((highlight, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-stone-600">
                  <span className="text-violet-400 mt-1">•</span>
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
              <MessageCircle className="w-4 h-4 text-violet-500" />
              <h3 className="font-semibold text-violet-900">Ask About</h3>
            </div>
            <ul className="space-y-2">
              {briefing.conversationStarters.map((starter, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-stone-600">
                  <span className="text-violet-400 mt-1">•</span>
                  {starter}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Upcoming Milestones */}
      {briefing.upcomingMilestones.length > 0 && (
        <div className="mt-6 pt-6 border-t border-violet-100">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-violet-500" />
            <h3 className="font-semibold text-violet-900">Remember</h3>
          </div>
          <ul className="space-y-2">
            {briefing.upcomingMilestones.map((milestone, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-stone-600">
                <span className="text-violet-400 mt-1">•</span>
                {milestone}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
