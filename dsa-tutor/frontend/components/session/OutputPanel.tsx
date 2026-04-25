'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, Terminal } from 'lucide-react';
import { ExecutionResult } from '@/types/problem';
import { cn } from '@/lib/utils';

interface OutputPanelProps {
  results: ExecutionResult[];
  loading?: boolean;
  feedback?: string;
  correct?: boolean | null;
}

export function OutputPanel({ results, loading, feedback, correct }: OutputPanelProps) {
  const allPassed = results.length > 0 && results.every((r) => r.passed);
  const passCount = results.filter((r) => r.passed).length;

  return (
    <div className="rounded-xl border border-[rgba(148,163,184,0.1)] bg-[rgba(10,22,40,0.5)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[rgba(148,163,184,0.08)]">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-slate-500" aria-hidden />
          <span className="text-xs font-semibold text-slate-400">Output</span>
        </div>
        {results.length > 0 && (
          <span className={cn('text-xs font-bold', allPassed ? 'text-emerald-400' : 'text-rose-400')}>
            {passCount}/{results.length} passed
          </span>
        )}
      </div>

      <div className="p-3 space-y-2 max-h-48 overflow-y-auto">
        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-2 py-2">
            <div className="w-4 h-4 border-2 border-blue-500/40 border-t-blue-400 rounded-full animate-spin" aria-hidden />
            <span className="text-xs text-slate-500">Running test cases…</span>
          </div>
        )}

        {/* Empty state */}
        {!loading && results.length === 0 && !feedback && (
          <p className="text-xs text-slate-600 text-center py-4">
            Run your code to see output here
          </p>
        )}

        {/* AI Feedback */}
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'rounded-lg p-3 border text-xs leading-relaxed',
              correct === true
                ? 'border-emerald-500/30 bg-emerald-500/08 text-emerald-300'
                : correct === false
                ? 'border-rose-500/30 bg-rose-500/08 text-rose-300'
                : 'border-[rgba(148,163,184,0.15)] text-slate-300'
            )}
          >
            {correct === true && <CheckCircle2 className="w-3.5 h-3.5 inline mr-1.5" />}
            {correct === false && <XCircle className="w-3.5 h-3.5 inline mr-1.5" />}
            {feedback}
          </motion.div>
        )}

        {/* Test case results */}
        <AnimatePresence>
          {results.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                'flex items-start gap-2.5 rounded-lg px-3 py-2 border text-xs',
                r.passed
                  ? 'border-emerald-500/25 bg-emerald-500/06'
                  : 'border-rose-500/25 bg-rose-500/06'
              )}
            >
              {r.passed
                ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                : <XCircle className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" />}
              <div className="min-w-0">
                <div className={cn('font-semibold', r.passed ? 'text-emerald-300' : 'text-rose-300')}>
                  Test {i + 1}: {r.status}
                </div>
                {r.stdout && (
                  <pre className="text-slate-400 mt-0.5 truncate font-mono">{r.stdout}</pre>
                )}
                {r.stderr && (
                  <pre className="text-rose-400 mt-0.5 font-mono text-[11px] whitespace-pre-wrap">{r.stderr}</pre>
                )}
                {r.time && (
                  <div className="flex items-center gap-1 text-slate-600 mt-0.5">
                    <Clock className="w-2.5 h-2.5" aria-hidden />
                    {r.time}s
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
