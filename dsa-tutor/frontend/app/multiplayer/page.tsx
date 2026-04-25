'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Users, Swords, GraduationCap, Hash, Copy, CheckCircle, Brain, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { RoomMode } from '@/types/room';

const MODES: { id: RoomMode; icon: React.ReactNode; label: string; desc: string; color: string; tag: string }[] = [
  { id: 'collaborative', icon: <Users size={28} />, label: 'Collaborative', tag: 'Co-op', desc: 'Shared editor, two cursors. Agent coaches both players in real-time.', color: '#3b82f6' },
  { id: 'battle', icon: <Swords size={28} />, label: 'Battle', tag: 'Competitive', desc: 'Independent editors. Race to solve. Agent compares both solutions.', color: '#f43f5e' },
  { id: 'mentor', icon: <GraduationCap size={28} />, label: 'Mentor', tag: 'Learning', desc: 'Mentor sees hints only. Learner codes. Agent coaches privately.', color: '#10b981' },
];

function generateCode() {
  return Array.from({ length: 6 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');
}

export default function MultiplayerLobbyPage() {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState<RoomMode>('battle');
  const [roomCode, setRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [creating, setCreating] = useState(false);

  const handleCreate = useCallback(async () => {
    setCreating(true);
    const code = generateCode();
    setRoomCode(code);
    setTimeout(() => router.push(`/multiplayer/${code}`), 1400);
  }, [router]);

  const handleJoin = useCallback(() => {
    if (joinCode.trim().length < 4) return;
    router.push(`/multiplayer/${joinCode.trim().toUpperCase()}`);
  }, [joinCode, router]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [roomCode]);

  return (
    <div style={{ minHeight: '100dvh', background: 'linear-gradient(135deg, #030712 0%, #060e1e 100%)', color: '#f8fafc' }}>

      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 28px', borderBottom: '1px solid rgba(148,163,184,0.08)', background: 'rgba(6,14,30,0.8)', backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 40 }}>
        <Link href="/session" style={{ color: '#475569', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <ArrowLeft size={18} />
        </Link>
        <div style={{ width: 1, height: 20, background: 'rgba(148,163,184,0.15)' }} />
        <Brain size={17} color="#60a5fa" />
        <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 15 }}>
          Neural<span style={{ color: '#60a5fa' }}>DSA</span>
          <span style={{ color: '#475569', fontWeight: 400, marginLeft: 8 }}>Multiplayer</span>
        </span>
      </nav>

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '56px 24px' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 40, fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 12 }}>
            Multiplayer Rooms
          </h1>
          <p style={{ color: '#64748b', fontSize: 16, lineHeight: 1.6 }}>
            Challenge a friend, collaborate, or mentor each other — the AI adapts to every mode.
          </p>
        </motion.div>

        {/* Mode Selector */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 40 }}>
          {MODES.map(({ id, icon, label, desc, color, tag }) => {
            const active = selectedMode === id;
            return (
              <motion.button key={id} onClick={() => setSelectedMode(id)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                style={{
                  textAlign: 'left', padding: 22, borderRadius: 18, cursor: 'pointer',
                  border: `2px solid ${active ? color : 'rgba(148,163,184,0.12)'}`,
                  background: active ? `${color}12` : 'rgba(15,23,42,0.7)',
                  boxShadow: active ? `0 0 28px ${color}22` : 'none',
                  transition: 'all 0.22s',
                }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                  <span style={{ color }}>{icon}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', padding: '3px 9px', borderRadius: 99, background: `${color}20`, color }}>{tag}</span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>{label}</div>
                <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>{desc}</div>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Card: Create / Join */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
          style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
            {(['create', 'join'] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                style={{
                  flex: 1, padding: '18px 0', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  background: 'transparent', border: 'none', color: tab === t ? '#60a5fa' : '#475569',
                  borderBottom: `2px solid ${tab === t ? '#3b82f6' : 'transparent'}`, transition: 'all 0.2s',
                }}>
                {t === 'create' ? '＋ Create Room' : '→ Join Room'}
              </button>
            ))}
          </div>

          <div style={{ padding: 36 }}>
            <AnimatePresence mode="wait">

              {/* CREATE */}
              {tab === 'create' && (
                <motion.div key="create" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.18 }}
                  style={{ textAlign: 'center' }}>
                  {!roomCode ? (
                    <>
                      <p style={{ color: '#64748b', fontSize: 14, marginBottom: 28 }}>
                        A 6-character room code will be generated. Share it with your partner to join.
                      </p>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 12, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', color: '#93c5fd', fontSize: 13, fontWeight: 600, marginBottom: 28 }}>
                        {MODES.find(m => m.id === selectedMode)?.icon}
                        {MODES.find(m => m.id === selectedMode)?.label} Mode
                      </div>
                      <br />
                      <button onClick={handleCreate} disabled={creating}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 32px', borderRadius: 14, background: 'linear-gradient(135deg, #2563eb, #7c3aed)', color: 'white', fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 0 32px rgba(59,130,246,0.3)' }}>
                        <Users size={18} />
                        {creating ? 'Creating…' : 'Create Room'}
                        <ChevronRight size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <p style={{ color: '#64748b', fontSize: 13, marginBottom: 20 }}>Share this code with your partner</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 28px', borderRadius: 16, border: '2px solid rgba(59,130,246,0.4)', background: 'rgba(59,130,246,0.08)' }}>
                          <Hash size={20} color="#60a5fa" />
                          <span style={{ fontSize: 32, fontFamily: 'JetBrains Mono, monospace', fontWeight: 900, color: '#93c5fd', letterSpacing: '0.25em' }}>{roomCode}</span>
                        </div>
                        <button onClick={handleCopy} style={{ width: 48, height: 48, borderRadius: 12, border: '1px solid rgba(148,163,184,0.15)', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {copied ? <CheckCircle size={18} color="#10b981" /> : <Copy size={18} />}
                        </button>
                      </div>
                      <p style={{ fontSize: 12, color: '#475569' }}>Redirecting to room…</p>
                    </>
                  )}
                </motion.div>
              )}

              {/* JOIN */}
              {tab === 'join' && (
                <motion.div key="join" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.18 }}
                  style={{ textAlign: 'center' }}>
                  <p style={{ color: '#64748b', fontSize: 14, marginBottom: 28 }}>Enter the 6-character code from your partner</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 28 }}>
                    <input
                      value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                      maxLength={6} placeholder="DSAXYZ"
                      style={{ width: 200, padding: '16px 20px', borderRadius: 14, border: '2px solid rgba(148,163,184,0.2)', background: 'rgba(15,23,42,0.8)', color: '#f1f5f9', fontSize: 24, fontFamily: 'JetBrains Mono, monospace', fontWeight: 900, textAlign: 'center', letterSpacing: '0.2em', outline: 'none' }}
                    />
                    <button onClick={handleJoin} disabled={joinCode.length < 4}
                      style={{ padding: '16px 28px', borderRadius: 14, background: joinCode.length >= 4 ? 'linear-gradient(135deg, #2563eb, #7c3aed)' : 'rgba(148,163,184,0.1)', color: joinCode.length >= 4 ? 'white' : '#475569', fontSize: 15, fontWeight: 700, border: 'none', cursor: joinCode.length >= 4 ? 'pointer' : 'not-allowed' }}>
                      Join →
                    </button>
                  </div>
                  <p style={{ color: '#334155', fontSize: 13 }}>No account needed — just enter the code and play</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

      </main>
    </div>
  );
}
