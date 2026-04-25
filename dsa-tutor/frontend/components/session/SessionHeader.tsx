'use client';

import { useEffect, useRef, useState } from 'react';
import { Flame, Cpu, ChevronDown } from 'lucide-react';
import { useLearnerStore } from '@/store/learnerStore';
import { Badge, Button } from '@/components/ui/GlobalComponents';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ExplanationMode } from '@/types/learner';

function ExplanationModeBadge() {
  const { explanationMode, setExplanationMode } = useLearnerStore();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Switch explanation mode"
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all duration-200 cursor-pointer',
          explanationMode === 'simple'
            ? 'border-blue-500/50 bg-blue-500/10 text-blue-300'
            : 'border-violet-500/50 bg-violet-500/10 text-violet-300'
        )}
      >
        <Cpu className="w-3 h-3" aria-hidden />
        {explanationMode === 'simple' ? 'Simple Mode' : 'Complex Mode'}
        <ChevronDown className={cn('w-3 h-3 transition-transform', open && 'rotate-180')} aria-hidden />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 glass-card p-2 min-w-[160px] z-50"
          >
            {(['simple', 'complex'] as ExplanationMode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setExplanationMode(m); setOpen(false); }}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer',
                  explanationMode === m
                    ? 'bg-blue-500/15 text-blue-300'
                    : 'text-slate-400 hover:bg-[rgba(255,255,255,0.05)] hover:text-slate-200'
                )}
              >
                {m === 'simple' ? '🎯 Simple Mode' : '⚡ Complex Mode'}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function SessionHeader() {
  const { currentStreak, totalProblemsAttempted, currentProblem, explanationMode } = useLearnerStore();

  return (
    <header className="sticky top-0 z-40 glass border-b border-[rgba(148,163,184,0.08)] px-4 py-3">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shadow shadow-blue-900/50">
            <Cpu className="w-4 h-4 text-white" aria-hidden />
          </div>
          <span className="font-bold text-slate-100 text-sm hidden sm:block" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Neural<span className="text-blue-400">DSA</span>
          </span>
        </div>

        {/* Center — problem info */}
        {currentProblem && (
          <div className="flex items-center gap-2 text-xs text-slate-400 min-w-0">
            <Badge variant={currentProblem.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard'}>
              {currentProblem.difficulty}
            </Badge>
            <span className="truncate text-slate-300 font-medium hidden md:block">
              {currentProblem.title}
            </span>
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Streak */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/25"
            aria-label={`Current streak: ${currentStreak}`}
          >
            <Flame className="w-3.5 h-3.5 text-orange-400" aria-hidden />
            <span className="text-xs font-bold text-orange-300">{currentStreak}</span>
          </div>

          <ExplanationModeBadge />

          <a
            href="/dashboard"
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors hidden sm:block"
          >
            Dashboard
          </a>
        </div>
      </div>
    </header>
  );
}
