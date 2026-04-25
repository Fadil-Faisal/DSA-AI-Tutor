'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Brain, Flame, Target, BarChart3,
  Trophy, Settings, LogOut, Edit3, Save, X,
  AlertTriangle, CheckCircle,
} from 'lucide-react';
import { useLearnerStore } from '@/store/learnerStore';
import { useAuth } from '@/hooks/useAuth';
import { getConfidenceColor, topicLabel } from '@/lib/utils';
import { DSATopic } from '@/types/learner';

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay },
  };
}

// ── Stat Card ─────────────────────────────────────────────────────────────
function StatCard({
  label, value, icon, color, sub,
}: {
  label: string; value: string | number;
  icon: React.ReactNode; color: string; sub?: string;
}) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(15,23,42,0.85), rgba(10,22,40,0.95))',
      border: '1px solid rgba(148,163,184,0.1)',
      borderRadius: 16, padding: '18px 20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {label}
        </span>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: `${color}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ color }}>{icon}</span>
        </div>
      </div>
      <div style={{
        fontSize: 26, fontWeight: 800, color,
        fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1,
      }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ── Confidence Bar ────────────────────────────────────────────────────────
function ConfidenceBar({ topic, value }: { topic: string; value: number }) {
  const color = getConfidenceColor(value);
  const pct = Math.round(value * 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
      <span style={{ fontSize: 13, color: '#94a3b8', width: 110, flexShrink: 0 }}>
        {topicLabel(topic)}
      </span>
      <div style={{
        flex: 1, height: 6, borderRadius: 99,
        background: 'rgba(255,255,255,0.06)', overflow: 'hidden',
      }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ height: '100%', borderRadius: 99, background: color }}
        />
      </div>
      <span style={{
        fontSize: 12, fontFamily: 'JetBrains Mono, monospace',
        fontWeight: 700, color, width: 36, textAlign: 'right',
      }}>
        {pct}%
      </span>
    </div>
  );
}

// ── Edit Field ────────────────────────────────────────────────────────────
function EditField({
  label, value, onChange, placeholder,
}: {
  label: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '10px 14px',
          background: 'rgba(15,23,42,0.8)',
          border: '1px solid rgba(148,163,184,0.2)',
          borderRadius: 10, color: '#f1f5f9', fontSize: 14,
          outline: 'none', fontFamily: 'inherit',
          transition: 'border-color 0.2s',
        }}
        onFocus={(e) => { e.target.style.borderColor = 'rgba(59,130,246,0.5)'; }}
        onBlur={(e) => { e.target.style.borderColor = 'rgba(148,163,184,0.2)'; }}
      />
    </div>
  );
}

// ── Main Profile Page ─────────────────────────────────────────────────────
export default function ProfilePage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const {
    confidence, currentStreak, totalProblemsAttempted,
    solvedProblems, explanationMode, userName, setUserName,
  } = useLearnerStore();

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(userName || '');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const displayName = user
    ? (user.user_metadata?.full_name as string | undefined) || user.email?.split('@')[0] || 'Learner'
    : userName || 'Learner';
  const initials = displayName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
  const email = user?.email || 'Not connected';

  const correctCount = solvedProblems.filter((p) => p.correct).length;
  const accuracy = totalProblemsAttempted > 0
    ? Math.round((correctCount / totalProblemsAttempted) * 100)
    : 0;
  const avgConf = Math.round(
    (Object.values(confidence).reduce((s, v) => s + v, 0) / 10) * 100
  );

  const topicsSorted = useMemo(
    () => (Object.entries(confidence) as [DSATopic, number][]).sort(([, a], [, b]) => b - a),
    [confidence]
  );

  const handleSaveEdit = () => {
    if (editName.trim()) setUserName(editName.trim());
    setEditing(false);
  };

  const handleReset = () => {
    setResetDone(true);
    setShowResetConfirm(false);
    setTimeout(() => setResetDone(false), 3000);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
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
          <Link href="/main-menu" style={{ color: '#475569', display: 'flex', alignItems: 'center' }}>
            <ArrowLeft size={18} />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Brain size={17} color="#60a5fa" />
            <span style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 700, fontSize: 15, color: '#f8fafc',
            }}>
              Lhama<span style={{ color: '#60a5fa' }}>Learner</span>
              <span style={{ fontWeight: 400, color: '#475569', marginLeft: 8 }}>/ Profile</span>
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/settings" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', borderRadius: 10,
            border: '1px solid rgba(148,163,184,0.15)',
            color: '#94a3b8', fontSize: 13, textDecoration: 'none',
            transition: 'all 0.2s',
          }}>
            <Settings size={14} /> Settings
          </Link>
          <button
            onClick={handleSignOut}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 10,
              border: '1px solid rgba(244,63,94,0.25)',
              background: 'rgba(244,63,94,0.06)',
              color: '#f87171', fontSize: 13, cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </nav>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '36px 24px' }}>

        {/* ── Profile Header Card ── */}
        <motion.div {...fadeUp(0)} style={{
          background: 'linear-gradient(135deg, rgba(15,23,42,0.9), rgba(10,22,40,0.95))',
          border: '1px solid rgba(148,163,184,0.1)',
          borderRadius: 20, padding: 28, marginBottom: 24,
          display: 'flex', alignItems: 'flex-start', gap: 24,
        }}>
          {/* Avatar */}
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, fontWeight: 800, color: 'white', flexShrink: 0,
            boxShadow: '0 0 24px rgba(59,130,246,0.35)',
          }}>
            {initials}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {editing ? (
              <div>
                <EditField
                  label="Display name"
                  value={editName}
                  onChange={setEditName}
                  placeholder="Your name"
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={handleSaveEdit}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '8px 16px', borderRadius: 10,
                      background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                      color: 'white', fontSize: 13, fontWeight: 600,
                      border: 'none', cursor: 'pointer',
                    }}
                  >
                    <Save size={13} /> Save
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '8px 16px', borderRadius: 10,
                      border: '1px solid rgba(148,163,184,0.2)',
                      background: 'transparent',
                      color: '#94a3b8', fontSize: 13, cursor: 'pointer',
                    }}
                  >
                    <X size={13} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div style={{
                  fontSize: 24, fontWeight: 800, color: '#f1f5f9',
                  fontFamily: 'Space Grotesk, sans-serif',
                  letterSpacing: '-0.02em', marginBottom: 4,
                }}>
                  {displayName}
                </div>
                <div style={{ fontSize: 13, color: '#64748b', marginBottom: 14 }}>{email}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    padding: '3px 10px', borderRadius: 99,
                    background: explanationMode === 'simple' ? 'rgba(59,130,246,0.12)' : 'rgba(139,92,246,0.12)',
                    border: `1px solid ${explanationMode === 'simple' ? 'rgba(59,130,246,0.3)' : 'rgba(139,92,246,0.3)'}`,
                    color: explanationMode === 'simple' ? '#60a5fa' : '#a78bfa',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>
                    {explanationMode} mode
                  </span>
                  {currentStreak > 0 && (
                    <span style={{
                      fontSize: 11, fontWeight: 700,
                      padding: '3px 10px', borderRadius: 99,
                      background: 'rgba(249,115,22,0.1)',
                      border: '1px solid rgba(249,115,22,0.3)',
                      color: '#fb923c',
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>
                      🔥 {currentStreak} streak
                    </span>
                  )}
                </div>
              </>
            )}
          </div>

          {!editing && (
            <button
              onClick={() => { setEditName(displayName); setEditing(true); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 10,
                border: '1px solid rgba(148,163,184,0.2)',
                background: 'rgba(255,255,255,0.04)',
                color: '#94a3b8', fontSize: 13, cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.2s',
              }}
            >
              <Edit3 size={13} /> Edit
            </button>
          )}
        </motion.div>

        {/* ── Stats Grid ── */}
        <motion.div {...fadeUp(0.06)} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 14, marginBottom: 24,
        }}>
          <StatCard label="Problems solved" value={correctCount} icon={<Target size={15} />} color="#3b82f6" sub={`${totalProblemsAttempted} attempted`} />
          <StatCard label="Accuracy" value={`${accuracy}%`} icon={<Trophy size={15} />} color="#10b981" sub="all time" />
          <StatCard label="Streak" value={currentStreak} icon={<Flame size={15} />} color="#f97316" sub="in a row" />
          <StatCard label="Avg confidence" value={`${avgConf}%`} icon={<BarChart3 size={15} />} color="#8b5cf6" sub="across 10 topics" />
        </motion.div>

        {/* ── Two column: confidence + account ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>

          {/* Confidence Scores */}
          <motion.div {...fadeUp(0.1)} style={{
            background: 'linear-gradient(135deg, rgba(15,23,42,0.85), rgba(10,22,40,0.95))',
            border: '1px solid rgba(148,163,184,0.1)',
            borderRadius: 16, padding: 22,
          }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', marginBottom: 16 }}>
              Confidence scores
            </h3>
            <div style={{ borderTop: '1px solid rgba(148,163,184,0.08)' }}>
              {topicsSorted.map(([topic, value]) => (
                <ConfidenceBar key={topic} topic={topic} value={value} />
              ))}
            </div>
          </motion.div>

          {/* Account Details */}
          <motion.div {...fadeUp(0.12)} style={{
            background: 'linear-gradient(135deg, rgba(15,23,42,0.85), rgba(10,22,40,0.95))',
            border: '1px solid rgba(148,163,184,0.1)',
            borderRadius: 16, padding: 22,
          }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', marginBottom: 16 }}>
              Account details
            </h3>
            {[
              { label: 'Full name', value: displayName },
              { label: 'Email', value: email },
              { label: 'Mode', value: explanationMode === 'simple' ? 'Simple' : 'Complex' },
              { label: 'Problems attempted', value: totalProblemsAttempted },
              { label: 'Problems solved', value: correctCount },
              { label: 'Current streak', value: `${currentStreak} day${currentStreak !== 1 ? 's' : ''}` },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', padding: '10px 0',
                  borderBottom: '1px solid rgba(148,163,184,0.07)',
                  fontSize: 13,
                }}
              >
                <span style={{ color: '#64748b' }}>{label}</span>
                <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{value}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── Danger Zone ── */}
        <motion.div {...fadeUp(0.16)} style={{
          background: 'rgba(244,63,94,0.04)',
          border: '1px solid rgba(244,63,94,0.2)',
          borderRadius: 16, padding: 22,
        }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#f43f5e', marginBottom: 16 }}>
            Danger zone
          </h3>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 14, color: '#f1f5f9', marginBottom: 3 }}>Reset learning progress</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                Clears all confidence scores and problem history permanently
              </div>
            </div>
            {!showResetConfirm && !resetDone && (
              <button
                onClick={() => setShowResetConfirm(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 18px', borderRadius: 10,
                  border: '1px solid rgba(244,63,94,0.35)',
                  background: 'rgba(244,63,94,0.08)',
                  color: '#f87171', fontSize: 13, cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <AlertTriangle size={13} /> Reset
              </button>
            )}
            {showResetConfirm && (
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button
                  onClick={handleReset}
                  style={{
                    padding: '8px 16px', borderRadius: 10,
                    background: '#dc2626', color: 'white',
                    fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
                  }}
                >
                  Confirm reset
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  style={{
                    padding: '8px 16px', borderRadius: 10,
                    border: '1px solid rgba(148,163,184,0.2)',
                    background: 'transparent', color: '#94a3b8',
                    fontSize: 13, cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
            {resetDone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', fontSize: 13 }}>
                <CheckCircle size={14} /> Progress reset
              </div>
            )}
          </div>
        </motion.div>

      </main>
    </div>
  );
}
