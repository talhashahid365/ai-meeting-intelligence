import React from 'react';
import { Loader2, CheckCircle2, AlertCircle, Clock, Mic, Users, Brain, Database } from 'lucide-react';
import { ProcessingStatus } from '@/types';

interface Props {
  status: ProcessingStatus;
  progress?: number;
}

export default function ProcessingBadge({ status, progress }: Props) {
  switch (status) {
    case 'COMPLETED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Completed
        </span>
      );
    case 'FAILED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
          Failed
        </span>
      );
    case 'TRANSCRIBING':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
          <Mic className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
          Transcribing {progress ? `(${progress}%)` : ''}
        </span>
      );
    case 'IDENTIFYING_SPEAKERS':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 animate-pulse">
          <Users className="w-3.5 h-3.5 text-indigo-600" />
          Identifying Speakers {progress ? `(${progress}%)` : ''}
        </span>
      );
    case 'ANALYZING':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200 animate-pulse">
          <Brain className="w-3.5 h-3.5 text-purple-600 animate-spin" />
          AI Analyzing {progress ? `(${progress}%)` : ''}
        </span>
      );
    case 'INDEXING':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">
          <Database className="w-3.5 h-3.5 text-blue-600" />
          Vector Indexing {progress ? `(${progress}%)` : ''}
        </span>
      );
    case 'PROCESSING':
    case 'QUEUED':
    case 'UPLOADED':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200">
          <Loader2 className="w-3.5 h-3.5 text-sky-600 animate-spin" />
          {status.replace('_', ' ')} {progress ? `(${progress}%)` : ''}
        </span>
      );
  }
}
