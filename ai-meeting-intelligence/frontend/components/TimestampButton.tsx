import React from 'react';
import { Play } from 'lucide-react';
import { formatSeconds } from '@/lib/api';

interface Props {
  seconds: number;
  className?: string;
  label?: string;
  onClick?: (seconds: number) => void;
}

export default function TimestampButton({ seconds, className = '', label, onClick }: Props) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick(seconds);
    }
    window.dispatchEvent(
      new CustomEvent('seek-media', {
        detail: { timestamp: seconds, play: true },
      })
    );
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      title={`Jump recording to ${formatSeconds(seconds)}`}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-cyan-950/80 text-cyan-300 hover:bg-cyan-900/90 hover:text-cyan-200 border border-cyan-500/30 hover:border-cyan-400 transition-all shadow-sm ${className}`}
    >
      <Play className="w-2.5 h-2.5 fill-current text-cyan-400" />
      <span>{label || formatSeconds(seconds)}</span>
    </button>
  );
}
