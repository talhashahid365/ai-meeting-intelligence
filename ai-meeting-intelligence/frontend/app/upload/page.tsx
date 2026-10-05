'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { apiUploadMeeting } from '@/lib/api';
import {
  UploadCloud,
  Mic,
  Video,
  FileAudio,
  FileVideo,
  CheckCircle2,
  AlertCircle,
  Square,
  Play,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const ALLOWED_EXTENSIONS = ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'mp4', 'mov', 'avi', 'mkv', 'webm'];
const MAX_SIZE = 500 * 1024 * 1024; // 500 MB

function UploadFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'record' ? 'record' : 'upload';

  const [mode, setMode] = useState<'upload' | 'record'>(initialMode);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Recorder states
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setError(null);
    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setError(`Unsupported format '.${ext}'. Allowed: MP3, WAV, M4A, AAC, OGG, MP4, MOV, AVI, MKV, WebM`);
      return;
    }

    if (file.size > MAX_SIZE) {
      setError(`File size exceeds 500 MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB).`);
      return;
    }

    setSelectedFile(file);
  };

  const handleUploadSubmit = async () => {
    let fileToUpload = selectedFile;

    if (mode === 'record' && recordedBlob) {
      fileToUpload = new File([recordedBlob], `recorded_meeting_${Date.now()}.webm`, {
        type: 'audio/webm',
      });
    }

    if (!fileToUpload) {
      setError('Please select a file or record a meeting first.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const meeting = await apiUploadMeeting(fileToUpload);
      router.push(`/meetings/${meeting.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to upload recording.');
      setUploading(false);
    }
  };

  // Recording Logic using MediaRecorder
  const startRecording = async () => {
    setError(null);
    setRecordedBlob(null);
    setRecordingDuration(0);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start(1000);
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      setError('Failed to access microphone. Please grant browser permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Mode Selector Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl w-fit backdrop-blur-md">
        <button
          onClick={() => setMode('upload')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            mode === 'upload'
              ? 'bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          Upload Media File
        </button>
        <button
          onClick={() => setMode('record')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            mode === 'record'
              ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Mic className="w-4 h-4" />
          Record Meeting Live
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Glass Form Body */}
      <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl rounded-3xl p-8 space-y-6 shadow-xl dark:shadow-2xl">
        {mode === 'upload' ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className="border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-purple-500/60 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-4 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-all cursor-pointer relative group"
          >
            <input
              type="file"
              accept=".mp3,.wav,.m4a,.aac,.ogg,.mp4,.mov,.avi,.mkv,.webm"
              onChange={handleFileSelect}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />

            <div className="w-20 h-20 rounded-3xl bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-500/30 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
              <UploadCloud className="w-10 h-10" />
            </div>

            {selectedFile ? (
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  {selectedFile.name}
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready for AI processing
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Drag & drop your recording here, or <span className="text-purple-600 dark:text-purple-400 underline">browse files</span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Supports Audio (MP3, WAV, M4A, AAC, OGG) & Video (MP4, MOV, AVI, MKV, WebM) up to 500MB
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 space-y-6">
            <div className="relative inline-block">
              <div
                className={`w-28 h-28 rounded-full flex items-center justify-center mx-auto transition-all ${
                  isRecording
                    ? 'bg-rose-50 dark:bg-rose-950/80 border-2 border-rose-500 text-rose-500 animate-pulse shadow-xl'
                    : recordedBlob
                    ? 'bg-emerald-50 dark:bg-emerald-950/80 border-2 border-emerald-500 text-emerald-600 shadow-md'
                    : 'bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-500'
                }`}
              >
                <Mic className="w-12 h-12" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {isRecording ? 'Recording Live Meeting...' : recordedBlob ? 'Recording Completed!' : 'Click Start to Record'}
              </h3>
              <p className="text-lg font-bold text-purple-600 dark:text-purple-400 font-mono tracking-wider">
                {formatDuration(recordingDuration)}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="px-7 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-400 hover:to-purple-500 text-white font-bold text-xs shadow-lg flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
                >
                  <Play className="w-4 h-4 fill-current" />
                  {recordedBlob ? 'Re-record Meeting' : 'Start Recording'}
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="px-7 py-3 rounded-2xl bg-slate-900 dark:bg-slate-950 hover:bg-slate-800 text-white border border-slate-700 font-bold text-xs shadow-lg flex items-center gap-2 transition-all"
                >
                  <Square className="w-4 h-4 fill-current text-rose-400" />
                  Stop Recording
                </button>
              )}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/80 flex justify-end">
          <button
            onClick={handleUploadSubmit}
            disabled={uploading || (mode === 'upload' && !selectedFile) || (mode === 'record' && !recordedBlob)}
            className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-purple-600/25 flex items-center gap-2.5 transition-all transform hover:-translate-y-0.5"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Uploading & Enqueueing Pipeline...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-purple-200" />
                Process Meeting Intelligence
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-purple-500 selection:text-white transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Upload or Record Meeting</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Submit audio/video recordings to trigger automated speech-to-text, speaker diarization, and structured AI intelligence.
          </p>
        </div>

        <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">Loading upload form...</div>}>
          <UploadFormContent />
        </Suspense>
      </main>
    </div>
  );
}
