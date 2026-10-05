import React from 'react';
import { RefreshCw } from 'lucide-react';
import TimestampButton from './TimestampButton';
import { FollowUpItem } from '@/types';

interface Props {
  items: FollowUpItem[];
  onSeek?: (timestampSec: number) => void;
}

export default function FollowUpItemsCard({ items, onSeek }: Props) {
  return (
    <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl dark:shadow-2xl overflow-hidden">
      <div className="p-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-wide">Follow-Up Items</h3>
        </div>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-300 dark:border-indigo-500/30">
          {items.length} Follow-ups
        </span>
      </div>

      <div className="p-4 space-y-3">
        {items.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-slate-500 italic text-center py-4">
            No follow-up items scheduled.
          </p>
        ) : (
          items.map((fu, idx) => (
            <div
              key={fu.id || idx}
              className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-500/30 rounded-xl flex items-center justify-between gap-3 transition-all duration-200"
            >
              <span className="text-xs font-medium text-slate-700 dark:text-slate-200 leading-relaxed">
                {fu.item}
              </span>
              <TimestampButton seconds={fu.timestamp} className="shrink-0" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
