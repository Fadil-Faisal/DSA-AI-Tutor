'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Play, Users, Sparkles, ChevronDown,
  User, Settings, LogOut, Flame, BarChart3,
  Zap, Target, Code2,
} from 'lucide-react';
import { useLearnerStore } from '@/store/learnerStore';
import { useAuth } from '@/hooks/useAuth';

// ── Neural Canvas ─────────────────────────────────────────────────────────
function NeuralCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    type P = { x: number; y: number; vx: number; vy: number; r: number };
    const nodes: P[] = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      r: Math.random() * 2.2 + 0.8,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 140) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(59,130,246,${0.13 * (1 - d / 140)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      nodes.forEach((n) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(99,160,255,0.55)';
        ctx.fill();
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);
  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: 'fixed', inset: 0,
        pointerEvents: 'none', zIndex: 0, opacity: 0.45,
      }}
    />
  );
}

// ── Profile Dropdown ──────────────────────────────────────────────────────
interface ProfileDropdownProps {
  displayName: string;
  initials: string;
}

function ProfileDropdown({ displayName, initials }: ProfileDropdownProps) {
  const router = useRouter();
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (open && dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [open]);

  const handleSignOut = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(false);
    await signOut();
    router.push('/login');
  };

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(o => !o);
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={toggleMenu}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '5px 10px 5px 6px',
          border: '1px solid rgba(148,163,184,0.2)',
          borderRadius: 12,
          background: open ? 'rgba(15,23,42,0.8)' : 'rgba(15,23,42,0.5)',
          cursor: 'pointer',
          fontSize: 13, fontWeight: 600, color: '#e2e8f0',
          transition: 'all 0.2s',
        }}
      >
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 800, color: 'white', flexShrink: 0,
        }}>
          {initials}
        </div>
        <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {displayName}
        </span>
        <ChevronDown
          size={13}
          color="#64748b"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute', top: '100%', right: 0,
              minWidth: 180,
              background: 'rgba(10,22,40,0.98)',
              border: '1px solid rgba(148,163,184,0.15)',
              borderRadius: 14,
              zIndex: 100,
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{displayName}</div>
              <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>Learner account</div>
            </div>

            {[
              { icon: <User size={14} />, label: 'Profile', href: '/profile' },
              { icon: <Settings size={14} />, label: 'Settings', href: '/settings' },
            ].map(({ icon, label, href }) => (
              <Link
                key={label}
                href={href}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', fontSize: 13, color: '#94a3b8',
                  textDecoration: 'none', transition: 'background 0.12s, color 0.12s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.05)';
                  (e.currentTarget as HTMLAnchorElement).style.color = '#f1f5f9';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                  (e.currentTarget as HTMLAnchorElement).style.color = '#94a3b8';
                }}
              >
                <span style={{ color: '#475569' }}>{icon}</span>
                {label}
              </Link>
            ))}

            <div style={{ height: '1px', background: 'rgba(148,163,184,0.1)', margin: '2px 0' }} />

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSignOut(e);
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '10px 14px',
                fontSize: 13, color: '#f43f5e',
                background: 'none', border: 'none', cursor: 'pointer',
                textAlign: 'left', transition: 'background 0.12s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(244,63,94,0.08)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
            >
              <LogOut size={14} />
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Stats row ─────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: <Target size={14} />, label: 'Adaptive problems', color: '#3b82f6' },
  { icon: <Zap size={14} />, label: 'AI-powered hints', color: '#f59e0b' },
  { icon: <BarChart3 size={14} />, label: 'Live knowledge graph', color: '#10b981' },
  { icon: <Code2 size={14} />, label: 'Code execution', color: '#8b5cf6' },
];

// ── Main Menu Page ────────────────────────────────────────────────────────
export default function MainMenuPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { currentStreak, totalProblemsAttempted, confidence } = useLearnerStore();

  const displayName = user
    ? (user.user_metadata?.full_name as string | undefined) || user.email?.split('@')[0] || 'Learner'
    : 'Learner';
  const initials = displayName
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const avgConfidence = Math.round(
    (Object.values(confidence).reduce((s, v) => s + v, 0) / 10) * 100
  );

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(135deg, #030712 0%, #060e1e 50%, #030712 100%)',
      position: 'relative', overflowX: 'hidden',
    }}>
      <NeuralCanvas />

      {/* Ambient blobs */}
      <div aria-hidden style={{
        position: 'fixed', top: '25%', left: '8%',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div aria-hidden style={{
        position: 'fixed', bottom: '20%', right: '6%',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* ── Nav ── */}
      <nav style={{
        position: 'relative', zIndex: 40,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', height: 58,
        background: 'rgba(6,14,30,0.8)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(148,163,184,0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 18px rgba(59,130,246,0.4)',
          }}>
            <Brain size={17} color="white" />
          </div>
          <span style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 800, fontSize: 17, color: '#f8fafc',
            letterSpacing: '-0.02em',
          }}>
            Lhama<span style={{ color: '#60a5fa' }}>Learner</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* streak pill */}
          {currentStreak > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '4px 12px', borderRadius: 99,
              background: 'rgba(249,115,22,0.1)',
              border: '1px solid rgba(249,115,22,0.25)',
              fontSize: 12, fontWeight: 700, color: '#fb923c',
            }}>
              <Flame size={12} />
              {currentStreak} streak
            </div>
          )}

          {!authLoading && user && (
            <ProfileDropdown displayName={displayName} initials={initials} />
          )}
        </div>
      </nav>

      {/* ── Main ── */}
      <main style={{
        position: 'relative', zIndex: 10,
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          style={{ textAlign: 'center', maxWidth: 680, width: '100%' }}
        >

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 'clamp(48px, 9vw, 84px)',
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: '-0.035em',
              marginBottom: 20,
              color: '#f8fafc',
            }}
          >
            Lhama
            <span style={{
              background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              {' '}Learner
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26 }}
            style={{
              fontSize: 17, color: '#94a3b8', lineHeight: 1.7,
              maxWidth: 500, margin: '0 auto 48px',
            }}
          >
            Your AI tutor that builds a real-time model of your knowledge —
            then decides exactly what to teach next.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.34 }}
            style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 14, marginBottom: 56,
            }}
          >
            {/* Primary — Start */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push('/roadmap')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 12,
                padding: '16px 48px', borderRadius: 16,
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                color: 'white', fontSize: 17, fontWeight: 800,
                border: 'none', cursor: 'pointer',
                boxShadow: '0 0 48px rgba(59,130,246,0.3)',
                letterSpacing: '-0.01em',
                fontFamily: 'Space Grotesk, sans-serif',
              }}
            >
              <Play size={20} />
              Start
            </motion.button>

            {/* Secondary buttons row */}
            <div style={{ display: 'flex', gap: 12 }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push('/multiplayer')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '12px 28px', borderRadius: 14,
                  background: 'rgba(255,255,255,0.05)',
                  color: '#cbd5e1', fontSize: 14, fontWeight: 600,
                  border: '1px solid rgba(148,163,184,0.18)',
                  cursor: 'pointer', letterSpacing: '-0.01em',
                  transition: 'border-color 0.2s, background 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(59,130,246,0.4)';
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(59,130,246,0.08)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(148,163,184,0.18)';
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)';
                }}
              >
                <Users size={16} />
                Multiplayer
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push('/interview')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '12px 28px', borderRadius: 14,
                  background: 'rgba(255,255,255,0.05)',
                  color: '#cbd5e1', fontSize: 14, fontWeight: 600,
                  border: '1px solid rgba(148,163,184,0.18)',
                  cursor: 'pointer', letterSpacing: '-0.01em',
                  transition: 'border-color 0.2s, background 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(139,92,246,0.4)';
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(139,92,246,0.08)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(148,163,184,0.18)';
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)';
                }}
              >
                <Sparkles size={16} />
                Extra
              </motion.button>
            </div>
          </motion.div>

          {/* Stats row */}
          {totalProblemsAttempted > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              style={{
                display: 'flex', gap: 24, justifyContent: 'center',
                marginBottom: 48, flexWrap: 'wrap',
              }}
            >
              {[
                { label: 'Problems attempted', value: totalProblemsAttempted },
                { label: 'Current streak', value: `${currentStreak} 🔥` },
                { label: 'Avg confidence', value: `${avgConfidence}%` },
              ].map(({ label, value }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', fontFamily: 'Space Grotesk, sans-serif' }}>
                    {value}
                  </div>
                  <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            {FEATURES.map(({ icon, label, color }) => (
              <div
                key={label}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '7px 14px', borderRadius: 99,
                  border: '1px solid rgba(148,163,184,0.1)',
                  background: 'rgba(15,23,42,0.5)',
                  fontSize: 12, color: '#94a3b8',
                }}
              >
                <span style={{ color }}>{icon}</span>
                {label}
              </div>
            ))}
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
