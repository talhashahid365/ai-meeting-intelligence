'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProcessingBadge from '@/components/ProcessingBadge';
import { apiGetMeetings, apiGlobalSearch, apiDeleteMeeting, formatSeconds } from '@/lib/api';
import { Meeting } from '@/types';
import {
  FolderKanban,
  Search,
  Calendar,
  Clock,
  Trash2,
  ArrowRight,
  Sparkles,
  FileText,
  AlertCircle,
} from 'lucide-react';

function MeetingsListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q') || '';

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (queryParam) {
      performGlobalSearch(queryParam);
    } else {
      fetchMeetings();
    }
  }, [queryParam]);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      setError(null);
      setSearchResults(null);
      const res = await apiGetMeetings();
      setMeetings(res.items);
      setTotal(res.total);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch meetings');
    } finally {
      setLoading(false);
    }
  };

  const performGlobalSearch = async (q: string) => {
    if (!q.trim()) {
      fetchMeetings();
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await apiGlobalSearch(q.trim());
      setSearchResults(res.results);
    } catch (err: any) {
      setError(err.message || 'Global search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/meetings?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/meetings');
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this meeting recording and all associated intelligence?')) return;
    try {
      await apiDeleteMeeting(id);
      if (queryParam) {
        performGlobalSearch(queryParam);
      } else {
        fetchMeetings();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete meeting');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            Meeting Library
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Browse, filter, and perform semantic search across all your processed meetings.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-purple-500 dark:text-purple-400/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search title, summary, action items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500/50 shadow-md transition-all"
          />
        </form>
      </div>

      {/* Query Indicator */}
      {queryParam && (
        <div className="p-4 bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-500/30 rounded-2xl text-xs text-purple-700 dark:text-purple-300 flex items-center justify-between shadow-md">
          <span>
            Showing search results for <strong className="font-bold text-slate-900 dark:text-white">&quot;{queryParam}&quot;</strong>
          </span>
          <button
            onClick={() => {
              setSearchQuery('');
              router.push('/meetings');
            }}
            className="text-purple-600 dark:text-purple-400 hover:underline font-bold"
          >
            Clear Search
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Content Section */}
      <div className="bg-white/80 dark:bg-slate-900/60 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-xl dark:shadow-2xl overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-500 dark:text-slate-400 text-sm">
            <div className="inline-block w-8 h-8 border-2 border-purple-600 dark:border-purple-400 border-t-transparent rounded-full animate-spin mb-3" />
            <p>Searching meeting intelligence...</p>
          </div>
        ) : searchResults !== null ? (
          /* Global Search Results List */
          searchResults.length === 0 ? (
            <div className="p-16 text-center text-slate-500 dark:text-slate-400 space-y-3">
              <FileText className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
              <p className="text-base font-bold text-slate-800 dark:text-slate-200">No search matches found</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Try searching for keywords like budget, database, or deadline.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200/80 dark:divide-slate-800/80">
              {searchResults.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => router.push(`/meetings/${item.meeting_id}`)}
                  className="p-6 hover:bg-slate-100/70 dark:hover:bg-slate-800/40 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30">
                        {item.match_type.replace('_', ' ')}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                        {item.meeting_title}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 italic">&quot;{item.matched_text}&quot;</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 flex items-center gap-1.5 transition-colors">
                      View Report <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : meetings.length === 0 ? (
          /* Regular Empty State */
          <div className="p-16 text-center text-slate-500 dark:text-slate-400 space-y-4">
            <FolderKanban className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
            <p className="text-base font-bold text-slate-800 dark:text-slate-200">No meetings uploaded yet</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Upload audio or video recordings to generate reports.</p>
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl text-xs font-bold shadow-lg shadow-purple-600/20 hover:from-purple-500 hover:to-indigo-500 transition-all"
            >
              Upload First Meeting
            </Link>
          </div>
        ) : (
          /* Regular Meetings List */
          <div className="divide-y divide-slate-200/80 dark:divide-slate-800/80">
            {meetings.map((m) => (
              <div
                key={m.id}
                onClick={() => router.push(`/meetings/${m.id}`)}
                className="p-6 hover:bg-slate-100/70 dark:hover:bg-slate-800/40 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-2 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                      {m.title}
                    </h3>
                    <ProcessingBadge status={m.processing_status} progress={m.processing_progress} />
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400/70" />
                      {new Date(m.meeting_date).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400/70" />
                      {formatSeconds(m.duration || 0)}
                    </span>
                    <span className="text-slate-400 dark:text-slate-500">Filename: {m.original_filename}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={(e) => handleDelete(e, m.id)}
                    title="Delete Meeting"
                    className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                    Open Report <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MeetingsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-purple-500 selection:text-white transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">Loading meeting library...</div>}>
          <MeetingsListContent />
        </Suspense>
      </main>
    </div>
  );
}
