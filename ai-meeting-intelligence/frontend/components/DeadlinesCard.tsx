import React from 'react';
import { CalendarClock, ArrowRight } from 'lucide-react';
import TimestampButton from './TimestampButton';
import { DeadlineItem } from '@/types';

interface Props {
  deadlines: DeadlineItem[];
  onSeek?: (timestampSec: number) => void;
}

export default function DeadlinesCard({ deadlines, onSeek }: Props) {
  return (
    <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl dark:shadow-2xl overflow-hidden">
      <div className="p-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarClock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-wide">Detected Deadlines</h3>
        </div>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30">
          {deadlines.length} Deadlines
        </span>
      </div>

      <div className="p-4 space-y-3">
        {deadlines.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-slate-500 italic text-center py-4">
            No specific deadlines mentioned in this meeting.
          </p>
        ) : (
          deadlines.map((dl, idx) => (
            <div
              key={dl.id || idx}
              className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-amber-300 dark:hover:border-amber-500/30 rounded-xl flex items-center justify-between gap-3 transition-all duration-200"
            >
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">{dl.description}</p>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="bg-slate-200 dark:bg-slate-800/80 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300 font-mono">
                    &quot;{dl.original_expression}&quot;
                  </span>
                  {dl.date && (
                    <>
                      <ArrowRight className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                      <span className="text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded font-bold border border-amber-200 dark:border-amber-500/30">
                        {dl.date}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <TimestampButton seconds={dl.timestamp} className="shrink-0" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
