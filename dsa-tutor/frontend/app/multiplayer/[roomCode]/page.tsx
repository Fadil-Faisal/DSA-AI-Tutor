'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { use } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Swords, Clock, CheckCircle2, Activity, Users, Send, Trophy, Brain } from 'lucide-react';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const BATTLE_PROBLEM = {
  title: 'Maximum Subarray',
  description: 'Given an integer array nums, find the subarray with the largest sum and return its sum.',
  example: 'nums = [-2,1,-3,4,-1,2,1,-5,4]  →  Output: 6  (subarray [4,-1,2,1])',
};

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

type Phase = 'waiting' | 'active' | 'finished';

export default function RoomPage({ params }: { params: Promise<{ roomCode: string }> }) {
  const { roomCode } = use(params);

  const [phase, setPhase] = useState<Phase>('waiting');
  const [myCode, setMyCode] = useState('# Solve Maximum Subarray\ndef maxSubArray(nums):\n    pass\n');
  const [opponentActivity, setOpponentActivity] = useState(0);
  const [opponentCode, setOpponentCode] = useState('# Opponent is typing...\n');
  const [mySubmitted, setMySubmitted] = useState(false);
  const [opponentSubmitted, setOpponentSubmitted] = useState(false);
  const [timerSec, setTimerSec] = useState(0);
  const [winner, setWinner] = useState<'me' | 'opponent' | null>(null);

  // Auto-start after 2s (demo)
  useEffect(() => { const t = setTimeout(() => setPhase('active'), 2000); return () => clearTimeout(t); }, []);

  // Timer
  useEffect(() => {
    if (phase !== 'active') return;
    const iv = setInterval(() => setTimerSec((s) => s + 1), 1000);
    return () => clearInterval(iv);
  }, [phase]);

  // Simulate opponent
  useEffect(() => {
    if (phase !== 'active') return;
    const iv = setInterval(() => {
      setOpponentActivity((a) => Math.min(100, a + Math.random() * 5));
      setOpponentCode((c) => {
        const lines = ['# Opponent is typing...', 'def maxSubArray(nums):', '    max_sum = nums[0]', '    curr = 0', '    for n in nums:', '        curr = max(n, curr+n)', '        max_sum = max(max_sum, curr)', '    return max_sum'];
        const shown = Math.min(lines.length, Math.ceil((c.split('\n').length)));
        return lines.slice(0, shown).join('\n') + '\n';
      });
    }, 1200);
    const oppSubmit = setTimeout(() => { setOpponentSubmitted(true); }, 45000);
    return () => { clearInterval(iv); clearTimeout(oppSubmit); };
  }, [phase]);

  const myProgress = Math.min(100, Math.round((myCode.split('\n').length / 8) * 100));

  const handleSubmit = useCallback(() => {
    setMySubmitted(true);
    setWinner(opponentSubmitted ? 'opponent' : 'me');
    setTimeout(() => setPhase('finished'), 1000);
  }, [opponentSubmitted]);

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #030712 0%, #060e1e 100%)', color: '#f8fafc', overflow: 'hidden' }}>

      {/* ── Header ── */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: 56, flexShrink: 0, background: 'rgba(6,14,30,0.9)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link href="/multiplayer" style={{ color: '#475569', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <ArrowLeft size={18} />
          </Link>
          <div style={{ width: 1, height: 20, background: 'rgba(148,163,184,0.15)' }} />
          <Swords size={16} color="#f87171" />
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 14 }}>
            Battle Mode —{' '}
            <span style={{ color: '#f87171', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em' }}>{roomCode}</span>
          </span>
        </div>
        {phase === 'active' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 99, border: '1px solid rgba(148,163,184,0.2)', background: 'rgba(255,255,255,0.04)' }}>
            <Clock size={14} color="#94a3b8" />
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 14, color: '#e2e8f0' }}>{formatTime(timerSec)}</span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569' }}>
          <Brain size={14} color="#60a5fa" />
          Neural<span style={{ color: '#60a5fa', fontWeight: 700 }}>DSA</span>
        </div>
      </header>

      {/* ── Content ── */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0, padding: 16, gap: 12 }}>
        <AnimatePresence mode="wait">

          {/* WAITING */}
          {phase === 'waiting' && (
            <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
              <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Swords size={36} color="#f43f5e" />
              </div>
              <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 24, fontWeight: 800 }}>Waiting for opponent…</h2>
              <div style={{ display: 'flex', gap: 6 }}>
                {[0, 1, 2].map((i) => (
                  <motion.div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }}
                    animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
                ))}
              </div>
              <div style={{ padding: '10px 18px', borderRadius: 12, border: '1px solid rgba(59,130,246,0.3)', background: 'rgba(59,130,246,0.08)', color: '#93c5fd', fontSize: 13, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', fontWeight: 700 }}>
                {roomCode}
              </div>
              <p style={{ color: '#475569', fontSize: 13 }}>Share this code with your partner</p>
            </motion.div>
          )}

          {/* ACTIVE */}
          {phase === 'active' && (
            <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>

              {/* Problem card */}
              <div style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 14, padding: '14px 18px', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>{BATTLE_PROBLEM.title}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#10b981', letterSpacing: '0.06em', padding: '2px 8px', background: 'rgba(16,185,129,0.12)', borderRadius: 99, border: '1px solid rgba(16,185,129,0.3)' }}>Easy</span>
                </div>
                <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8 }}>{BATTLE_PROBLEM.description}</p>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#64748b', background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: 8 }}>{BATTLE_PROBLEM.example}</div>
              </div>

              {/* Progress bars */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, flexShrink: 0 }}>
                {/* You */}
                <div style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 12, padding: '12px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#60a5fa' }}>You</span>
                    </div>
                    {mySubmitted && <CheckCircle2 size={15} color="#10b981" />}
                  </div>
                  <div style={{ height: 8, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: 6 }}>
                    <motion.div animate={{ width: `${myProgress}%` }} transition={{ duration: 0.5 }}
                      style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, #3b82f6, #6366f1)' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#475569' }}>
                    <Activity size={11} /> {myProgress}% progress
                  </div>
                </div>
                {/* Opponent */}
                <div style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 12, padding: '12px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                        style={{ width: 8, height: 8, borderRadius: '50%', background: '#f43f5e' }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#f87171' }}>Opponent</span>
                    </div>
                    {opponentSubmitted && <CheckCircle2 size={15} color="#10b981" />}
                  </div>
                  <div style={{ height: 8, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: 6 }}>
                    <motion.div animate={{ width: `${opponentActivity}%` }} transition={{ duration: 0.5 }}
                      style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, #f43f5e, #f97316)' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#475569' }}>
                    <Activity size={11} /> {Math.round(opponentActivity)}% activity
                  </div>
                </div>
              </div>

              {/* Editors row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, flex: 1, minHeight: 0 }}>
                {/* My editor */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#60a5fa', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6' }} /> Your Editor
                    </span>
                    <span style={{ fontSize: 11, color: '#334155', fontFamily: 'JetBrains Mono, monospace' }}>Python</span>
                  </div>
                  <div style={{ flex: 1, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(59,130,246,0.2)', minHeight: 0 }}>
                    <MonacoEditor height="100%" language="python" value={myCode} onChange={(v) => setMyCode(v ?? '')} theme="vs-dark"
                      options={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", minimap: { enabled: false }, padding: { top: 10 }, scrollBeyondLastLine: false, lineNumbers: 'on' }} />
                  </div>
                  <button onClick={handleSubmit} disabled={mySubmitted}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', borderRadius: 12, background: mySubmitted ? 'rgba(16,185,129,0.2)' : 'linear-gradient(135deg, #2563eb, #7c3aed)', color: mySubmitted ? '#34d399' : 'white', fontSize: 14, fontWeight: 700, border: `1px solid ${mySubmitted ? 'rgba(16,185,129,0.4)' : 'transparent'}`, cursor: mySubmitted ? 'default' : 'pointer', transition: 'all 0.2s', flexShrink: 0 }}>
                    {mySubmitted ? <><CheckCircle2 size={16} /> Submitted!</> : <><Send size={15} /> Submit Solution</>}
                  </button>
                </div>

                {/* Opponent editor */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#f87171', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                        style={{ width: 6, height: 6, borderRadius: '50%', background: '#f43f5e' }} />
                      Opponent&apos;s Editor — Live
                    </span>
                    <span style={{ fontSize: 11, color: '#334155', fontFamily: 'JetBrains Mono, monospace' }}>Python</span>
                  </div>
                  <div style={{ flex: 1, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(244,63,94,0.2)', minHeight: 0, opacity: 0.75 }}>
                    <MonacoEditor height="100%" language="python" value={opponentCode} theme="vs-dark"
                      options={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", minimap: { enabled: false }, padding: { top: 10 }, scrollBeyondLastLine: false, readOnly: true, lineNumbers: 'on' }} />
                  </div>
                  <div style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(148,163,184,0.08)', background: 'rgba(15,23,42,0.5)', fontSize: 12, color: '#334155', textAlign: 'center', flexShrink: 0 }}>
                    Opponent is solving independently — results shown at end
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* FINISHED */}
          {phase === 'finished' && (
            <motion.div key="finished" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 64 }}>{winner === 'me' ? '🏆' : '⚔️'}</div>
              <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 32, fontWeight: 900 }}>
                {winner === 'me' ? 'You Won!' : 'Opponent Finished First'}
              </h2>
              <p style={{ color: '#64748b' }}>Your time: <span style={{ color: '#60a5fa', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>{formatTime(timerSec)}</span></p>
              <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 16, padding: 24, maxWidth: 440, width: '100%' }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Brain size={15} color="#60a5fa" /> Agent Analysis
                </h3>
                <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.7 }}>
                  Both solutions used a linear scan. Consider Kadane&apos;s algorithm for the optimal O(n) approach with constant space — curr = max(n, curr+n) is the key insight.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <Link href="/multiplayer" style={{ padding: '12px 24px', borderRadius: 12, border: '1px solid rgba(148,163,184,0.2)', color: '#94a3b8', textDecoration: 'none', fontSize: 14, fontWeight: 600, background: 'rgba(255,255,255,0.04)' }}>
                  New Room
                </Link>
                <Link href="/session" style={{ padding: '12px 24px', borderRadius: 12, background: 'linear-gradient(135deg, #2563eb, #7c3aed)', color: 'white', textDecoration: 'none', fontSize: 14, fontWeight: 700 }}>
                  Keep Practicing
                </Link>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
