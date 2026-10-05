'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProcessingBadge from '@/components/ProcessingBadge';
import { apiGetMeetings, formatSeconds } from '@/lib/api';
import { Meeting } from '@/types';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  Calendar,
  UploadCloud,
  Mic,
  ArrowRight,
  Search,
  Brain,
  AlertCircle,
  FileText,
  Sparkles,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await apiGetMeetings();
      setMeetings(res.items);
      setTotal(res.total);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const processingCount = meetings.filter(
    (m) => m.processing_status !== 'COMPLETED' && m.processing_status !== 'FAILED'
  ).length;

  const completedCount = meetings.filter((m) => m.processing_status === 'COMPLETED').length;

  const filteredMeetings = meetings.filter(
    (m) =>
      m.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      m.original_filename.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-purple-500 selection:text-white transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome 3D Hero Banner */}
        <div className="relative p-8 rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-xl dark:shadow-2xl overflow-hidden backdrop-blur-xl">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-tr from-purple-500/20 to-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-semibold backdrop-blur-md shadow-sm">
                <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400 animate-pulse" />
                <span>AI Meeting Intelligence Workspace</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Meeting Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                Transform unstructured meeting audio and video into searchable business knowledge, actionable decisions, and task deadlines.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/upload"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all transform hover:-translate-y-0.5"
              >
                <UploadCloud className="w-4 h-4" />
                Upload Media
              </Link>
              <Link
                href="/upload?mode=record"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-900/90 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs border border-slate-300 dark:border-slate-800 backdrop-blur-md transition-all"
              >
                <Mic className="w-4 h-4 text-rose-500 animate-pulse" />
                Record Live
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-purple-500/40 backdrop-blur-xl transition-all hover:-translate-y-1 shadow-lg dark:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Meetings</p>
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{total}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-500/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <FolderKanban className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-amber-500/40 backdrop-blur-xl transition-all hover:-translate-y-1 shadow-lg dark:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Processing Active</p>
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{processingCount}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-500/40 backdrop-blur-xl transition-all hover:-translate-y-1 shadow-lg dark:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Completed Intelligence</p>
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{completedCount}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-purple-500/40 backdrop-blur-xl transition-all hover:-translate-y-1 shadow-lg dark:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Searchable Knowledge</p>
                <h3 className="text-lg font-bold text-purple-600 dark:text-purple-300 mt-1">100% Vector RAG</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-purple-950/80 border border-indigo-200 dark:border-purple-500/30 text-indigo-600 dark:text-purple-400 flex items-center justify-center">
                <Brain className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Search & Recent Meetings List */}
        <div className="bg-white/80 dark:bg-slate-900/60 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-xl dark:shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                Recent Meetings
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">View and inspect extracted intelligence reports</p>
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-purple-500 dark:text-purple-400/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Filter meetings..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500/50 transition-all"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-16 text-center text-slate-500 dark:text-slate-400 text-sm">
              <div className="inline-block w-8 h-8 border-2 border-purple-600 dark:border-purple-400 border-t-transparent rounded-full animate-spin mb-3" />
              <p>Loading meeting intelligence...</p>
            </div>
          ) : error ? (
            <div className="p-10 text-center text-rose-500 dark:text-rose-400 text-sm flex items-center justify-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          ) : filteredMeetings.length === 0 ? (
            <div className="p-16 text-center text-slate-500 dark:text-slate-400 space-y-4">
              <FileText className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
              <p className="text-base font-bold text-slate-800 dark:text-slate-200">No meetings found</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Upload a recording or click Quick Demo Login to view sample meeting intelligence reports.
              </p>
              <Link
                href="/upload"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl text-xs font-bold shadow-lg shadow-purple-600/20 hover:from-purple-500 hover:to-indigo-500 transition-all"
              >
                Upload First Meeting
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-200/80 dark:divide-slate-800/80">
              {filteredMeetings.map((m) => (
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
                      <span className="text-slate-400 dark:text-slate-500">File: {m.original_filename}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                      View Intelligence
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
