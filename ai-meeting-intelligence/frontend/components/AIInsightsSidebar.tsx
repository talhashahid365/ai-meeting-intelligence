'use client';

import React, { useState } from 'react';
import { Sparkles, Award, Target, CalendarClock, HelpCircle, RefreshCw, Layers } from 'lucide-react';
import DecisionsList from './DecisionsList';
import KeyPointsList from './KeyPointsList';
import DeadlinesCard from './DeadlinesCard';
import UnresolvedIssuesCard from './UnresolvedIssuesCard';
import FollowUpItemsCard from './FollowUpItemsCard';

import { Decision, KeyPoint, DeadlineItem, UnresolvedIssue, FollowUpItem } from '@/types';

interface Props {
  decisions: Decision[];
  keyPoints: KeyPoint[];
  deadlines: DeadlineItem[];
  unresolvedIssues: UnresolvedIssue[];
  followUpItems: FollowUpItem[];
  onSeek?: (timestampSec: number) => void;
}

type TabType = 'all' | 'decisions' | 'key_points' | 'deadlines' | 'issues';

export default function AIInsightsSidebar({
  decisions = [],
  keyPoints = [],
  deadlines = [],
  unresolvedIssues = [],
  followUpItems = [],
  onSeek,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const totalCount =
    decisions.length + keyPoints.length + deadlines.length + unresolvedIssues.length + followUpItems.length;

  return (
    <div className="bg-white/80 dark:bg-slate-900/60 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-xl dark:shadow-2xl flex flex-col h-[650px] overflow-hidden">
      {/* Top Header & Tabs Bar */}
      <div className="p-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950/40 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600 dark:text-cyan-400 animate-pulse" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">AI Meeting Intelligence</h3>
          </div>
          <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-500/40">
            {totalCount} Insights
          </span>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-semibold">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            All Takeaways
          </button>
          <button
            onClick={() => setActiveTab('decisions')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'decisions'
                ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-emerald-500" />
            Decisions ({decisions.length})
          </button>
          <button
            onClick={() => setActiveTab('key_points')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'key_points'
                ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-cyan-500" />
            Key Points ({keyPoints.length})
          </button>
          <button
            onClick={() => setActiveTab('deadlines')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'deadlines'
                ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
            }`}
          >
            <CalendarClock className="w-3.5 h-3.5 text-amber-500" />
            Deadlines ({deadlines.length})
          </button>
          <button
            onClick={() => setActiveTab('issues')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'issues'
                ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-rose-500" />
            Issues &amp; Follow-ups ({unresolvedIssues.length + followUpItems.length})
          </button>
        </div>
      </div>

      {/* Body List Container (Scrollable matching TranscriptViewer height) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'all' && (
          <>
            <DecisionsList decisions={decisions} onSeek={onSeek} />
            <KeyPointsList keyPoints={keyPoints} onSeek={onSeek} />
            <DeadlinesCard deadlines={deadlines} onSeek={onSeek} />
            <UnresolvedIssuesCard issues={unresolvedIssues} onSeek={onSeek} />
            <FollowUpItemsCard items={followUpItems} onSeek={onSeek} />
          </>
        )}

        {activeTab === 'decisions' && (
          <DecisionsList decisions={decisions} onSeek={onSeek} />
        )}

        {activeTab === 'key_points' && (
          <KeyPointsList keyPoints={keyPoints} onSeek={onSeek} />
        )}

        {activeTab === 'deadlines' && (
          <DeadlinesCard deadlines={deadlines} onSeek={onSeek} />
        )}

        {activeTab === 'issues' && (
          <>
            <UnresolvedIssuesCard issues={unresolvedIssues} onSeek={onSeek} />
            <FollowUpItemsCard items={followUpItems} onSeek={onSeek} />
          </>
        )}
      </div>
    </div>
  );
}
