'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Brain, Lock, CheckCircle2, Star } from 'lucide-react';
import { useLearnerStore } from '@/store/learnerStore';
import { useAuth } from '@/hooks/useAuth';

// ── DSA Roadmap Data ────────────────────────────────────────────────────────

interface RoadmapNode {
  id: number;
  label: string;
  icon: string;
  section: string;
  route: string;
  status: 'completed' | 'active' | 'locked';
  xPct: number; // horizontal % position in the column
}

const ROADMAP: RoadmapNode[] = [
  // Section 1 — Arrays & Strings
  { id: 1,  label: 'Arrays Basics',       icon: '📦', section: 'Section 1 · Arrays & Strings',  route: '/session', status: 'completed', xPct: 50 },
  { id: 2,  label: 'Two Pointers',        icon: '👆', section: 'Section 1 · Arrays & Strings',  route: '/session', status: 'completed', xPct: 28 },
  { id: 3,  label: 'Sliding Window',      icon: '🪟', section: 'Section 1 · Arrays & Strings',  route: '/session', status: 'active',    xPct: 68 },
  { id: 4,  label: 'String Manip',        icon: '🔤', section: 'Section 1 · Arrays & Strings',  route: '/session', status: 'locked',    xPct: 35 },
  // Section 2 — Linked Lists
  { id: 5,  label: 'Linked Lists',        icon: '🔗', section: 'Section 2 · Linked Lists',       route: '/session', status: 'locked',    xPct: 60 },
  { id: 6,  label: 'Fast & Slow',         icon: '🐢', section: 'Section 2 · Linked Lists',       route: '/session', status: 'locked',    xPct: 30 },
  // Section 3 — Trees
  { id: 7,  label: 'Binary Trees',        icon: '🌳', section: 'Section 3 · Trees & Graphs',     route: '/session', status: 'locked',    xPct: 65 },
  { id: 8,  label: 'BST',                 icon: '🔍', section: 'Section 3 · Trees & Graphs',     route: '/session', status: 'locked',    xPct: 38 },
  { id: 9,  label: 'Graph BFS/DFS',       icon: '🗺️', section: 'Section 3 · Trees & Graphs',     route: '/session', status: 'locked',    xPct: 58 },
  // Section 4 — DP
  { id: 10, label: 'Dynamic Prog.',       icon: '⚡', section: 'Section 4 · Dynamic Programming', route: '/session', status: 'locked',    xPct: 35 },
  { id: 11, label: 'Knapsack',            icon: '🎒', section: 'Section 4 · Dynamic Programming', route: '/session', status: 'locked',    xPct: 62 },
  { id: 12, label: 'Final Boss',          icon: '🏆', section: 'Section 4 · Dynamic Programming', route: '/session', status: 'locked',    xPct: 50 },
];

// Section dividers — inserted before nodes with these IDs
const SECTION_BEFORE: Record<number, string> = {
  1:  'Section 1, Unit 1 · Arrays & Strings',
  5:  'Section 2, Unit 5 · Linked Lists',
  7:  'Section 3, Unit 7 · Trees & Graphs',
  10: 'Section 4, Unit 10 · Dynamic Programming',
};

// ── Node colours by status ──────────────────────────────────────────────────
function nodeStyle(status: RoadmapNode['status']): {
  bg: string; border: string; shadow: string; iconColor: string;
} {
  if (status === 'completed') return {
    bg: 'linear-gradient(135deg, #10b981, #059669)',
    border: 'rgba(16,185,129,0.6)',
    shadow: '0 0 24px rgba(16,185,129,0.5)',
    iconColor: 'white',
  };
  if (status === 'active') return {
    bg: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
    border: 'rgba(99,102,241,0.8)',
    shadow: '0 0 32px rgba(99,102,241,0.6)',
    iconColor: 'white',
  };
  return {
    bg: 'rgba(15,23,42,0.9)',
    border: 'rgba(148,163,184,0.15)',
    shadow: 'none',
    iconColor: '#334155',
  };
}

// ── Starfield ───────────────────────────────────────────────────────────────
function Starfield() {
  const [stars, setStars] = useState<{ x: number; y: number; s: number }[]>([]);
  useEffect(() => {
    setStars(Array.from({ length: 60 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      s: Math.random() * 1.8 + 0.4,
    })));
  }, []);
  return (
    <div aria-hidden style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
      {stars.map((star, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.15, 0.6, 0.15] }}
          transition={{ duration: 2.5 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 3 }}
          style={{
            position: 'absolute',
            left: `${star.x}%`, top: `${star.y}%`,
            width: star.s, height: star.s,
            borderRadius: '50%', background: 'white',
          }}
        />
      ))}
    </div>
  );
}

// ── Roadmap Node ─────────────────────────────────────────────────────────────
function RoadNode({ node, index, onNavigate }: {
  node: RoadmapNode;
  index: number;
  onNavigate: (route: string, status: RoadmapNode['status']) => void;
}) {
  const s = nodeStyle(node.status);
  const isLocked = node.status === 'locked';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 + index * 0.08, type: 'spring', stiffness: 280, damping: 18 }}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        width: 90,
        alignSelf: 'flex-start',
        marginLeft: `calc(${node.xPct}% - 45px)`,
      }}
    >
      <motion.button
        onClick={() => onNavigate(node.route, node.status)}
        whileHover={isLocked ? {} : { scale: 1.12 }}
        whileTap={isLocked ? {} : { scale: 0.95 }}
        animate={node.status === 'active' ? {
          boxShadow: [
            '0 0 18px rgba(99,102,241,0.4)',
            '0 0 36px rgba(99,102,241,0.8)',
            '0 0 18px rgba(99,102,241,0.4)',
          ]
        } : {}}
        transition={node.status === 'active' ? { duration: 1.8, repeat: Infinity } : {}}
        style={{
          width: 72, height: 72, borderRadius: '50%',
          background: s.bg,
          border: `3px solid ${s.border}`,
          boxShadow: s.shadow,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: isLocked ? 18 : 26,
          cursor: isLocked ? 'not-allowed' : 'pointer',
          position: 'relative',
          outline: 'none',
          transition: 'transform 0.15s',
        }}
        title={isLocked ? 'Complete previous levels to unlock' : node.label}
      >
        {isLocked
          ? <Lock size={24} color="#334155" />
          : node.status === 'completed'
          ? <CheckCircle2 size={28} color="white" strokeWidth={2.5} />
          : <span style={{ fontSize: 28 }}>{node.icon}</span>
        }
      </motion.button>

      <div style={{
        fontSize: 11, fontWeight: 700, color: isLocked ? '#334155' : '#e2e8f0',
        textAlign: 'center', lineHeight: 1.3, maxWidth: 88,
        fontFamily: 'Space Grotesk, sans-serif',
      }}>
        {node.label}
      </div>

      {node.status === 'active' && (
        <div style={{ display: 'flex', gap: 4, marginTop: -2 }}>
          {[0, 1, 2].map((i) => (
            <Star key={i} size={10} color="#94a3b8" fill="none" />
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ── Section Banner ───────────────────────────────────────────────────────────
function SectionBanner({ label }: { label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      style={{
        width: '100%',
        padding: '14px 22px',
        borderRadius: 14,
        background: 'linear-gradient(135deg, rgba(37,99,235,0.25), rgba(124,58,237,0.2))',
        border: '1px solid rgba(99,102,241,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 8,
      }}
    >
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {label}
        </div>
      </div>
      <Brain size={18} color="#7c3aed" />
    </motion.div>
  );
}

// ── Main Roadmap Page ─────────────────────────────────────────────────────────
export default function RoadmapPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { userName: storedName } = useLearnerStore();

  const displayName = user
    ? (user.user_metadata?.full_name as string | undefined) || user.email?.split('@')[0] || 'Learner'
    : storedName || 'Learner';

  const handleNavigate = (route: string, status: RoadmapNode['status']) => {
    if (status === 'locked') return;
    router.push(route);
  };

  // Group nodes so we can insert section banners
  const sections: string[] = [];
  ROADMAP.forEach(n => { if (!sections.includes(n.section)) sections.push(n.section); });

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(180deg, #030712 0%, #060e1e 50%, #030712 100%)',
      color: '#f8fafc',
      position: 'relative', overflowX: 'hidden',
    }}>
      <Starfield />

      {/* ── Nav ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 40,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', height: 56,
        background: 'rgba(6,14,30,0.9)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(148,163,184,0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/main-menu" style={{ color: '#475569', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <ArrowLeft size={18} />
          </Link>
          <div style={{ width: 1, height: 20, background: 'rgba(148,163,184,0.15)' }} />
          <Brain size={17} color="#60a5fa" />
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 15 }}>
            Lhama<span style={{ color: '#60a5fa' }}>Learner</span>
            <span style={{ color: '#475569', fontWeight: 400, marginLeft: 8, fontSize: 13 }}>Roadmap</span>
          </span>
        </div>

        {/* Player avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#64748b' }}>{displayName}</span>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 800, color: 'white',
          }}>
            {displayName.charAt(0).toUpperCase()}
          </div>
        </div>
      </nav>

      {/* ── Hero subtitle ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        style={{ textAlign: 'center', padding: '28px 24px 8px' }}
      >
        <h1 style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: 24, fontWeight: 900, marginBottom: 6,
        }}>
          Your DSA Journey
        </h1>
        <p style={{ color: '#64748b', fontSize: 13 }}>
          Master each topic to unlock the next — the AI adapts to your pace.
        </p>
      </motion.div>

      {/* ── Winding Path ── */}
      <div style={{
        position: 'relative', zIndex: 10,
        maxWidth: 420, margin: '0 auto',
        padding: '16px 24px 80px',
        display: 'flex', flexDirection: 'column', gap: 20,
      }}>
        {sections.map((section) => {
          const sectionNodes = ROADMAP.filter(n => n.section === section);
          const sectionBannerLabel = SECTION_BEFORE[sectionNodes[0].id] ?? section;
          return (
            <div key={section} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <SectionBanner label={sectionBannerLabel} />
              {sectionNodes.map((node, i) => (
                <RoadNode
                  key={node.id}
                  node={node}
                  index={ROADMAP.indexOf(node)}
                  onNavigate={handleNavigate}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
