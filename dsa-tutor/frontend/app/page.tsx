'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, Target, Users, ChevronRight, CheckCircle, XCircle, Clock, Flame, BarChart3, Code2, Sparkles, GraduationCap, BookOpen, Trophy } from 'lucide-react';
import { useLearnerStore } from '@/store/learnerStore';
import { ExplanationMode, DSATopic } from '@/types/learner';

// ── Neural Canvas ─────────────────────────────────────────────────────────
function NeuralCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; });
    type P = { x: number; y: number; vx: number; vy: number; r: number };
    const nodes: P[] = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 2.5 + 1,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 150) {
            ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(59,130,246,${0.15 * (1 - d / 150)})`; ctx.lineWidth = 1; ctx.stroke();
          }
        }
      }
      nodes.forEach((n) => {
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(99,160,255,0.6)'; ctx.fill();
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, []);
  return <canvas ref={canvasRef} aria-hidden style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.5 }} />;
}

// ── Quiz data ─────────────────────────────────────────────────────────────
const QUIZ = [
  { topic: 'arrays' as DSATopic, q: 'Time complexity to search an unsorted array?', opts: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], correct: 2 },
  { topic: 'trees' as DSATopic, q: 'Inorder traversal of a BST gives?', opts: ['Random', 'Ascending', 'Descending', 'Level-by-level'], correct: 1 },
  { topic: 'graphs' as DSATopic, q: 'Shortest path in unweighted graph?', opts: ['DFS', 'Dijkstra', 'BFS', "Prim's"], correct: 2 },
  { topic: 'recursion' as DSATopic, q: 'What prevents infinite recursion?', opts: ['A loop', 'Base case', 'Return type', 'Global state'], correct: 1 },
  { topic: 'dp' as DSATopic, q: 'Dynamic programming best applies when?', opts: ['No repetition', 'Overlapping subproblems', 'One solution', 'Linear only'], correct: 1 },
];

// ── Onboarding Quiz ───────────────────────────────────────────────────────
function OnboardingQuiz({ onComplete }: { onComplete: (s: Partial<Record<DSATopic, number>>) => void }) {
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);
  const [timeLeft, setTimeLeft] = useState(15);
  const current = QUIZ[qIdx];

  useEffect(() => {
    if (answered) return;
    setTimeLeft(15);
    const iv = setInterval(() => setTimeLeft((t) => { if (t <= 1) { clearInterval(iv); handle(-1); return 0; } return t - 1; }), 1000);
    return () => clearInterval(iv);
  }, [qIdx, answered]);

  const handle = useCallback((i: number) => {
    if (answered) return;
    setSelected(i); setAnswered(true);
    const ok = i === current.correct;
    const nr = [...results, ok];
    setTimeout(() => {
      if (qIdx + 1 >= QUIZ.length) {
        const scores: Partial<Record<DSATopic, number>> = {};
        QUIZ.forEach((q, j) => { scores[q.topic] = nr[j] ? 0.75 : 0.25; });
        onComplete(scores);
      } else { setQIdx(qIdx + 1); setSelected(null); setAnswered(false); setResults(nr); }
    }, 800);
  }, [answered, current.correct, qIdx, results, onComplete]);

  const progress = ((qIdx + (answered ? 1 : 0)) / QUIZ.length) * 100;
  const timerPct = (timeLeft / 15) * 100;

  return (
    <div style={{ width: '100%', maxWidth: 520 }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: '#64748b' }}>Question {qIdx + 1} / {QUIZ.length}</span>
          <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: timeLeft <= 5 ? '#f43f5e' : '#64748b' }}>⏱ {timeLeft}s</span>
        </div>
        <div style={{ height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: 4 }}>
          <motion.div style={{ height: '100%', background: '#3b82f6', borderRadius: 99 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
        </div>
        <div style={{ height: 2, borderRadius: 99, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
          <motion.div style={{ height: '100%', borderRadius: 99, background: timeLeft <= 5 ? '#f43f5e' : '#10b981' }} animate={{ width: `${timerPct}%` }} transition={{ duration: 0.9, ease: 'linear' }} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={qIdx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
          <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 14, padding: 20, marginBottom: 14 }}>
            <p style={{ color: '#f1f5f9', fontSize: 15, fontWeight: 500, lineHeight: 1.6 }}>{current.q}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {current.opts.map((opt, i) => {
              const state = answered ? (i === current.correct ? 'correct' : i === selected ? 'wrong' : 'idle') : 'idle';
              return (
                <motion.button key={i} onClick={() => handle(i)} disabled={answered} whileHover={!answered ? { scale: 1.01 } : {}} whileTap={!answered ? { scale: 0.98 } : {}}
                  style={{
                    textAlign: 'left', padding: '12px 16px', borderRadius: 12, fontSize: 14, fontWeight: 500, cursor: answered ? 'default' : 'pointer',
                    background: state === 'correct' ? 'rgba(16,185,129,0.12)' : state === 'wrong' ? 'rgba(244,63,94,0.12)' : 'rgba(15,23,42,0.6)',
                    border: `1px solid ${state === 'correct' ? 'rgba(16,185,129,0.4)' : state === 'wrong' ? 'rgba(244,63,94,0.4)' : 'rgba(148,163,184,0.12)'}`,
                    color: state === 'correct' ? '#34d399' : state === 'wrong' ? '#fb7185' : '#cbd5e1',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                  <span style={{
                    width: 26, height: 26, borderRadius: '50%', border: `1px solid ${state === 'correct' ? '#10b981' : state === 'wrong' ? '#f43f5e' : 'rgba(148,163,184,0.3)'}`,
                    background: state === 'correct' ? '#10b981' : state === 'wrong' ? '#f43f5e' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0,
                    color: state !== 'idle' ? 'white' : '#64748b',
                  }}>
                    {state === 'correct' ? '✓' : state === 'wrong' ? '✗' : String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Mode Selector ─────────────────────────────────────────────────────────
const MODES = [
  { mode: 'simple' as ExplanationMode, icon: <BookOpen size={32} />, label: 'Simple Mode', tag: 'Beginner-friendly', desc: 'Real-world analogies, zero jargon.', example: '"An array is like a row of numbered lockers."', color: '#3b82f6' },
  { mode: 'complex' as ExplanationMode, icon: <GraduationCap size={32} />, label: 'Complex Mode', tag: 'Interview-ready', desc: 'Big-O notation, CS terminology, FAANG-style.', example: '"O(1) random access via contiguous memory."', color: '#8b5cf6' },
];

const FEATURES = [
  { icon: <Brain size={15} />, label: 'Real-time cognitive model', color: '#3b82f6' },
  { icon: <Target size={15} />, label: 'Adaptive problem selection', color: '#8b5cf6' },
  { icon: <Zap size={15} />, label: '3-level progressive hints', color: '#f59e0b' },
  { icon: <BarChart3 size={15} />, label: 'Live knowledge graph', color: '#10b981' },
  { icon: <Users size={15} />, label: 'Multiplayer battle mode', color: '#ec4899' },
  { icon: <Code2 size={15} />, label: 'In-browser code execution', color: '#06b6d4' },
];

type Step = 'hero' | 'mode' | 'quiz';

export default function LandingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('hero');
  const [selectedMode, setSelectedMode] = useState<ExplanationMode | null>(null);
  const { setExplanationMode, setConfidenceFromQuiz } = useLearnerStore();

  const handleModeConfirm = () => {
    if (!selectedMode) return;
    setExplanationMode(selectedMode);
    setStep('quiz');
  };

  const handleQuizComplete = (scores: Partial<Record<DSATopic, number>>) => {
    setConfidenceFromQuiz(scores);
    router.push('/session');
  };

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #030712 0%, #060e1e 50%, #030712 100%)', position: 'relative', overflowX: 'hidden' }}>
      <NeuralCanvas />

      {/* Main */}
      <main style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <AnimatePresence mode="wait">

          {/* HERO */}
          {step === 'hero' && (
            <motion.div key="hero" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} transition={{ duration: 0.5 }}
              style={{ textAlign: 'center', maxWidth: 720, width: '100%' }}>

              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(52px, 10vw, 96px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.04em', marginBottom: 24, color: '#f8fafc' }}>
                <span style={{ background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Lhama</span>Learns
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                style={{ fontSize: 18, color: '#94a3b8', lineHeight: 1.7, maxWidth: 520, margin: '0 auto 40px', fontWeight: 400 }}>
                An autonomous agent that builds a <strong style={{ color: '#e2e8f0', fontWeight: 600 }}>real-time cognitive model</strong> of you — then <strong style={{ color: '#e2e8f0', fontWeight: 600 }}>decides what to teach next</strong>.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 56 }}>
                <button onClick={() => router.push('/register')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 28px', borderRadius: 14, background: 'linear-gradient(135deg, #2563eb, #7c3aed)', color: 'white', fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 0 40px rgba(59,130,246,0.35)', letterSpacing: '-0.01em' }}>
                  <Brain size={20} /> Get Started <ChevronRight size={18} />
                </button>
                <button onClick={() => router.push('/login')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 28px', borderRadius: 14, background: 'rgba(255,255,255,0.06)', color: '#e2e8f0', fontSize: 16, fontWeight: 600, border: '1px solid rgba(148,163,184,0.2)', cursor: 'pointer' }}>
                  <BarChart3 size={18} /> Sign In
                </button>
              </motion.div>

              {/* Feature grid */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, maxWidth: 580, margin: '0 auto 40px' }}>
                {FEATURES.map(({ icon, label, color }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 12, border: '1px solid rgba(148,163,184,0.1)', background: 'rgba(15,23,42,0.6)' }}>
                    <span style={{ color, flexShrink: 0 }}>{icon}</span>
                    <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, lineHeight: 1.3 }}>{label}</span>
                  </div>
                ))}
              </motion.div>

              {/* Social proof */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                style={{ display: 'flex', gap: 32, justifyContent: 'center', color: '#475569', fontSize: 13 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Flame size={15} color="#f97316" /> 30+ Problems</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Trophy size={15} color="#eab308" /> 10 Topics</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Users size={15} color="#60a5fa" /> Multiplayer</span>
              </motion.div>
            </motion.div>
          )}

          {/* MODE SELECTION */}
          {step === 'mode' && (
            <motion.div key="mode" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.4 }}
              style={{ width: '100%', maxWidth: 600, textAlign: 'center' }}>
              <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 32, fontWeight: 800, color: '#f1f5f9', marginBottom: 10 }}>Choose Your Mode</h2>
              <p style={{ color: '#64748b', fontSize: 14, marginBottom: 32 }}>Controls how the AI explains concepts. You can switch anytime.</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
                {MODES.map(({ mode, icon, label, tag, desc, example, color }) => (
                  <motion.button key={mode} onClick={() => setSelectedMode(mode)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    style={{
                      textAlign: 'left', padding: 22, borderRadius: 18, cursor: 'pointer', border: `2px solid ${selectedMode === mode ? color : 'rgba(148,163,184,0.12)'}`,
                      background: selectedMode === mode ? `${color}12` : 'rgba(15,23,42,0.7)',
                      boxShadow: selectedMode === mode ? `0 0 32px ${color}25` : 'none',
                      transition: 'all 0.25s',
                    }}>
                    <div style={{ color, marginBottom: 14 }}>{icon}</div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>{tag}</div>
                    <div style={{ fontSize: 13, color: '#64748b', marginBottom: 14, lineHeight: 1.5 }}>{desc}</div>
                    <div style={{ fontSize: 12, fontStyle: 'italic', padding: '10px 12px', borderRadius: 8, background: `${color}10`, color: `${color}cc`, borderLeft: `2px solid ${color}40` }}>{example}</div>
                  </motion.button>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                <button onClick={() => setStep('hero')} style={{ padding: '12px 24px', borderRadius: 12, border: '1px solid rgba(148,163,184,0.15)', background: 'transparent', color: '#64748b', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Back</button>
                <button onClick={handleModeConfirm} disabled={!selectedMode}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 12, background: selectedMode ? 'linear-gradient(135deg, #2563eb, #7c3aed)' : 'rgba(148,163,184,0.1)', color: selectedMode ? 'white' : '#64748b', fontSize: 14, fontWeight: 700, border: 'none', cursor: selectedMode ? 'pointer' : 'not-allowed' }}>
                  Continue to Quiz <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* QUIZ */}
          {step === 'quiz' && (
            <motion.div key="quiz" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.4 }}
              style={{ width: '100%', maxWidth: 540, textAlign: 'center' }}>
              <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 26, fontWeight: 800, color: '#f1f5f9', marginBottom: 8 }}>Quick Assessment</h2>
                <p style={{ color: '#64748b', fontSize: 13 }}>5 questions to calibrate your starting confidence scores</p>
              </div>
              <OnboardingQuiz onComplete={handleQuizComplete} />
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
