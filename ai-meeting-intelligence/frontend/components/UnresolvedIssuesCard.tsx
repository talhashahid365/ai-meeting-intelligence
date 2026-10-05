import React from 'react';
import { HelpCircle } from 'lucide-react';
import TimestampButton from './TimestampButton';
import { UnresolvedIssue } from '@/types';

interface Props {
  issues: UnresolvedIssue[];
  onSeek?: (timestampSec: number) => void;
}

export default function UnresolvedIssuesCard({ issues, onSeek }: Props) {
  return (
    <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl dark:shadow-2xl overflow-hidden">
      <div className="p-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-wide">Unresolved Issues</h3>
        </div>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30">
          {issues.length} Issues
        </span>
      </div>

      <div className="p-4 space-y-3">
        {issues.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-slate-500 italic text-center py-4">
            No unresolved issues detected.
          </p>
        ) : (
          issues.map((ui, idx) => (
            <div
              key={ui.id || idx}
              className="p-3.5 bg-amber-50/60 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 hover:border-amber-400 dark:hover:border-amber-500/40 rounded-xl flex items-start justify-between gap-3 transition-all duration-200"
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300 block">
                  {ui.issue}
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{ui.description}</p>
              </div>
              <TimestampButton seconds={ui.timestamp} className="shrink-0" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
