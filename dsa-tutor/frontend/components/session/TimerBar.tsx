'use client';

import { useMemo } from 'react';
import { formatTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface TimerBarProps {
  seconds: number;
  maxSeconds?: number;
  running: boolean;
}

export function TimerBar({ seconds, maxSeconds = 1800, running }: TimerBarProps) {
  const pct = Math.min((seconds / maxSeconds) * 100, 100);

  const phase = useMemo(() => {
    if (pct < 40) return 'fast';
    if (pct < 70) return 'normal';
    return 'slow';
  }, [pct]);

  const barClass = {
    fast: 'timer-fast',
    normal: 'timer-normal',
    slow: 'timer-slow',
  }[phase];

  const textColor = {
    fast: 'text-emerald-400',
    normal: 'text-amber-400',
    slow: 'text-rose-400',
  }[phase];

  return (
    <div className="w-full" role="timer" aria-live="off" aria-label={`Timer: ${formatTime(seconds)}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
          {running ? 'Time elapsed' : 'Paused'}
        </span>
        <span className={cn('text-xs font-mono font-bold tabular-nums', textColor)}>
          {formatTime(seconds)}
        </span>
      </div>
      <div className="h-1 rounded-full bg-[rgba(255,255,255,0.05)] overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-1000', barClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
