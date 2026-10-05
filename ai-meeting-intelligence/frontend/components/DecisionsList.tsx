import React from 'react';
import { CheckCircle2, Award } from 'lucide-react';
import TimestampButton from './TimestampButton';
import { Decision } from '@/types';

interface Props {
  decisions: Decision[];
  onSeek?: (timestampSec: number) => void;
}

export default function DecisionsList({ decisions, onSeek }: Props) {
  return (
    <div className="bg-white/80 dark:bg-slate-900/60 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-xl dark:shadow-2xl overflow-hidden">
      <div className="p-5 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Decisions Made</h3>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
          {decisions.length} Decisions
        </span>
      </div>

      <div className="p-5 space-y-3">
        {decisions.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-slate-500 italic text-center py-4">
            No confirmed decisions extracted from this meeting.
          </p>
        ) : (
          decisions.map((dec, idx) => (
            <div
              key={dec.id || idx}
              className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl flex items-start justify-between gap-3 hover:bg-emerald-100/80 dark:hover:bg-emerald-950/50 hover:border-emerald-300 dark:hover:border-emerald-500/40 transition-all group"
            >
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-slate-700 dark:text-slate-200 leading-relaxed group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                  {dec.decision}
                </p>
              </div>
              <TimestampButton seconds={dec.timestamp} onClick={onSeek} className="shrink-0" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
