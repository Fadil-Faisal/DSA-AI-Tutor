'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface StreakHeatmapProps {
  solvedProblems: Array<{ timestamp: number; correct: boolean }>;
  currentStreak: number;
}

export function StreakHeatmap({ solvedProblems, currentStreak }: StreakHeatmapProps) {
  const weeks = 18;
  const today = new Date();

  const activityMap = useMemo(() => {
    const map: Record<string, number> = {};
    solvedProblems.forEach(({ timestamp, correct }) => {
      if (!correct) return;
      const d = new Date(timestamp);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      map[key] = (map[key] ?? 0) + 1;
    });
    // Seed some demo activity
    for (let i = 0; i < 40; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - Math.floor(Math.random() * weeks * 7));
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      map[key] = (map[key] ?? 0) + Math.ceil(Math.random() * 3);
    }
    return map;
  }, [solvedProblems]);

  const cells = useMemo(() => {
    const result: { date: Date; count: number }[] = [];
    for (let w = weeks - 1; w >= 0; w--) {
      for (let d = 0; d < 7; d++) {
        const date = new Date(today);
        date.setDate(date.getDate() - (w * 7 + (6 - d)));
        const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        result.push({ date, count: activityMap[key] ?? 0 });
      }
    }
    return result;
  }, [activityMap]);

  function cellColor(count: number) {
    if (count === 0) return 'bg-[rgba(255,255,255,0.04)]';
    if (count === 1) return 'bg-emerald-800/60';
    if (count === 2) return 'bg-emerald-600/70';
    return 'bg-emerald-400/80';
  }

  const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-slate-500">Activity (last {weeks} weeks)</span>
        <span className="text-xs font-semibold text-orange-400 flex items-center gap-1">
          🔥 {currentStreak} day streak
        </span>
      </div>
      <div className="flex gap-0.5 overflow-x-auto pb-1">
        {/* Day labels */}
        <div className="flex flex-col gap-0.5 mr-1 pt-0">
          {DAY_LABELS.map((l, i) => (
            <div key={i} className="h-3 text-[9px] text-slate-600 leading-3 w-6 shrink-0">
              {l}
            </div>
          ))}
        </div>

        {/* Grid: weeks × 7 days */}
        {Array.from({ length: weeks }, (_, w) => (
          <div key={w} className="flex flex-col gap-0.5">
            {Array.from({ length: 7 }, (_, d) => {
              const cell = cells[w * 7 + d];
              return (
                <div
                  key={d}
                  className={cn('w-3 h-3 rounded-sm transition-all cursor-default', cellColor(cell?.count ?? 0))}
                  title={cell ? `${cell.date.toDateString()}: ${cell.count} solved` : ''}
                  aria-label={cell ? `${cell.date.toDateString()}: ${cell.count} problems` : undefined}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-1 mt-1.5">
        <span className="text-[10px] text-slate-600">Less</span>
        {[0, 1, 2, 3].map((l) => (
          <div key={l} className={cn('w-3 h-3 rounded-sm', cellColor(l))} aria-hidden />
        ))}
        <span className="text-[10px] text-slate-600">More</span>
      </div>
    </div>
  );
}
