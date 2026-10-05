import React from 'react';
import { Target } from 'lucide-react';
import TimestampButton from './TimestampButton';
import { KeyPoint } from '@/types';

interface Props {
  keyPoints: KeyPoint[];
  onSeek?: (timestampSec: number) => void;
}

export default function KeyPointsList({ keyPoints, onSeek }: Props) {
  return (
    <div className="bg-white/80 dark:bg-slate-900/60 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-xl dark:shadow-2xl overflow-hidden">
      <div className="p-5 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Target className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Key Discussion Points</h3>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/30">
          {keyPoints.length} Points
        </span>
      </div>

      <div className="p-5 space-y-3">
        {keyPoints.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-slate-500 italic text-center py-4">
            No key points extracted.
          </p>
        ) : (
          keyPoints.map((kp, idx) => (
            <div
              key={kp.id || idx}
              className="p-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-start justify-between gap-3 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 transition-all group"
            >
              <div className="space-y-1.5 min-w-0">
                <span className="inline-block text-[11px] font-bold text-cyan-700 dark:text-cyan-300 bg-cyan-100 dark:bg-cyan-950/80 px-2.5 py-0.5 rounded-lg border border-cyan-300 dark:border-cyan-500/30">
                  {kp.topic}
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{kp.description}</p>
              </div>
              <TimestampButton seconds={kp.timestamp} onClick={onSeek} className="shrink-0" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
