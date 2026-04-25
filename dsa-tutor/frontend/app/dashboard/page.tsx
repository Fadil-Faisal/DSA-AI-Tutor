'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Brain, BarChart3, Flame, Target, ArrowLeft, PlayCircle, Trophy, TrendingUp, Loader2 } from 'lucide-react';
import { useLearnerStore } from '@/store/learnerStore';
import { KnowledgeGraph } from '@/components/dashboard/KnowledgeGraph';
import { ConfidenceChart } from '@/components/dashboard/ConfidenceChart';
import { StreakHeatmap } from '@/components/dashboard/StreakHeatmap';
import { TopicStatsTable } from '@/components/dashboard/TopicStatsTable';
import { getConfidenceColor, topicLabel } from '@/lib/utils';
import { DSATopic } from '@/types/learner';

function fadeUp(delay = 0) {
  return { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay } };
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  sub?: string;
}

function StatCard({ label, value, icon, color, sub }: StatCardProps) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(15,23,42,0.85), rgba(10,22,40,0.95))',
      border: '1px solid rgba(148,163,184,0.1)',
      borderRadius: 16, padding: 20,
      boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {label}
        </span>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color }}>{icon}</span>
        </div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1, marginBottom: 4, fontFamily: 'Space Grotesk, sans-serif' }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const { confidence, currentStreak, totalProblemsAttempted, solvedProblems, explanationMode, sessionId } = useLearnerStore();
  const [loading, setLoading] = useState(true);
  const [totalTime, setTotalTime] = useState(0);

  useEffect(() => {
    if (!sessionId) return;
    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/stats?sessionId=${sessionId}`);
        const data = await res.json();
        if (data.stats) {
          useLearnerStore.getState().setConfidenceFromQuiz(data.stats.confidenceScores || {});
        }
        if (data.attempts) {
          const total = (data.attempts as Array<{ time_taken_seconds?: number }>)
            .reduce((s, a) => s + (a.time_taken_seconds || 0), 0);
          setTotalTime(total);
        }
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [sessionId]);

  const weakTopics = useMemo(() =>
    (Object.entries(confidence) as [DSATopic, number][])
      .sort(([, a], [, b]) => a - b).slice(0, 3)
      .map(([topic, val]) => ({ topic, val }))
  , [confidence]);

  const correctCount = solvedProblems.filter((p) => p.correct).length;
  const accuracy = totalProblemsAttempted > 0 ? Math.round((correctCount / totalProblemsAttempted) * 100) : 0;
  const avgConfidence = Math.round((Object.values(confidence).reduce((s, v) => s + v, 0) / 10) * 100);

  const formatTime = (secs: number) => {
    if (secs < 60) return `${secs}s`;
    return `${Math.floor(secs / 60)}m ${secs % 60}s`;
  };

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-void)', paddingBottom: 64 }}>
      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(6,14,30,0.9)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(148,163,184,0.08)',
        padding: '0 24px', height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/session" style={{ color: '#475569', display: 'flex', alignItems: 'center' }}>
            <ArrowLeft size={18} />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Brain size={18} color="#60a5fa" />
            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 15, color: '#f8fafc' }}>
              Neural<span style={{ color: '#60a5fa' }}>DSA</span>
              <span style={{ fontWeight: 400, color: '#475569', marginLeft: 8 }}>Dashboard</span>
            </span>
          </div>
        </div>
        <Link href="/session" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '8px 16px', borderRadius: 10, background: '#2563eb',
          color: 'white', fontSize: 13, fontWeight: 600, textDecoration: 'none',
        }}>
          <PlayCircle size={15} />
          Continue Session
        </Link>
      </nav>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>

        {/* Stat Cards */}
        <motion.div {...fadeUp(0)} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 40 }}>
          <StatCard label="Problems Solved" value={correctCount} icon={<Target size={16} />} color="#3b82f6" sub={`${totalProblemsAttempted} attempted`} />
          <StatCard label="Accuracy" value={`${accuracy}%`} icon={<Trophy size={16} />} color="#10b981" sub="all time" />
          <StatCard label="Streak" value={currentStreak} icon={<Flame size={16} />} color="#f97316" sub="problems in a row" />
          <StatCard label="Total Time" value={formatTime(totalTime)} icon={<TrendingUp size={16} />} color="#eab308" sub="all attempts" />
          <StatCard label="Avg Confidence" value={`${avgConfidence}%`} icon={<BarChart3 size={16} />} color="#8b5cf6" sub="across 10 topics" />
        </motion.div>

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
            <Loader2 size={24} className="animate-spin text-slate-500" />
            <span style={{ marginLeft: 12, color: '#475569' }}>Loading stats...</span>
          </div>
        )}

        {/* Knowledge Graph */}
        <motion.section {...fadeUp(0.05)} style={{ marginBottom: 40 }}>
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', fontFamily: 'Space Grotesk, sans-serif', marginBottom: 4 }}>
              Knowledge Graph
            </h2>
            <p style={{ fontSize: 13, color: '#475569' }}>
              Live topic nodes — node color reflects your real-time confidence score
            </p>
          </div>
          <KnowledgeGraph confidence={confidence} />
        </motion.section>

        {/* Charts row */}
        <motion.div {...fadeUp(0.1)} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 40 }}>

          {/* Confidence chart */}
          <div style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.85), rgba(10,22,40,0.95))', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginBottom: 20 }}>
              Confidence Over Sessions
            </h3>
            <ConfidenceChart confidence={confidence} solvedProblems={solvedProblems} />
          </div>

          {/* Weak areas */}
          <div style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.85), rgba(10,22,40,0.95))', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginBottom: 20 }}>
              Weak Areas — Focus Here Next
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {weakTopics.map(({ topic, val }, i) => {
                const color = getConfidenceColor(val);
                return (
                  <motion.div
                    key={topic}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 14px', borderRadius: 12,
                      border: '1px solid rgba(244,63,94,0.18)',
                      background: 'rgba(244,63,94,0.05)',
                    }}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}20`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>{topicLabel(topic)}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                          <div style={{ height: '100%', borderRadius: 99, background: color, width: `${Math.round(val * 100)}%` }} />
                        </div>
                        <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color }}>{Math.round(val * 100)}%</span>
                      </div>
                    </div>
                    <Link href="/session" style={{ fontSize: 12, padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(148,163,184,0.2)', color: '#94a3b8', textDecoration: 'none', flexShrink: 0 }}>
                      Practice
                    </Link>
                  </motion.div>
                );
              })}
            </div>
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(148,163,184,0.08)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569' }}>
              <Brain size={13} />
              Mode: <span style={{ color: explanationMode === 'simple' ? '#60a5fa' : '#a78bfa', fontWeight: 600 }}>{explanationMode === 'simple' ? 'Simple' : 'Complex'}</span>
            </div>
          </div>
        </motion.div>

        {/* Streak Heatmap */}
        <motion.section {...fadeUp(0.15)} style={{ marginBottom: 40 }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.85), rgba(10,22,40,0.95))', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginBottom: 20 }}>Practice Streak</h3>
            <StreakHeatmap solvedProblems={solvedProblems} currentStreak={currentStreak} />
          </div>
        </motion.section>

        {/* Topic Breakdown */}
        <motion.section {...fadeUp(0.2)}>
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', fontFamily: 'Space Grotesk, sans-serif', marginBottom: 4 }}>
              Topic Breakdown
            </h2>
            <p style={{ fontSize: 13, color: '#475569' }}>Per-topic performance across all attempts</p>
          </div>
          <TopicStatsTable confidence={confidence} solvedProblems={solvedProblems} />
        </motion.section>

      </main>
    </div>
  );
}
