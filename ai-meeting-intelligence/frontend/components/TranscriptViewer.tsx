'use client';

import React, { useState, useMemo } from 'react';
import { Search, UserCheck, Edit3, X, Check } from 'lucide-react';
import TimestampButton from './TimestampButton';
import { TranscriptSegment, Speaker } from '@/types';
import { apiUpdateSpeaker } from '@/lib/api';

interface Props {
  meetingId: string;
  segments: TranscriptSegment[];
  speakers?: Speaker[];
  onSeek?: (timestampSec: number) => void;
  onSpeakerRenamed?: (speakerId?: string, newName?: string) => void;
}

export default function TranscriptViewer({
  meetingId,
  segments,
  speakers = [],
  onSeek,
  onSpeakerRenamed,
}: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSpeakerId, setEditingSpeakerId] = useState<string | null>(null);
  const [speakerNewName, setSpeakerNewName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const filteredSegments = useMemo(() => {
    if (!searchQuery.trim()) return segments;
    const q = searchQuery.toLowerCase();
    return segments.filter(
      (s) =>
        s.text.toLowerCase().includes(q) ||
        s.speaker_display_name.toLowerCase().includes(q)
    );
  }, [segments, searchQuery]);

  const handleStartRename = (speakerId: string, currentName: string) => {
    setEditingSpeakerId(speakerId);
    setSpeakerNewName(currentName);
  };

  const handleSaveRename = async () => {
    if (!editingSpeakerId || !speakerNewName.trim()) return;
    setIsUpdating(true);
    try {
      await apiUpdateSpeaker(meetingId, editingSpeakerId, speakerNewName.trim());
      setEditingSpeakerId(null);
      if (onSpeakerRenamed) onSpeakerRenamed(editingSpeakerId, speakerNewName.trim());
    } catch (err) {
      alert('Failed to rename speaker');
    } finally {
      setIsUpdating(false);
    }
  };

  const getSpeakerColor = (name: string) => {
    const colors = [
      'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-500/40',
      'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-500/40',
      'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-500/40',
      'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-500/40',
      'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-500/40',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="bg-white/80 dark:bg-slate-900/60 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-xl dark:shadow-2xl flex flex-col h-[650px] overflow-hidden">
      {/* Top Bar */}
      <div className="p-5 border-b border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/80 dark:bg-slate-950/40">
        <div className="flex items-center gap-2.5">
          <UserCheck className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Speaker-wise Transcript</h2>
          <span className="text-xs text-slate-500 font-mono">({segments.length} segments)</span>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-cyan-500/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search transcript text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-8 py-2 text-xs bg-white dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Speaker Rename Inline Panel */}
      {editingSpeakerId && (
        <div className="p-3 bg-cyan-50 dark:bg-cyan-950/80 border-b border-cyan-200 dark:border-cyan-500/30 flex items-center justify-between gap-3 backdrop-blur-md">
          <span className="text-xs font-semibold text-cyan-700 dark:text-cyan-300">Rename Speaker:</span>
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <input
              type="text"
              value={speakerNewName}
              onChange={(e) => setSpeakerNewName(e.target.value)}
              className="w-full text-xs px-3 py-1.5 bg-white dark:bg-slate-950 border border-cyan-400 dark:border-cyan-500/50 text-slate-900 dark:text-white rounded-xl focus:outline-none"
              autoFocus
            />
            <button
              onClick={handleSaveRename}
              disabled={isUpdating}
              className="p-1.5 bg-cyan-500 text-white font-bold rounded-xl hover:bg-cyan-400"
              title="Save"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setEditingSpeakerId(null)}
              className="p-1.5 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700"
              title="Cancel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Transcript Segments List */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-slate-200/60 dark:divide-slate-800/60">
        {filteredSegments.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
            <Search className="w-8 h-8 mb-2 opacity-40 text-cyan-500" />
            {searchQuery ? 'No matching transcript lines found.' : 'No transcript available.'}
          </div>
        ) : (
          filteredSegments.map((segment) => {
            const speakerColor = getSpeakerColor(segment.speaker_display_name || segment.speaker_label);
            return (
              <div key={segment.id} className="pt-4 first:pt-0 group hover:bg-slate-100/60 dark:hover:bg-slate-800/30 p-3 rounded-2xl transition-all">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${speakerColor}`}>
                      {segment.speaker_display_name || segment.speaker_label}
                    </span>
                    {segment.speaker_id && (
                      <button
                        onClick={() => handleStartRename(segment.speaker_id!, segment.speaker_display_name)}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-cyan-500 transition-colors"
                        title="Rename Speaker"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <TimestampButton seconds={segment.start_time} onClick={onSeek} />
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed pl-1">
                  {segment.text}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
