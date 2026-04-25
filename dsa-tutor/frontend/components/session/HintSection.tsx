'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, ChevronDown, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/GlobalComponents';
import { cn } from '@/lib/utils';

interface HintSectionProps {
  problemId: string;
  sessionId: string;
  explanationMode: 'simple' | 'complex';
  currentHintLevel: 0 | 1 | 2 | 3;
  onHintRequest: () => void;
}

const HINT_META = [
  { level: 1, label: 'Nudge', color: '#94a3b8', desc: 'A small directional clue' },
  { level: 2, label: 'Approach', color: '#f59e0b', desc: 'High-level strategy revealed' },
  { level: 3, label: 'Pseudocode', color: '#3b82f6', desc: 'Near-complete solution outline' },
] as const;

interface HintCardProps {
  level: 1 | 2 | 3;
  text: string;
  visible: boolean;
}

function HintCard({ level, text, visible }: HintCardProps) {
  const [revealed, setRevealed] = useState(false);
  const meta = HINT_META[level - 1];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="overflow-hidden"
    >
      <div
        className="rounded-xl border p-3.5 mt-2"
        style={{
          borderColor: `${meta.color}30`,
          background: `${meta.color}08`,
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Lightbulb
              className="w-3.5 h-3.5"
              style={{ color: meta.color }}
              aria-hidden
            />
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: meta.color }}>
              Hint {level} — {meta.label}
            </span>
          </div>
          <button
            onClick={() => setRevealed((r) => !r)}
            className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            aria-label={revealed ? 'Hide hint' : 'Reveal hint'}
          >
            {revealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>
        <div className={cn('transition-all duration-300', !revealed && 'blur-sm select-none')}>
          <p className="text-[13px] text-slate-300 leading-relaxed whitespace-pre-wrap">
            {text}
          </p>
        </div>
        {!revealed && (
          <p className="text-[11px] text-slate-600 mt-1">Click eye to reveal</p>
        )}
      </div>
    </motion.div>
  );
}

export function HintSection({
  problemId,
  sessionId,
  currentHintLevel,
  onHintRequest,
  explanationMode,
}: HintSectionProps) {
  const [loading, setLoading] = useState(false);
  const [hints, setHints] = useState<{ level: number; text: string }[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  const handleGetHint = useCallback(async () => {
    if (currentHintLevel >= 3) return;
    setLoading(true);
    const nextLevel = currentHintLevel + 1;

    try {
      const res = await fetch('/api/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          problemId,
          hintLevel: nextLevel,
          explanationMode,
          currentCode: null,
          mistakePattern: null,
        }),
      });
      const data = await res.json();
      if (data.hint) {
        setHints((prev) => [...prev, { level: nextLevel, text: data.hint }]);
      }
    } catch {
    }

    onHintRequest();
    setLoading(false);
  }, [currentHintLevel, onHintRequest, sessionId, problemId, explanationMode]);

  const nextLevel = (currentHintLevel + 1) as 1 | 2 | 3;
  const nextMeta = currentHintLevel < 3 ? HINT_META[Math.min(currentHintLevel, 2) as 0 | 1 | 2] : null;

  return (
    <div className="rounded-xl border border-[rgba(148,163,184,0.1)] bg-[rgba(10,22,40,0.5)] overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[rgba(255,255,255,0.02)] transition-colors"
        aria-expanded={!collapsed}
      >
        <div className="flex items-center gap-2">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" aria-hidden />
          <span className="text-xs font-semibold text-slate-300">Hints</span>
          {currentHintLevel > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25">
              {currentHintLevel}/3 used
            </span>
          )}
        </div>
        <ChevronDown
          className={cn('w-3.5 h-3.5 text-slate-500 transition-transform', collapsed && 'rotate-180')}
          aria-hidden
        />
      </button>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              {/* Get Hint Button */}
              {currentHintLevel < 3 && (
                <Button
                  variant="secondary"
                  size="sm"
                  loading={loading}
                  onClick={handleGetHint}
                  className="w-full mb-2"
                  icon={<Lightbulb className="w-3.5 h-3.5" />}
                >
                  {loading
                    ? 'Generating hint…'
                    : `Get Hint ${nextLevel}${nextMeta ? ` — ${nextMeta.label}` : ''}`}
                </Button>
              )}
              {currentHintLevel >= 3 && (
                <p className="text-xs text-slate-500 text-center py-1">All hints revealed</p>
              )}

              {/* Revealed Hints */}
              <AnimatePresence>
                {hints.map((h) => (
                  <HintCard
                    key={h.level}
                    level={h.level as 1 | 2 | 3}
                    text={h.text}
                    visible
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
