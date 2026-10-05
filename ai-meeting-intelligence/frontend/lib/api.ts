import {
  User,
  Meeting,
  TranscriptSegment,
  FullIntelligence,
  QAResponse,
  ChatMessage,
  Speaker,
  ActionItem,
} from '@/types';

const API_BASE = '/api';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function setToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
}

export function removeToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    removeToken();
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    let errorDetail = 'Request failed';
    try {
      const data = await res.json();
      errorDetail = data.detail || JSON.stringify(data);
    } catch {
      errorDetail = await res.text();
    }
    throw new Error(errorDetail);
  }

  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}

// Auth API
export async function apiLogin(email: string, password: string): Promise<{ access_token: string }> {
  const data = await request<{ access_token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(data.access_token);
  return data;
}

export async function apiRegister(name: string, email: string, password: string): Promise<User> {
  return request<User>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

export async function apiGetMe(): Promise<User> {
  return request<User>('/auth/me');
}

// Meetings API
export async function apiGetMeetings(): Promise<{ items: Meeting[]; total: number }> {
  return request<{ items: Meeting[]; total: number }>('/meetings');
}

export async function apiGetMeeting(id: string): Promise<Meeting> {
  return request<Meeting>(`/meetings/${id}`);
}

export async function apiDeleteMeeting(id: string): Promise<void> {
  return request<void>(`/meetings/${id}`, { method: 'DELETE' });
}

export async function apiUpdateSpeaker(meetingId: string, speakerId: string, displayName: string): Promise<Speaker> {
  return request<Speaker>(`/meetings/${meetingId}/speakers/${speakerId}`, {
    method: 'PATCH',
    body: JSON.stringify({ display_name: displayName }),
  });
}

// File Upload
export async function apiUploadMeeting(file: File): Promise<Meeting> {
  const token = getToken();
  const formData = new FormData();
  formData.append('file', file);

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/meetings/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    let detail = 'Upload failed';
    try {
      const err = await res.json();
      detail = err.detail || detail;
    } catch {
      detail = await res.text();
    }
    throw new Error(detail);
  }

  return res.json();
}

export async function apiGetMeetingStatus(meetingId: string): Promise<{
  id: string;
  processing_status: Meeting['processing_status'];
  processing_progress: number;
  error_message?: string | null;
  duration?: number | null;
}> {
  return request(`/meetings/${meetingId}/status`);
}

// Transcript API
export async function apiGetTranscript(meetingId: string): Promise<{
  meeting_id: string;
  segments: TranscriptSegment[];
  total_segments: number;
}> {
  return request(`/meetings/${meetingId}/transcript`);
}

export async function apiSearchTranscript(meetingId: string, query: string): Promise<{
  matches: Array<{
    segment_id: string;
    speaker_name: string;
    start_time: number;
    end_time: number;
    text: string;
    highlight: string;
  }>;
  total_matches: number;
}> {
  return request(`/meetings/${meetingId}/transcript/search?query=${encodeURIComponent(query)}`);
}

// Insights API
export async function apiGetInsights(meetingId: string): Promise<FullIntelligence> {
  return request<FullIntelligence>(`/meetings/${meetingId}/insights`);
}

export async function apiUpdateActionItemStatus(
  meetingId: string,
  actionId: string,
  status: 'pending' | 'in_progress' | 'completed'
): Promise<ActionItem> {
  return request<ActionItem>(`/meetings/${meetingId}/action-items/${actionId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// Q&A API
export async function apiAskQuestion(meetingId: string, question: string): Promise<QAResponse> {
  return request<QAResponse>(`/meetings/${meetingId}/ask`, {
    method: 'POST',
    body: JSON.stringify({ question }),
  });
}

export async function apiGetChatHistory(meetingId: string): Promise<{
  conversation_id: string;
  meeting_id: string;
  messages: ChatMessage[];
}> {
  return request(`/meetings/${meetingId}/messages`);
}

// Global Search
export async function apiGlobalSearch(query: string): Promise<{
  query: string;
  results: Array<{
    meeting_id: string;
    meeting_title: string;
    meeting_date: string;
    match_type: string;
    matched_text: string;
    timestamp?: number | null;
  }>;
  total_results: number;
}> {
  return request(`/meetings/search?q=${encodeURIComponent(query)}`);
}

// Utilities
export function formatSeconds(seconds: number): string {
  if (isNaN(seconds) || seconds === null || seconds === undefined) return '00:00';
  const total = Math.max(0, Math.floor(seconds));
  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
