'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User as UserIcon, Sparkles, Loader2 } from 'lucide-react';
import TimestampButton from './TimestampButton';
import { apiAskQuestion, apiGetChatHistory } from '@/lib/api';
import { ChatMessage, SourceTimestamp } from '@/types';

interface Props {
  meetingId: string;
  isOpen?: boolean;
  onClose?: () => void;
  onSeek?: (timestampSec: number) => void;
}

export default function AIChatDrawer({ meetingId, isOpen = true, onClose, onSeek }: Props) {
  const [messages, setMessages] = useState<
    Array<{
      role: 'user' | 'assistant';
      content: string;
      sources?: SourceTimestamp[];
      source_timestamps?: number[];
    }>
  >([]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    apiGetChatHistory(meetingId)
      .then((res) => {
        if (res && res.messages && res.messages.length > 0) {
          setMessages(
            res.messages.map((m) => ({
              role: m.role,
              content: m.content,
              source_timestamps: m.source_timestamps || [],
            }))
          );
        }
      })
      .catch(() => {});
  }, [meetingId, isOpen]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  if (!isOpen) return null;

  const handleAsk = async (questionText?: string) => {
    const q = (questionText || inputQuestion).trim();
    if (!q || isLoading) return;

    setInputQuestion('');
    setMessages((prev) => [...prev, { role: 'user', content: q }]);
    setIsLoading(true);

    try {
      const resp = await apiAskQuestion(meetingId, q);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: resp.answer,
          sources: resp.sources,
          source_timestamps: resp.sources?.map((s) => s.timestamp) || [],
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Error: ${err.message || 'Failed to query meeting intelligence.'}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sampleQuestions = [
    'What database did we decide to use?',
    'When will the homepage be completed?',
    'What did we discuss regarding payments?',
    'Who is responsible for marketing copy?',
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">Ask Meeting AI</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Grounded strictly in this meeting recording</p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-lg transition"
            title="Close Assistant"
          >
            <span className="font-bold text-sm">✕</span>
          </button>
        )}
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8 px-4">
            <Bot className="w-10 h-10 text-purple-500/80 mx-auto mb-3 animate-pulse" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Have questions about this meeting?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-sm mx-auto">
              Ask about decisions, assigned owners, deadlines, or specific topics. Answers will include clickable timestamps.
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
              {sampleQuestions.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAsk(sample)}
                  className="text-xs text-left px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-950/80 hover:bg-slate-200 dark:hover:bg-slate-800/90 text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-cyan-400 border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-cyan-500/30 transition"
                >
                  &quot;{sample}&quot;
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={index}
              className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-cyan-500/10 text-purple-600 dark:text-cyan-400 flex items-center justify-center shrink-0 border border-purple-200 dark:border-cyan-500/20">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-none shadow-lg shadow-purple-600/20'
                    : 'bg-slate-100 dark:bg-slate-950/90 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-800 shadow-md'
                }`}
              >
                <p className="whitespace-pre-line font-normal">{msg.content}</p>

                {!isUser && msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Source:</span>
                    {msg.sources.map((src, sIdx) => (
                      <TimestampButton
                        key={sIdx}
                        seconds={src.timestamp}
                        label={src.formatted_time}
                      />
                    ))}
                  </div>
                )}

                {!isUser && !msg.sources && msg.source_timestamps && msg.source_timestamps.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Source:</span>
                    {msg.source_timestamps.map((ts, sIdx) => (
                      <TimestampButton key={sIdx} seconds={ts} />
                    ))}
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-500/20">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-cyan-500/10 text-purple-600 dark:text-cyan-400 flex items-center justify-center shrink-0 border border-purple-200 dark:border-cyan-500/20">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-100 dark:bg-slate-950/90 rounded-2xl rounded-tl-none p-3.5 border border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-500 dark:text-cyan-400" />
              Searching meeting transcript and generating grounded answer...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk();
        }}
        className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center gap-2"
      >
        <input
          type="text"
          placeholder="Ask anything about this meeting..."
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          disabled={isLoading}
          className="flex-1 text-xs px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 placeholder-slate-400 dark:placeholder-slate-500"
        />
        <button
          type="submit"
          disabled={isLoading || !inputQuestion.trim()}
          className="p-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white rounded-xl transition shadow-lg shadow-purple-600/20"
          title="Send"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
