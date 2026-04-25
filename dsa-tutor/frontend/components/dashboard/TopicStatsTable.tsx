'use client';

import { getConfidenceLabel, getConfidenceColor, topicLabel } from '@/lib/utils';
import { Confidence, DSATopic } from '@/types/learner';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopicStatsTableProps {
  confidence: Confidence;
  solvedProblems: Array<{ topic: DSATopic; correct: boolean; timeTaken: number }>;
}

export function TopicStatsTable({ confidence, solvedProblems }: TopicStatsTableProps) {
  const topics = Object.keys(confidence) as DSATopic[];

  const stats = topics.map((topic) => {
    const attempts = solvedProblems.filter((p) => p.topic === topic);
    const correct = attempts.filter((p) => p.correct).length;
    const accuracy = attempts.length > 0 ? Math.round((correct / attempts.length) * 100) : null;
    const avgTime =
      attempts.length > 0
        ? Math.round(attempts.reduce((s, p) => s + p.timeTaken, 0) / attempts.length)
        : null;
    return {
      topic,
      label: topicLabel(topic),
      confidence: confidence[topic],
      attempted: attempts.length,
      accuracy,
      avgTime,
      status: getConfidenceLabel(confidence[topic]),
      color: getConfidenceColor(confidence[topic]),
    };
  });

  const statusStyle = {
    Strong: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
    Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/25',
    Weak: 'text-rose-400 bg-rose-500/10 border-rose-500/25',
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-[rgba(148,163,184,0.08)] bg-[rgba(6,14,30,0.5)]">
      <table className="w-full text-sm" aria-label="Topic statistics">
        <thead>
          <tr className="border-b border-[rgba(148,163,184,0.08)]">
            {['Topic', 'Confidence', 'Attempted', 'Accuracy', 'Avg Time', 'Status'].map((h) => (
              <th
                key={h}
                scope="col"
                className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {stats.map((s, i) => (
            <tr
              key={s.topic}
              className={cn(
                'border-b border-[rgba(148,163,184,0.05)] hover:bg-[rgba(255,255,255,0.02)] transition-colors',
                i === stats.length - 1 && 'border-0'
              )}
            >
              <td className="px-4 py-3 font-medium text-slate-200">{s.label}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${Math.round(s.confidence * 100)}%`, background: s.color }}
                    />
                  </div>
                  <span className="text-xs font-mono tabular-nums" style={{ color: s.color }}>
                    {Math.round(s.confidence * 100)}%
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-slate-400 text-xs tabular-nums">
                {s.attempted > 0 ? s.attempted : <span className="text-slate-600">—</span>}
              </td>
              <td className="px-4 py-3 text-xs tabular-nums">
                {s.accuracy != null ? (
                  <span style={{ color: s.accuracy >= 70 ? '#10b981' : s.accuracy >= 40 ? '#f59e0b' : '#f43f5e' }}>
                    {s.accuracy}%
                  </span>
                ) : (
                  <span className="text-slate-600">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-slate-400 text-xs tabular-nums">
                {s.avgTime != null ? `${s.avgTime}s` : <span className="text-slate-600">—</span>}
              </td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border',
                    statusStyle[s.status]
                  )}
                >
                  {s.status}
                  {s.status === 'Strong' && <ArrowUpRight className="w-3 h-3" aria-hidden />}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
