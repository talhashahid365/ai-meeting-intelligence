'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProcessingBadge from '@/components/ProcessingBadge';
import MediaPlayer from '@/components/MediaPlayer';
import OverviewSummary from '@/components/OverviewSummary';
import TranscriptViewer from '@/components/TranscriptViewer';
import AIInsightsSidebar from '@/components/AIInsightsSidebar';
import ActionItemsTable from '@/components/ActionItemsTable';
import AIChatDrawer from '@/components/AIChatDrawer';

import {
  apiGetMeeting,
  apiGetMeetingStatus,
  apiGetTranscript,
  apiGetInsights,
  formatSeconds,
} from '@/lib/api';

import {
  Meeting,
  TranscriptSegment,
  FullIntelligence,
  Speaker,
  ActionItem,
} from '@/types';

import {
  Calendar,
  Clock,
  MessageSquare,
  RefreshCw,
  Sparkles,
  AlertCircle,
  FileText,
  Brain,
  CheckCircle2,
} from 'lucide-react';

export default function MeetingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const meetingId = params.id as string;

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [intelligence, setIntelligence] = useState<FullIntelligence | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Poll status interval reference
  const pollTimerRef = useRef<any>(null);

  // Media player seek ref
  const [seekTime, setSeekTime] = useState<number | null>(null);

  // AI Chat drawer state
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (meetingId) {
      loadMeetingData();
    }
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [meetingId]);

  const loadMeetingData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch core meeting data
      const m = await apiGetMeeting(meetingId);
      setMeeting(m);

      // If completing or completed, fetch transcript and insights
      if (m.processing_status === 'COMPLETED') {
        await fetchIntelligenceAndTranscript();
      } else if (m.processing_status !== 'FAILED') {
        // Start polling until completion
        startPolling();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load meeting details');
    } finally {
      setLoading(false);
    }
  };

  const fetchIntelligenceAndTranscript = async () => {
    try {
      const [transRes, insRes] = await Promise.all([
        apiGetTranscript(meetingId),
        apiGetInsights(meetingId),
      ]);
      setTranscript(transRes.segments);
      setIntelligence(insRes);
    } catch (err: any) {
      console.error('Error loading intelligence data:', err);
    }
  };

  const startPolling = () => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);

    pollTimerRef.current = setInterval(async () => {
      try {
        const statusRes = await apiGetMeetingStatus(meetingId);
        setMeeting((prev) =>
          prev
            ? {
                ...prev,
                processing_status: statusRes.processing_status,
                processing_progress: statusRes.processing_progress,
                error_message: statusRes.error_message,
                duration: statusRes.duration ?? prev.duration,
              }
            : prev
        );

        if (statusRes.processing_status === 'COMPLETED') {
          clearInterval(pollTimerRef.current);
          await fetchIntelligenceAndTranscript();
        } else if (statusRes.processing_status === 'FAILED') {
          clearInterval(pollTimerRef.current);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2500);
  };

  const handleSeek = (timestampSec: number) => {
    setSeekTime(timestampSec);
    // Smooth scroll up to media player section
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleSpeakerRenamed = (speakerId?: string, newDisplayName?: string) => {
    if (!speakerId || !newDisplayName) return;
    setMeeting((prev) => {
      if (!prev) return prev;
      const updatedSpeakers = prev.speakers?.map((s) =>
        s.id === speakerId ? { ...s, display_name: newDisplayName } : s
      );
      return { ...prev, speakers: updatedSpeakers };
    });

    setTranscript((prev) =>
      prev.map((seg) =>
        seg.speaker_id === speakerId ? { ...seg, speaker_display_name: newDisplayName } : seg
      )
    );
  };

  const handleActionItemStatusChange = (updatedItem: ActionItem) => {
    setIntelligence((prev) => {
      if (!prev) return prev;
      const updatedItems = prev.action_items.map((item) =>
        item.id === updatedItem.id ? updatedItem : item
      );
      return { ...prev, action_items: updatedItems };
    });
  };

  if (loading && !meeting) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center text-slate-900 dark:text-slate-100">
        <div className="inline-block w-8 h-8 border-2 border-purple-600 dark:border-cyan-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Loading meeting intelligence report...</p>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
        <Navbar />
        <main className="max-w-4xl mx-auto py-16 px-4 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Meeting Not Available</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">{error || 'The requested meeting could not be found.'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl text-xs font-bold hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg"
          >
            Return to Dashboard
          </button>
        </main>
      </div>
    );
  }

  const isProcessing =
    meeting.processing_status !== 'COMPLETED' && meeting.processing_status !== 'FAILED';

  // Construct media URL
  const storageKey = meeting.storage_url?.split('/').pop();
  const mediaSrc = storageKey ? `/api/meetings/media/${storageKey}` : undefined;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col pb-16 relative selection:bg-purple-500 selection:text-white transition-colors duration-200">
      <Navbar />

      {/* Main Showcase Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Glass Section */}
        <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl dark:shadow-2xl space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {meeting.title}
                </h1>
                <ProcessingBadge status={meeting.processing_status} progress={meeting.processing_progress} />
              </div>

              <div className="flex flex-wrap items-center gap-5 text-xs text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5 font-medium">
                  <Calendar className="w-4 h-4 text-purple-600 dark:text-cyan-400/70" />
                  {new Date(meeting.meeting_date).toLocaleDateString(undefined, {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400/70" />
                  {formatSeconds(meeting.duration || 0)}
                </span>
                <span className="text-slate-500 font-mono text-[11px]">
                  File: {meeting.original_filename} ({meeting.media_type})
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setChatOpen(true)}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold shadow-xl shadow-cyan-500/25 flex items-center gap-2.5 transition-all transform hover:-translate-y-0.5"
              >
                <Sparkles className="w-4 h-4 text-cyan-200 animate-pulse" />
                Ask Grounded AI Assistant
              </button>
            </div>
          </div>

          {/* Processing Banner */}
          {isProcessing && (
            <div className="p-4 bg-cyan-950/80 border border-cyan-500/30 rounded-2xl space-y-2 backdrop-blur-md shadow-lg">
              <div className="flex items-center justify-between text-xs font-semibold text-cyan-300">
                <span className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-cyan-400 animate-pulse" />
                  AI Pipeline Status: {meeting.processing_status}
                </span>
                <span>{meeting.processing_progress}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-cyan-500/20">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full transition-all duration-500"
                  style={{ width: `${meeting.processing_progress}%` }}
                />
              </div>
              <p className="text-[11px] text-cyan-400/80">
                Extracting audio, generating timestamped transcript, running speaker diarization, and LLM intelligence analysis...
              </p>
            </div>
          )}

          {meeting.processing_status === 'FAILED' && (
            <div className="p-4 bg-rose-950/60 border border-rose-800/80 rounded-2xl text-xs text-rose-300 space-y-1">
              <p className="font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                Processing Failed
              </p>
              <p>{meeting.error_message || 'An error occurred during audio processing.'}</p>
            </div>
          )}
        </div>

        {/* Media Player Component */}
        <MediaPlayer
          mediaUrl={mediaSrc}
          mediaType={meeting.media_type}
          title={meeting.title}
          seekTime={seekTime}
        />

        {/* Overview Section: Summaries, Participants, Sentiment */}
        {intelligence?.summary && (
          <OverviewSummary summary={intelligence.summary} />
        )}

        {/* Tier 1: Twin Panels (Transcript & AI Insights Sidebar - Both exactly 650px high) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left / Center 2 Columns: Transcript Viewer (650px) */}
          <div className="lg:col-span-2">
            <TranscriptViewer
              meetingId={meeting.id}
              segments={transcript}
              speakers={meeting.speakers || []}
              onSeek={handleSeek}
              onSpeakerRenamed={handleSpeakerRenamed}
            />
          </div>

          {/* Right 1 Column: AI Insights Sidebar (650px) */}
          <div className="lg:col-span-1">
            {intelligence && (
              <AIInsightsSidebar
                decisions={intelligence.decisions}
                keyPoints={intelligence.key_points}
                deadlines={intelligence.deadlines}
                unresolvedIssues={intelligence.unresolved_issues}
                followUpItems={intelligence.follow_up_items}
                onSeek={handleSeek}
              />
            )}
          </div>
        </div>

        {/* Tier 2: Full-Width Action Items & Tasks Table */}
        {intelligence && (
          <ActionItemsTable
            meetingId={meeting.id}
            items={intelligence.action_items}
            onSeek={handleSeek}
            onStatusChange={handleActionItemStatusChange}
          />
        )}
      </main>

      {/* Grounded AI Assistant Drawer */}
      <AIChatDrawer
        meetingId={meeting.id}
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        onSeek={handleSeek}
      />
    </div>
  );
}
