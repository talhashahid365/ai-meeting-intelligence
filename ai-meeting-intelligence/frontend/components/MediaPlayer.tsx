'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX } from 'lucide-react';
import { formatSeconds } from '@/lib/api';

interface Props {
  mediaUrl?: string;
  mediaType: 'audio' | 'video';
  duration?: number;
  title?: string;
  seekTime?: number | null;
}

export default function MediaPlayer({ mediaUrl = '', mediaType, duration = 0, title, seekTime }: Props) {
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    if (seekTime !== undefined && seekTime !== null && mediaRef.current) {
      mediaRef.current.currentTime = seekTime;
      mediaRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [seekTime]);

  useEffect(() => {
    const handleSeek = (e: CustomEvent<{ timestamp: number; play?: boolean }>) => {
      if (mediaRef.current) {
        mediaRef.current.currentTime = e.detail.timestamp;
        if (e.detail.play) {
          mediaRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        }
      }
    };

    window.addEventListener('seek-media' as any, handleSeek);
    return () => window.removeEventListener('seek-media' as any, handleSeek);
  }, []);

  const togglePlay = () => {
    if (!mediaRef.current) return;
    if (isPlaying) {
      mediaRef.current.pause();
      setIsPlaying(false);
    } else {
      mediaRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleTimeUpdate = () => {
    if (mediaRef.current) {
      setCurrentTime(mediaRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (mediaRef.current && mediaRef.current.duration) {
      setTotalDuration(mediaRef.current.duration);
    }
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (mediaRef.current) {
      mediaRef.current.currentTime = time;
    }
  };

  const skipTime = (seconds: number) => {
    if (mediaRef.current) {
      mediaRef.current.currentTime = Math.max(0, Math.min(totalDuration, mediaRef.current.currentTime + seconds));
    }
  };

  const changePlaybackRate = () => {
    const rates = [1, 1.25, 1.5, 2, 0.75];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (mediaRef.current) {
      mediaRef.current.playbackRate = nextRate;
    }
  };

  return (
    <div className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl dark:shadow-2xl border border-slate-200/80 dark:border-slate-800/80 text-slate-900 dark:text-white">
      {/* Video Display */}
      {mediaType === 'video' && (
        <div className="relative aspect-video bg-black flex items-center justify-center">
          <video
            ref={mediaRef as React.RefObject<HTMLVideoElement>}
            src={mediaUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onClick={togglePlay}
            className="w-full h-full object-contain cursor-pointer"
          />
        </div>
      )}

      {/* Audio element */}
      {mediaType === 'audio' && (
        <div className="p-8 bg-gradient-to-r from-slate-100 via-slate-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/80 flex flex-col items-center justify-center gap-3 relative overflow-hidden">
          <div className="absolute inset-0 bg-purple-500/5 dark:bg-cyan-500/5 blur-3xl pointer-events-none" />
          <audio
            ref={mediaRef as React.RefObject<HTMLAudioElement>}
            src={mediaUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
          <div className="flex items-center gap-2 z-10">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 dark:bg-cyan-400 animate-ping" />
            <span className="text-xs uppercase tracking-widest font-bold text-purple-600 dark:text-cyan-400">Audio Intelligence Playback</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 z-10">Click any timestamp in summary or transcript to jump to exact moment</p>
        </div>
      )}

      {/* Controls Bar */}
      <div className="p-3.5 bg-slate-50/90 dark:bg-slate-950/90 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col gap-2.5">
        {/* Scrubber Range Bar */}
        <div className="flex items-center gap-3 text-xs font-mono text-slate-500 dark:text-slate-400">
          <span className="w-12 text-right text-purple-600 dark:text-cyan-400">{formatSeconds(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={totalDuration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeekChange}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500 dark:accent-cyan-400 hover:accent-purple-400 transition"
          />
          <span className="w-12 text-slate-500">{formatSeconds(totalDuration)}</span>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => skipTime(-10)}
              title="Rewind 10s"
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800/80 transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white flex items-center justify-center transition shadow-lg shadow-purple-600/30"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>
            <button
              onClick={() => skipTime(10)}
              title="Forward 10s"
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800/80 transition"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setIsMuted(!isMuted);
                if (mediaRef.current) mediaRef.current.muted = !isMuted;
              }}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800/80 transition"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={changePlaybackRate}
              className="px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-200 dark:bg-slate-800/80 hover:bg-slate-300 dark:hover:bg-slate-700/80 border border-slate-300 dark:border-slate-700/50 rounded-lg transition"
            >
              {playbackRate}x
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
