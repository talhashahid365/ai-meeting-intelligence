export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface Speaker {
  id: string;
  meeting_id: string;
  label: string;
  display_name: string;
  created_at: string;
}

export type ProcessingStatus =
  | 'UPLOADED'
  | 'QUEUED'
  | 'PROCESSING'
  | 'TRANSCRIBING'
  | 'IDENTIFYING_SPEAKERS'
  | 'ANALYZING'
  | 'INDEXING'
  | 'COMPLETED'
  | 'FAILED';

export interface Meeting {
  id: string;
  user_id: string;
  title: string;
  original_filename: string;
  media_type: 'audio' | 'video';
  storage_url: string;
  duration: number;
  meeting_date: string;
  processing_status: ProcessingStatus;
  processing_progress: number;
  error_message?: string | null;
  created_at: string;
  updated_at: string;
  speakers?: Speaker[];
}

export interface TranscriptSegment {
  id: string;
  meeting_id: string;
  speaker_id?: string | null;
  speaker_label: string;
  speaker_display_name: string;
  start_time: number;
  end_time: number;
  text: string;
  created_at: string;
}

export interface KeyPoint {
  id: string;
  meeting_id: string;
  topic: string;
  description: string;
  timestamp: number;
}

export interface Decision {
  id: string;
  meeting_id: string;
  decision: string;
  timestamp: number;
}

export interface ActionItem {
  id: string;
  meeting_id: string;
  task: string;
  owner: string;
  deadline?: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  timestamp: number;
}

export interface DeadlineItem {
  id: string;
  meeting_id: string;
  action_item_id?: string | null;
  description: string;
  date?: string | null;
  original_expression: string;
  timestamp: number;
}

export interface UnresolvedIssue {
  id: string;
  meeting_id: string;
  issue: string;
  description: string;
  timestamp: number;
}

export interface FollowUpItem {
  id: string;
  meeting_id: string;
  item: string;
  timestamp: number;
}

export interface MeetingSummary {
  meeting_id: string;
  meeting_title: string;
  executive_summary: string;
  detailed_summary: string;
  sentiment_label: 'Positive' | 'Neutral' | 'Mixed' | 'Negative';
  sentiment_explanation: string;
  participants: string[];
}

export interface FullIntelligence {
  summary: MeetingSummary;
  key_points: KeyPoint[];
  decisions: Decision[];
  action_items: ActionItem[];
  deadlines: DeadlineItem[];
  unresolved_issues: UnresolvedIssue[];
  follow_up_items: FollowUpItem[];
}

export interface SourceTimestamp {
  timestamp: number;
  formatted_time: string;
  text_snippet: string;
}

export interface QAResponse {
  question: string;
  answer: string;
  sources: SourceTimestamp[];
  meeting_id: string;
}

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  source_timestamps?: number[];
  created_at?: string;
}
