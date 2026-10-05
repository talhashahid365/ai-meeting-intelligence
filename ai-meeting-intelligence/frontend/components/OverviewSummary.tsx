'use client';

import React, { useState } from 'react';
import { FileText, Users, Smile, HelpCircle, AlertTriangle, CheckCircle, Info, Sparkles } from 'lucide-react';
import { MeetingSummary } from '@/types';

interface Props {
  summary: MeetingSummary;
}

export default function OverviewSummary({ summary }: Props) {
  const [viewMode, setViewMode] = useState<'short' | 'detailed'>('short');

  const getSentimentDetails = (label: string) => {
    switch (label?.toLowerCase()) {
      case 'positive':
        return {
          icon: Smile,
          badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-500/40',
          textColor: 'text-emerald-600 dark:text-emerald-400',
          gradient: 'from-emerald-50 via-white to-white dark:from-emerald-500/10 dark:via-slate-900 dark:to-slate-950',
        };
      case 'negative':
        return {
          icon: AlertTriangle,
          badgeColor: 'bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-500/40',
          textColor: 'text-rose-600 dark:text-rose-400',
          gradient: 'from-rose-50 via-white to-white dark:from-rose-500/10 dark:via-slate-900 dark:to-slate-950',
        };
      case 'mixed':
        return {
          icon: HelpCircle,
          badgeColor: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-500/40',
          textColor: 'text-amber-600 dark:text-amber-400',
          gradient: 'from-amber-50 via-white to-white dark:from-amber-500/10 dark:via-slate-900 dark:to-slate-950',
        };
      default:
        return {
          icon: CheckCircle,
          badgeColor: 'bg-cyan-100 text-cyan-700 border-cyan-300 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-500/40',
          textColor: 'text-cyan-600 dark:text-cyan-400',
          gradient: 'from-cyan-50 via-white to-white dark:from-cyan-500/10 dark:via-slate-900 dark:to-slate-950',
        };
    }
  };

  const sentiment = getSentimentDetails(summary.sentiment_label);
  const SentimentIcon = sentiment.icon;

  return (
    <div className="space-y-6">
      {/* Participants & Sentiment Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Participants */}
        <div className="md:col-span-2 p-6 bg-white/80 dark:bg-slate-900/60 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-3">
              <Users className="w-4 h-4" />
              Identified Participants
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {summary.participants && summary.participants.length > 0 ? (
                summary.participants.map((person, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-950/80 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-800 shadow-sm"
                  >
                    <span className="w-2 h-2 rounded-full bg-purple-500 dark:bg-cyan-400 animate-pulse" />
                    {person}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 dark:text-slate-500 italic">No specific participants identified</span>
              )}
            </div>
          </div>
        </div>

        {/* Overall Sentiment */}
        <div className={`p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl flex flex-col justify-between bg-gradient-to-br ${sentiment.gradient}`}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Overall Sentiment</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${sentiment.badgeColor}`}>
                {summary.sentiment_label || 'Neutral'}
              </span>
            </div>
            <div className="flex items-start gap-3 mt-2">
              <SentimentIcon className={`w-5 h-5 mt-0.5 shrink-0 ${sentiment.textColor}`} />
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {summary.sentiment_explanation || 'Sentiment evaluated across tone and agreements.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Container with Toggle */}
      <div className="p-7 bg-white/80 dark:bg-slate-900/60 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-xl dark:shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-slate-200/80 dark:border-slate-800/80 gap-4">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-purple-600 dark:text-cyan-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Meeting Summary</h2>
          </div>

          {/* Toggle Short vs Detailed */}
          <div className="inline-flex p-1.5 bg-slate-100 dark:bg-slate-950/90 rounded-2xl text-xs font-semibold border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setViewMode('short')}
              className={`px-4 py-2 rounded-xl transition-all ${
                viewMode === 'short'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-lg shadow-purple-600/20'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Executive Summary
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-4 py-2 rounded-xl transition-all ${
                viewMode === 'detailed'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-lg shadow-purple-600/20'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Detailed Summary
            </button>
          </div>
        </div>

        {/* Summary Content */}
        <div className="mt-6 text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
          {viewMode === 'short' ? (
            <div className="bg-purple-50 dark:bg-cyan-950/40 p-5 rounded-2xl border border-purple-200 dark:border-cyan-500/30 shadow-inner">
              <div className="flex items-center gap-2 text-xs font-semibold text-purple-700 dark:text-cyan-300 mb-2">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-cyan-400 animate-pulse" />
                Concise Executive Overview
              </div>
              <p className="whitespace-pre-line text-slate-800 dark:text-slate-100 leading-relaxed font-normal">
                {summary.executive_summary || 'Generating summary...'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                <Info className="w-4 h-4 text-purple-600 dark:text-cyan-400" />
                Comprehensive Meeting Discussion Breakdown
              </div>
              <p className="whitespace-pre-line text-slate-700 dark:text-slate-200 leading-relaxed">
                {summary.detailed_summary || 'Generating detailed breakdown...'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
