'use client';

import { Badge, TopicTag, Skeleton } from '@/components/ui/GlobalComponents';
import { Problem } from '@/types/problem';
import { cn } from '@/lib/utils';
import { HintSection } from '@/components/session/HintSection';

interface ProblemPanelProps {
  problem: Problem | null;
  loading?: boolean;
  explanationMode: 'simple' | 'complex';
  sessionId: string;
  currentHintLevel: 0 | 1 | 2 | 3;
  onHintRequest: () => void;
}

export function ProblemPanel({ problem, loading, explanationMode, sessionId, currentHintLevel, onHintRequest }: ProblemPanelProps) {
  if (loading || !problem) {
    return (
      <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  const diffVariant = problem.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard';

  return (
    <div className="flex flex-col gap-5 p-4 h-full overflow-y-auto text-sm">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <Badge variant={diffVariant}>{problem.difficulty}</Badge>
          <TopicTag topic={problem.topic} />
          <Badge variant={explanationMode === 'simple' ? 'simple' : 'complex'}>
            {explanationMode === 'simple' ? 'Simple' : 'Complex'}
          </Badge>
        </div>
        <h1 className="text-base font-bold text-slate-100 leading-snug">{problem.title}</h1>
      </div>

      {/* Description */}
      <div>
        <h2 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Problem
        </h2>
        <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-[13px]">
          {problem.description}
        </p>
      </div>

      {/* Examples */}
      {problem.examples?.length > 0 && (
        <div>
          <h2 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Examples
          </h2>
          <div className="space-y-3">
            {problem.examples.map((ex, i) => (
              <div
                key={i}
                className="rounded-xl border border-[rgba(148,163,184,0.1)] bg-[rgba(15,23,42,0.5)] p-3"
              >
                <div className="mb-1">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Input</span>
                  <pre className="text-xs text-emerald-300 font-mono mt-0.5 whitespace-pre-wrap break-all">
                    {ex.input}
                  </pre>
                </div>
                <div className="mb-1">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Output</span>
                  <pre className="text-xs text-blue-300 font-mono mt-0.5 whitespace-pre-wrap break-all">
                    {ex.output}
                  </pre>
                </div>
                {ex.explanation && (
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                      Explanation
                    </span>
                    <p className="text-xs text-slate-400 mt-0.5">{ex.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Complexity */}
      {explanationMode === 'complex' && (
        <div>
          <h2 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Complexity
          </h2>
          <div className="flex gap-3">
            <div className="flex-1 rounded-xl border border-[rgba(148,163,184,0.1)] bg-[rgba(15,23,42,0.5)] p-2.5 text-center">
              <div className="text-[10px] text-slate-500 mb-1">Time</div>
              <div className="text-xs font-mono font-bold text-blue-300">{problem.time_complexity}</div>
            </div>
            <div className="flex-1 rounded-xl border border-[rgba(148,163,184,0.1)] bg-[rgba(15,23,42,0.5)] p-2.5 text-center">
              <div className="text-[10px] text-slate-500 mb-1">Space</div>
              <div className="text-xs font-mono font-bold text-violet-300">{problem.space_complexity}</div>
            </div>
          </div>
        </div>
      )}

      {/* Hints */}
      <HintSection
        problemId={problem.id}
        sessionId={sessionId}
        explanationMode={explanationMode}
        currentHintLevel={currentHintLevel}
        onHintRequest={onHintRequest}
      />
    </div>
  );
}
