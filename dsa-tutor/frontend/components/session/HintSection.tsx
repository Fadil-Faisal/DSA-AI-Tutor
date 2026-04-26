'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HintSectionProps {
  problemId: string;
  sessionId: string;
  explanationMode: 'simple' | 'complex';
  currentHintLevel: 0 | 1 | 2 | 3;
  onHintRequest: () => void;
  /** Pass the problem's hints array directly so we don't need an API call */
  hints?: string[];
}

const HINT_META = [
  { level: 1, label: 'Nudge',      color: '#94a3b8', desc: 'A small directional clue' },
  { level: 2, label: 'Approach',   color: '#f59e0b', desc: 'High-level strategy revealed' },
  { level: 3, label: 'Pseudocode', color: '#3b82f6', desc: 'Near-complete solution outline' },
] as const;

function HintCard({ level, text }: { level: 1 | 2 | 3; text: string }) {
  const [revealed, setRevealed] = useState(false);
  const meta = HINT_META[level - 1];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{ overflow: 'hidden', marginTop: 8 }}
    >
      <div style={{
        borderRadius: 12, padding: '12px 14px',
        border: `1px solid ${meta.color}30`,
        background: `${meta.color}08`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Lightbulb size={13} style={{ color: meta.color }} />
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: meta.color }}>
              Hint {level} — {meta.label}
            </span>
          </div>
          <button
            onClick={() => setRevealed(r => !r)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 0 }}
            title={revealed ? 'Hide hint' : 'Reveal hint'}
          >
            {revealed ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
        </div>

        <div style={{
          filter: revealed ? 'none' : 'blur(4px)',
          userSelect: revealed ? 'auto' : 'none',
          transition: 'filter 0.2s',
        }}>
          <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>{text}</p>
        </div>
        {!revealed && (
          <p style={{ fontSize: 11, color: '#334155', marginTop: 4, marginBottom: 0 }}>Click 👁 to reveal</p>
        )}
      </div>
    </motion.div>
  );
}

export function HintSection({
  currentHintLevel,
  onHintRequest,
  hints = [],
}: HintSectionProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [revealedHints, setRevealedHints] = useState<{ level: number; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const maxHints = hints.length;
  const allUsed = currentHintLevel >= maxHints;
  const nextLevel = (currentHintLevel + 1) as 1 | 2 | 3;
  const nextMeta = !allUsed ? HINT_META[Math.min(currentHintLevel, 2) as 0 | 1 | 2] : null;

  const handleGetHint = async () => {
    if (allUsed || loading) return;
    setLoading(true);

    // Use the hint text directly from the problem's hints array
    const hintText = hints[currentHintLevel]; // 0-indexed
    if (hintText) {
      // Small artificial delay so it feels like "thinking"
      await new Promise(r => setTimeout(r, 500));
      setRevealedHints(prev => [...prev, { level: nextLevel, text: hintText }]);
    }

    onHintRequest(); // increments the hint level in the store
    setLoading(false);
  };

  return (
    <div style={{
      borderRadius: 12, border: '1px solid rgba(148,163,184,0.1)',
      background: 'rgba(10,22,40,0.5)', overflow: 'hidden',
    }}>
      {/* Header */}
      <button
        onClick={() => setCollapsed(c => !c)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 14px', cursor: 'pointer',
          background: 'none', border: 'none', color: 'inherit',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Lightbulb size={14} color="#f59e0b" />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1' }}>Hints</span>
          {currentHintLevel > 0 && (
            <span style={{
              fontSize: 10, padding: '2px 7px', borderRadius: 99,
              background: 'rgba(245,158,11,0.12)', color: '#f59e0b',
              border: '1px solid rgba(245,158,11,0.25)', fontWeight: 700,
            }}>
              {currentHintLevel}/{maxHints} used
            </span>
          )}
        </div>
        <ChevronDown
          size={13} color="#475569"
          style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        />
      </button>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 14px 14px' }}>

              {/* Get Hint Button */}
              {!allUsed ? (
                <button
                  onClick={handleGetHint}
                  disabled={loading}
                  style={{
                    width: '100%', padding: '9px 14px', borderRadius: 10,
                    border: '1px solid rgba(245,158,11,0.3)',
                    background: loading ? 'rgba(245,158,11,0.05)' : 'rgba(245,158,11,0.08)',
                    color: '#f59e0b', fontSize: 12, fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    transition: 'all 0.2s',
                  }}
                >
                  <Lightbulb size={13} />
                  {loading
                    ? 'Loading hint…'
                    : `Get Hint ${nextLevel}${nextMeta ? ` — ${nextMeta.label}` : ''}`}
                </button>
              ) : (
                <p style={{ fontSize: 12, color: '#475569', textAlign: 'center', padding: '4px 0', margin: 0 }}>
                  All {maxHints} hints revealed
                </p>
              )}

              {/* Revealed Hint Cards */}
              <AnimatePresence>
                {revealedHints.map(h => (
                  <HintCard
                    key={h.level}
                    level={h.level as 1 | 2 | 3}
                    text={h.text}
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
