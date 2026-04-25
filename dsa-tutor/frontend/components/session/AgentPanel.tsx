'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, RefreshCw } from 'lucide-react';
import { AgentThinkingDots } from '@/components/ui/GlobalComponents';
import { useLearnerStore } from '@/store/learnerStore';
import { topicLabel, getConfidenceColor } from '@/lib/utils';

function AgentReasoningCard({ reasoning, loading }: { reasoning: string; loading: boolean }) {
  return (
    <div style={{ borderLeft: '3px solid #3b82f6', background: 'rgba(59,130,246,0.06)', borderRadius: 12, padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ width: 24, height: 24, borderRadius: 8, background: 'rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Brain size={14} color="#60a5fa" />
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#60a5fa', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Agent Reasoning
        </span>
        {loading && <AgentThinkingDots />}
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[80, 65, 50].map((w) => (
              <div key={w} className="skeleton" style={{ height: 12, width: `${w}%`, borderRadius: 6 }} />
            ))}
          </motion.div>
        ) : (
          <motion.p key={reasoning} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6 }}>
            {reasoning || 'The agent is analyzing your performance to select the optimal next problem…'}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

const TOPIC_ORDER = [
  ['arrays', 'Arrays'],
  ['trees', 'Trees'],
  ['graphs', 'Graphs'],
  ['dp', 'Dynamic Prog.'],
  ['recursion', 'Recursion'],
  ['sorting', 'Sorting'],
  ['searching', 'Searching'],
  ['strings', 'Strings'],
  ['heaps', 'Heaps'],
  ['linked_lists', 'Linked Lists'],
] as const;

function ConfidenceRadar() {
  const { confidence } = useLearnerStore();

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Zap size={14} color="#a78bfa" />
        <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Confidence Scores
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {TOPIC_ORDER.map(([key, label]) => {
          const value = confidence[key];
          const color = getConfidenceColor(value);
          const pct = Math.round(value * 100);
          return (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, color: '#64748b', width: 90, flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {label}
              </span>
              <div style={{ flex: 1, height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  style={{ height: '100%', borderRadius: 99, background: color }}
                />
              </div>
              <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, width: 34, textAlign: 'right', flexShrink: 0, color }}>
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AgentPanel() {
  const { agentReasoning, agentLoading, decisionType, currentStreak } = useLearnerStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, height: '100%', overflowY: 'auto' }}>
      {decisionType && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={12} color="#475569" />
          <span style={{ fontSize: 11, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
            Decision: {decisionType.replace(/_/g, ' ')}
          </span>
        </div>
      )}

      <AgentReasoningCard reasoning={agentReasoning} loading={agentLoading} />
      <ConfidenceRadar />

      {currentStreak > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ borderRadius: 12, border: '1px solid rgba(249,115,22,0.3)', background: 'rgba(249,115,22,0.08)', padding: 16, textAlign: 'center' }}
        >
          <div style={{ fontSize: 28, fontWeight: 800, color: '#fb923c' }}>🔥 {currentStreak}</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Problem streak</div>
        </motion.div>
      )}
    </div>
  );
}
