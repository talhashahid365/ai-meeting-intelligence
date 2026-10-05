'use client';

import React, { useState } from 'react';
import { CheckSquare, Square, Calendar, User as UserIcon } from 'lucide-react';
import TimestampButton from './TimestampButton';
import { ActionItem } from '@/types';
import { apiUpdateActionItemStatus } from '@/lib/api';

interface Props {
  meetingId: string;
  items: ActionItem[];
  onSeek?: (timestampSec: number) => void;
  onStatusChange?: (updatedItem: ActionItem) => void;
  onItemUpdated?: () => void;
}

export default function ActionItemsTable({ meetingId, items, onSeek, onStatusChange, onItemUpdated }: Props) {
  const [localItems, setLocalItems] = useState<ActionItem[]>(items);

  const toggleStatus = async (item: ActionItem) => {
    const nextStatus = item.status === 'completed' ? 'pending' : 'completed';
    setLocalItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, status: nextStatus } : i))
    );
    try {
      await apiUpdateActionItemStatus(meetingId, item.id, nextStatus);
      if (onItemUpdated) onItemUpdated();
    } catch {
      setLocalItems(items);
    }
  };

  return (
    <div className="bg-white/80 dark:bg-slate-900/60 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-xl dark:shadow-2xl overflow-hidden">
      <div className="p-5 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <CheckSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Action Items &amp; Tasks</h3>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-500/30">
          {localItems.filter((i) => i.status === 'completed').length}/{localItems.length} Completed
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100/80 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200/80 dark:border-slate-800/80">
              <th className="py-3 px-4 w-12">Status</th>
              <th className="py-3 px-4">Task Description</th>
              <th className="py-3 px-4">Owner</th>
              <th className="py-3 px-4">Deadline</th>
              <th className="py-3 px-4 text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
            {localItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400 dark:text-slate-500">
                  No action items assigned in this meeting.
                </td>
              </tr>
            ) : (
              localItems.map((item) => {
                const isDone = item.status === 'completed';
                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all ${
                      isDone ? 'bg-slate-50/50 dark:bg-slate-950/30 text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => toggleStatus(item)}
                        className="text-slate-400 hover:text-cyan-500 transition"
                      >
                        {isDone ? (
                          <CheckSquare className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 dark:text-slate-600 hover:text-cyan-500" />
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 font-medium">
                      <span className={isDone ? 'line-through text-slate-400 dark:text-slate-500' : ''}>
                        {item.task}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 font-semibold text-slate-600 dark:text-slate-300">
                        <UserIcon className="w-3 h-3 text-cyan-500" />
                        {item.owner || 'Unassigned'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {item.deadline ? (
                        <span className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-3 py-1 rounded-xl border border-amber-300 dark:border-amber-500/30 font-semibold">
                          <Calendar className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                          {item.deadline}
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-600 italic">None</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <TimestampButton seconds={item.timestamp} onClick={onSeek} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
