'use client';

/**
 * /multiplayer/[roomCode]/page.tsx
 *
 * Single room page with three real phases backed by Supabase Realtime:
 *   lobby    — players join, host sees Start button, Realtime updates player list
 *   active   — both editors live, opponent code via Realtime broadcast
 *   finished — results screen with winner/time
 *
 * Realtime strategy:
 *   - postgres_changes on `rooms` WHERE room_code = X  → detect status changes
 *   - postgres_changes on `room_members` WHERE room_id = Y → player list updates
 *   - Broadcast channel `code:{roomCode}` → live code sharing (debounced 500ms)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Swords, Clock, CheckCircle2, Activity,
  Send, Brain, Users, Copy, Crown, Wifi, WifiOff, Loader2,
  GraduationCap, MessageSquare,
} from 'lucide-react';
import { useLearnerStore } from '@/store/learnerStore';
import { supabase } from '@/lib/supabase/browser';
import {
  getRoomByCode, startRoom, pushCodeUpdate,
  subscribeToRoomStatus, subscribeToRoomMembers,
  createCodeBroadcastChannel, RoomMemberPublic,
} from '@/lib/rooms';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

// ── Constants ────────────────────────────────────────────────────────────────

const BATTLE_PROBLEM = {
  title: 'Maximum Subarray',
  description:
    'Given an integer array nums, find the subarray with the largest sum and return its sum.',
  example: 'nums = [-2,1,-3,4,-1,2,1,-5,4]  →  Output: 6  (subarray [4,-1,2,1])',
};

const STARTER_CODE = '# Solve Maximum Subarray\ndef maxSubArray(nums):\n    pass\n';

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

type Phase = 'lobby' | 'active' | 'finished';

// ── Player Avatar ────────────────────────────────────────────────────────────

function PlayerCard({
  member,
  isMe,
  isHost,
}: {
  member: RoomMemberPublic;
  isMe: boolean;
  isHost: boolean;
}) {
  const name = member.username || member.session_id?.slice(0, 8) || 'Player';
  const initials = name.slice(0, 2).toUpperCase();
  const color = isMe ? '#3b82f6' : '#f43f5e';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        padding: '20px 28px', borderRadius: 16,
        border: `2px solid ${isMe ? 'rgba(59,130,246,0.4)' : 'rgba(244,63,94,0.3)'}`,
        background: isMe ? 'rgba(59,130,246,0.08)' : 'rgba(244,63,94,0.06)',
        minWidth: 140,
      }}
    >
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        background: `linear-gradient(135deg, ${color}, ${color}88)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, fontWeight: 800, color: 'white',
        boxShadow: `0 0 20px ${color}44`,
      }}>
        {initials}
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', marginTop: 4 }}>
          {isHost && (
            <span style={{ fontSize: 10, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 3 }}>
              <Crown size={10} /> Host
            </span>
          )}
          {isMe && (
            <span style={{ fontSize: 10, color: color, fontWeight: 600 }}>You</span>
          )}
        </div>
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '3px 10px', borderRadius: 99,
        background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
        fontSize: 10, color: '#34d399', fontWeight: 600,
      }}>
        <Wifi size={9} /> Ready
      </div>
    </motion.div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function RoomPage({
  params, 
}: {
  params: Promise<{ roomCode: string }>;
}) {
  const { roomCode } = use(params);
  const { sessionId, userName } = useLearnerStore();
  const displayName = userName || sessionId.slice(0, 8);
  const router = useRouter();

  // ── State ──
  const [phase, setPhase] = useState<Phase>('lobby');
  const [roomId, setRoomId] = useState('');
  const [members, setMembers] = useState<RoomMemberPublic[]>([]);
  const [myRole, setMyRole] = useState<'player_one' | 'player_two' | string>('player_two');
  const [loadError, setLoadError] = useState('');
  const [starting, setStarting] = useState(false);
  const [connected, setConnected] = useState(false);

  // Room-closed state (triggered when any player leaves)
  const [roomClosed, setRoomClosed] = useState(false);
  const [closedReason, setClosedReason] = useState('');

  // Battle state
  const [myCode, setMyCode] = useState(STARTER_CODE);
  const [opponentCode, setOpponentCode] = useState('# Waiting for opponent to type…\n');
  const [mySubmitted, setMySubmitted] = useState(false);
  const [opponentSubmitted, setOpponentSubmitted] = useState(false);
  const [timerSec, setTimerSec] = useState(0);
  const [winner, setWinner] = useState<'me' | 'opponent' | null>(null);

  // Room mode (battle | collaborative | mentor)
  const [roomMode, setRoomMode] = useState<string>('battle');

  // Mentor mode state
  const [mentorNote, setMentorNote] = useState('');
  const [receivedHints, setReceivedHints] = useState<string[]>([]);
  const sendHintRef = useRef<((text: string) => void) | null>(null);

  // Refs to avoid stale closures in Realtime callbacks
  const myCodeRef = useRef(myCode);
  myCodeRef.current = myCode;
  const mySubmittedRef = useRef(mySubmitted);
  mySubmittedRef.current = mySubmitted;
  const roomModeRef = useRef('battle');
  roomModeRef.current = roomMode;
  const phaseRef = useRef<Phase>('lobby');
  phaseRef.current = phase;
  const roomClosedRef = useRef(false);
  roomClosedRef.current = roomClosed;

  // Debounce timer for code broadcast
  const broadcastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const broadcastRef = useRef<((code: string) => void) | null>(null);
  const sendHintChannelRef = useRef<{ sendHint: (t: string) => void; unsub: () => void } | null>(null);

  const isHost = myRole === 'player_one';
  const myMember = members.find(
    (m) => m.session_id === sessionId || m.role === myRole
  );
  const opponentMember = members.find(
    (m) => m.session_id !== sessionId && m.role !== myRole
  );

  // ── 1. Load room on mount ──────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const room = await getRoomByCode(roomCode);
        if (cancelled) return;

        setRoomId(room.id);

        // Determine my role from the members list
        const me = (room.members ?? []).find((m) => m.session_id === sessionId);
        if (me) setMyRole(me.role ?? 'player_two');

        setMembers(room.members ?? []);
        setRoomMode(room.mode ?? 'battle');
        roomModeRef.current = room.mode ?? 'battle';

        // Jump straight to active/finished if room already started
        if (room.status === 'active') setPhase('active');
        else if (room.status === 'finished') setPhase('finished');

        setConnected(true);
      } catch (err: unknown) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Room not found');
      }
    }

    init();
    return () => { cancelled = true; };
  }, [roomCode, sessionId]);

  // ── 2. Subscribe to Realtime once roomId is known ─────────────────────────
  useEffect(() => {
    if (!roomId) return;

    // Watch room status changes (waiting → active → finished)
    // NOTE: 'finished' via Realtime always means a player left (normal submit
    // is handled locally and never updates room status to finished).
    const unsubStatus = subscribeToRoomStatus(roomCode, (status) => {
      if (status === 'active') setPhase('active');
      else if (status === 'finished') {
        setRoomClosed(true);
        setClosedReason('A player has left the room. The session has been closed.');
      }
    });

    // Watch member list changes (new players joining)
    const unsubMembers = subscribeToRoomMembers(roomId, (updatedMembers) => {
      setMembers(updatedMembers);
    });

    return () => {
      unsubStatus();
      unsubMembers();
    };
  }, [roomId, roomCode]);

  // ── 3. Code broadcast channel (only during active phase) ──────────────────
  useEffect(() => {
    if (phase !== 'active' || !roomCode) return;

    const { subscribe, broadcast, unsubscribe } = createCodeBroadcastChannel(roomCode, sessionId);

    subscribe((code) => {
      // Collaborative: shared editor → update myCode; others: update opponent view
      if (roomModeRef.current === 'collaborative') setMyCode(code);
      else setOpponentCode(code);
    });

    broadcastRef.current = broadcast;

    // Mentor hint channel
    if (roomModeRef.current === 'mentor') {
      const hintCh = supabase.channel(`hints:${roomCode}`);
      hintCh
        .on('broadcast', { event: 'hint' }, ({ payload }) => {
          setReceivedHints((h) => [...h, payload.text as string]);
        })
        .subscribe();
      const sendHint = (text: string) =>
        hintCh.send({ type: 'broadcast', event: 'hint', payload: { text } });
      sendHintChannelRef.current = { sendHint, unsub: () => supabase.removeChannel(hintCh) };
    }

    return () => {
      unsubscribe();
      broadcastRef.current = null;
      sendHintChannelRef.current?.unsub();
      sendHintChannelRef.current = null;
    };
  }, [phase, roomCode, sessionId]);

  // ── 4. Timer (active phase only) ──────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'active') return;
    const iv = setInterval(() => setTimerSec((s) => s + 1), 1000);
    return () => clearInterval(iv);
  }, [phase]);

  // ── 5. Close room when THIS player leaves (browser nav or in-app) ───────────
  const handleLeaveRoom = useCallback(async () => {
    if (phaseRef.current !== 'finished' && !roomClosedRef.current) {
      await fetch(`/api/rooms?roomCode=${roomCode}`, { method: 'DELETE' }).catch(() => {});
    }
    router.push('/multiplayer');
  }, [roomCode, router]);

  useEffect(() => {
    if (!roomCode) return;
    const onBeforeUnload = () => {
      if (phaseRef.current !== 'finished' && !roomClosedRef.current) {
        // keepalive ensures the request completes even when the page is closing
        fetch(`/api/rooms?roomCode=${roomCode}`, { method: 'DELETE', keepalive: true }).catch(() => {});
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [roomCode]);


  const handleCodeChange = useCallback((val: string | undefined) => {
    const code = val ?? '';
    setMyCode(code);

    // Persist to DB (throttled by browser — not critical path)
    if (roomId) pushCodeUpdate(roomId, sessionId, code);

    // Broadcast to opponent (debounced 500ms)
    if (broadcastRef.current) {
      if (broadcastTimerRef.current) clearTimeout(broadcastTimerRef.current);
      broadcastTimerRef.current = setTimeout(() => {
        broadcastRef.current?.(code);
      }, 500);
    }
  }, [roomId, sessionId]);

  const handleStartBattle = useCallback(async () => {
    setStarting(true);
    try {
      await startRoom(roomCode, sessionId);
      // Realtime will broadcast status change → setPhase('active')
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to start');
      setStarting(false);
    }
  }, [roomCode, sessionId]);

  const handleSubmit = useCallback(() => {
    setMySubmitted(true);
    const didWin = !opponentSubmittedRef.current;
    setWinner(didWin ? 'me' : 'opponent');
    setTimeout(() => setPhase('finished'), 1000);
  }, []);

  const opponentSubmittedRef = useRef(opponentSubmitted);
  opponentSubmittedRef.current = opponentSubmitted;

  const myProgress = Math.min(100, Math.round((myCode.split('\n').length / 8) * 100));
  const opponentProgress = Math.min(100, Math.round((opponentCode.split('\n').length / 8) * 100));

  // ── Error state ────────────────────────────────────────────────────────────
  if (loadError) {
    return (
      <div style={{
        height: '100dvh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#030712', color: '#f8fafc', gap: 16,
      }}>
        <WifiOff size={40} color="#f43f5e" />
        <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 22 }}>{loadError}</h2>
        <Link href="/multiplayer" style={{
          padding: '12px 24px', borderRadius: 12, background: '#2563eb',
          color: 'white', textDecoration: 'none', fontWeight: 600,
        }}>
          Back to Lobby
        </Link>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{
      height: '100dvh', display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(135deg, #030712 0%, #060e1e 100%)',
      color: '#f8fafc', overflow: 'hidden',
    }}>

      {/* ── Header ── */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', height: 56, flexShrink: 0,
        background: 'rgba(6,14,30,0.9)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(148,163,184,0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            onClick={handleLeaveRoom}
            style={{ color: '#475569', display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            title="Leave room"
          >
            <ArrowLeft size={18} />
          </button>
          <div style={{ width: 1, height: 20, background: 'rgba(148,163,184,0.15)' }} />
          {roomMode === 'battle'
            ? <Swords size={16} color="#f87171" />
            : roomMode === 'collaborative'
            ? <Users size={16} color="#60a5fa" />
            : <GraduationCap size={16} color="#34d399" />}
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 14 }}>
            {roomMode === 'battle' ? 'Battle' : roomMode === 'collaborative' ? 'Collaborative' : 'Mentor'}
            {' — '}
            <span style={{ color: roomMode === 'battle' ? '#f87171' : roomMode === 'collaborative' ? '#60a5fa' : '#34d399', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em' }}>
              {roomCode}
            </span>
          </span>
          {/* Connection indicator */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 11, color: connected ? '#34d399' : '#f59e0b',
          }}>
            {connected ? <Wifi size={12} /> : <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />}
            {connected ? 'Live' : 'Connecting…'}
          </div>
        </div>

        {phase === 'active' && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 99,
            border: '1px solid rgba(148,163,184,0.2)', background: 'rgba(255,255,255,0.04)',
          }}>
            <Clock size={14} color="#94a3b8" />
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 14, color: '#e2e8f0' }}>
              {formatTime(timerSec)}
            </span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569' }}>
          <Brain size={14} color="#60a5fa" />
          Neural<span style={{ color: '#60a5fa', fontWeight: 700 }}>DSA</span>
        </div>
      </header>

      {/* ── Content ── */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0, padding: 16, gap: 12, position: 'relative' }}>

        {/* ── Room Closed Overlay ── */}
        <AnimatePresence>
          {roomClosed && (
            <motion.div
              key="room-closed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                position: 'absolute', inset: 0, zIndex: 50,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: 'rgba(3,7,18,0.97)',
                gap: 20, textAlign: 'center', padding: 32,
              }}
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <WifiOff size={52} color="#f43f5e" />
              </motion.div>
              <h2 style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 28, fontWeight: 900, color: '#f1f5f9',
              }}>Room Closed</h2>
              <p style={{ color: '#64748b', fontSize: 15, maxWidth: 380 }}>{closedReason}</p>
              <motion.button
                onClick={() => router.push('/multiplayer')}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  padding: '14px 32px', borderRadius: 14,
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  color: 'white', fontSize: 15, fontWeight: 700,
                  border: 'none', cursor: 'pointer',
                  boxShadow: '0 0 24px rgba(37,99,235,0.4)',
                }}
              >
                Back to Lobby
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">

          {/* ════════════════════════════════════════════
              LOBBY PHASE
          ════════════════════════════════════════════ */}
          {phase === 'lobby' && (
            <motion.div
              key="lobby"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 32,
              }}
            >
              {/* Title */}
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
                  Waiting for players
                </h2>
                <p style={{ color: '#64748b', fontSize: 14 }}>
                  {members.length < 2
                    ? 'Share the room code — the session starts when 2 players are ready'
                    : roomMode === 'battle'
                    ? 'Both players connected! Host can start the battle.'
                    : roomMode === 'collaborative'
                    ? 'Both players connected! Host can start the collaborative session.'
                    : 'Both players connected! Host can start the mentoring session.'}
                </p>
              </div>

              {/* Room Code */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '16px 28px', borderRadius: 16,
                border: '2px solid rgba(59,130,246,0.4)',
                background: 'rgba(59,130,246,0.08)',
              }}>
                <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Room Code</span>
                <span style={{
                  fontSize: 28, fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: 900, color: '#93c5fd', letterSpacing: '0.2em',
                }}>
                  {roomCode}
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(roomCode)}
                  style={{
                    padding: 6, borderRadius: 8, border: '1px solid rgba(148,163,184,0.2)',
                    background: 'transparent', color: '#64748b', cursor: 'pointer',
                    display: 'flex', alignItems: 'center',
                  }}
                  title="Copy code"
                >
                  <Copy size={14} />
                </button>
              </div>

              {/* Player slots */}
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
                {members.map((m, i) => (
                  <PlayerCard
                    key={m.session_id ?? i}
                    member={{ ...m, username: m.username || (m.session_id === sessionId ? displayName : (m.session_id?.slice(0, 8) ?? 'Player 2')) }}
                    isMe={m.session_id === sessionId}
                    isHost={m.role === 'player_one' || m.is_host}
                  />
                ))}

                {/* Empty slot if waiting */}
                {members.length < 2 && (
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                    padding: '20px 28px', borderRadius: 16, minWidth: 140,
                    border: '2px dashed rgba(148,163,184,0.15)',
                    background: 'rgba(148,163,184,0.03)',
                  }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: '50%',
                      border: '2px dashed rgba(148,163,184,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Users size={22} color="#334155" />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 13, color: '#334155' }}>Waiting…</div>
                      <div style={{ display: 'flex', gap: 4, marginTop: 8, justifyContent: 'center' }}>
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6' }}
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Start button (host only) */}
              {isHost && (
                <div style={{ textAlign: 'center' }}>
                  {members.length >= 2 ? (
                    <motion.button
                      onClick={handleStartBattle}
                      disabled={starting}
                      whileHover={{ scale: starting ? 1 : 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 10,
                        padding: '16px 36px', borderRadius: 14,
                        background: starting ? 'rgba(244,63,94,0.4)' : 'linear-gradient(135deg, #dc2626, #f43f5e)',
                        color: 'white', fontSize: 16, fontWeight: 800, border: 'none',
                        cursor: starting ? 'not-allowed' : 'pointer',
                        boxShadow: starting ? 'none' : '0 0 32px rgba(244,63,94,0.4)',
                      }}
                    >
                      {starting
                        ? <><Loader2 size={18} style={{ animation: 'spin 0.7s linear infinite' }} /> Starting…</>
                        : roomMode === 'battle'
                        ? <><Swords size={20} /> Start Battle!</>
                        : roomMode === 'collaborative'
                        ? <><Users size={20} /> Start Session!</>
                        : <><GraduationCap size={20} /> Start Mentoring!</>
                      }
                    </motion.button>
                  ) : (
                    <div style={{ color: '#475569', fontSize: 13 }}>
                      Waiting for opponent to join before you can start…
                    </div>
                  )}
                </div>
              )}

              {/* Guest message */}
              {!isHost && (
                <div style={{
                  padding: '14px 24px', borderRadius: 12,
                  border: '1px solid rgba(148,163,184,0.15)',
                  background: 'rgba(148,163,184,0.05)',
                  color: '#64748b', fontSize: 14, textAlign: 'center',
                }}>
                  {roomMode === 'battle'
                    ? 'Waiting for the host to start the battle…'
                    : roomMode === 'collaborative'
                    ? 'Waiting for the host to start the collaborative session…'
                    : 'Waiting for the mentor to start the session…'}
                </div>
              )}
            </motion.div>
          )}

          {/* ════════════════════════════════════════════
              ACTIVE PHASE
          ════════════════════════════════════════════ */}
          {phase === 'active' && (
            <motion.div
              key="active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}
            >
              {/* Problem card */}
              <div style={{
                background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(148,163,184,0.1)',
                borderRadius: 14, padding: '14px 18px', flexShrink: 0,
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>{BATTLE_PROBLEM.title}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                    color: '#10b981', letterSpacing: '0.06em',
                    padding: '2px 8px', background: 'rgba(16,185,129,0.12)',
                    borderRadius: 99, border: '1px solid rgba(16,185,129,0.3)',
                  }}>Easy</span>
                </div>
                <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8 }}>{BATTLE_PROBLEM.description}</p>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#64748b',
                  background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: 8,
                }}>
                  {BATTLE_PROBLEM.example}
                </div>
              </div>

              {/* ── BATTLE MODE ─────────────────────────────────────────── */}
              {roomMode === 'battle' && (<>
              {/* Progress bars */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, flexShrink: 0 }}>
                {/* You */}
                <div style={{
                  background: 'rgba(15,23,42,0.7)',
                  border: '1px solid rgba(59,130,246,0.2)', borderRadius: 12, padding: '12px 16px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#60a5fa' }}>
                        {displayName} (You)
                      </span>
                    </div>
                    {mySubmitted && <CheckCircle2 size={15} color="#10b981" />}
                  </div>
                  <div style={{ height: 8, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: 6 }}>
                    <motion.div
                      animate={{ width: `${myProgress}%` }}
                      transition={{ duration: 0.5 }}
                      style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, #3b82f6, #6366f1)' }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#475569' }}>
                    <Activity size={11} /> {myProgress}% progress
                  </div>
                </div>

                {/* Opponent */}
                <div style={{
                  background: 'rgba(15,23,42,0.7)',
                  border: '1px solid rgba(244,63,94,0.2)', borderRadius: 12, padding: '12px 16px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <motion.div
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        style={{ width: 8, height: 8, borderRadius: '50%', background: '#f43f5e' }}
                      />
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#f87171' }}>
                        {opponentMember
                          ? (opponentMember.username || 'Opponent')
                          : 'Opponent'}
                      </span>
                    </div>
                    {opponentSubmitted && <CheckCircle2 size={15} color="#10b981" />}
                  </div>
                  <div style={{ height: 8, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: 6 }}>
                    <motion.div
                      animate={{ width: `${opponentProgress}%` }}
                      transition={{ duration: 0.5 }}
                      style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, #f43f5e, #f97316)' }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#475569' }}>
                    <Activity size={11} /> {opponentProgress}% activity · Live via Realtime
                  </div>
                </div>
              </div>

              {/* Editors row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, flex: 1, minHeight: 0 }}>
                {/* My editor */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#60a5fa', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6' }} />
                      Your Editor
                    </span>
                    <span style={{ fontSize: 11, color: '#334155', fontFamily: 'JetBrains Mono, monospace' }}>Python</span>
                  </div>
                  <div style={{ flex: 1, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(59,130,246,0.2)', minHeight: 0 }}>
                    <MonacoEditor
                      height="100%"
                      language="python"
                      value={myCode}
                      onChange={handleCodeChange}
                      theme="vs-dark"
                      options={{
                        fontSize: 13, fontFamily: "'JetBrains Mono', monospace",
                        minimap: { enabled: false }, padding: { top: 10 },
                        scrollBeyondLastLine: false, lineNumbers: 'on',
                      }}
                    />
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={mySubmitted}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      padding: '12px', borderRadius: 12,
                      background: mySubmitted ? 'rgba(16,185,129,0.2)' : 'linear-gradient(135deg, #2563eb, #7c3aed)',
                      color: mySubmitted ? '#34d399' : 'white',
                      fontSize: 14, fontWeight: 700, border: `1px solid ${mySubmitted ? 'rgba(16,185,129,0.4)' : 'transparent'}`,
                      cursor: mySubmitted ? 'default' : 'pointer',
                      transition: 'all 0.2s', flexShrink: 0,
                    }}
                  >
                    {mySubmitted
                      ? <><CheckCircle2 size={16} /> Submitted!</>
                      : <><Send size={15} /> Submit Solution</>
                    }
                  </button>
                </div>

                {/* Opponent editor (read-only, live) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#f87171', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <motion.div
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        style={{ width: 6, height: 6, borderRadius: '50%', background: '#f43f5e' }}
                      />
                      Opponent&apos;s Editor — Live
                    </span>
                    <span style={{ fontSize: 11, color: '#334155', fontFamily: 'JetBrains Mono, monospace' }}>Python</span>
                  </div>
                  <div style={{
                    flex: 1, borderRadius: 12, overflow: 'hidden',
                    border: '1px solid rgba(244,63,94,0.2)', minHeight: 0, opacity: 0.8,
                  }}>
                    <MonacoEditor
                      height="100%"
                      language="python"
                      value={opponentCode}
                      theme="vs-dark"
                      options={{
                        fontSize: 13, fontFamily: "'JetBrains Mono', monospace",
                        minimap: { enabled: false }, padding: { top: 10 },
                        scrollBeyondLastLine: false, readOnly: true, lineNumbers: 'on',
                      }}
                    />
                  </div>
                  <div style={{
                    padding: '12px 16px', borderRadius: 12,
                    border: '1px solid rgba(148,163,184,0.08)',
                    background: 'rgba(15,23,42,0.5)',
                    fontSize: 12, color: '#334155', textAlign: 'center', flexShrink: 0,
                  }}>
                    Live via Supabase Realtime — updates as they type
                  </div>
                </div>
              </div>
            </>)}

              {/* ── COLLABORATIVE MODE ──────────────────────────────────── */}
              {roomMode === 'collaborative' && (
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 280px', gap: 12, minHeight: 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#60a5fa', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6' }} />
                        Shared Editor — you are both coding together
                      </span>
                      <span style={{ fontSize: 11, color: '#334155', fontFamily: 'JetBrains Mono, monospace' }}>Python</span>
                    </div>
                    <div style={{ flex: 1, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(59,130,246,0.3)', minHeight: 0 }}>
                      <MonacoEditor height="100%" language="python" value={myCode} onChange={handleCodeChange} theme="vs-dark"
                        options={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", minimap: { enabled: false }, padding: { top: 10 }, scrollBeyondLastLine: false, lineNumbers: 'on' }} />
                    </div>
                    <button onClick={handleSubmit} disabled={mySubmitted} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', borderRadius: 12, background: mySubmitted ? 'rgba(16,185,129,0.2)' : 'linear-gradient(135deg, #059669, #10b981)', color: mySubmitted ? '#34d399' : 'white', fontSize: 14, fontWeight: 700, border: `1px solid ${mySubmitted ? 'rgba(16,185,129,0.4)' : 'transparent'}`, cursor: mySubmitted ? 'default' : 'pointer', flexShrink: 0 }}>
                      {mySubmitted ? <><CheckCircle2 size={16} /> Submitted!</> : <><Send size={15} /> Submit Together</>}
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
                    <div style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 14, padding: 18 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                        <Brain size={15} color="#60a5fa" />
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>AI Coach</span>
                      </div>
                      <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.7, marginBottom: 12 }}>
                        You&apos;re collaborating in real-time. Discuss your approach before coding.
                      </p>
                      {["Think about edge cases: empty array, all negatives.", "Kadane's algorithm — curr = max(n, curr+n).", 'Trace through the example together step by step.'].map((tip, i) => (
                        <div key={i} style={{ marginBottom: 8, padding: '8px 12px', borderRadius: 8, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', fontSize: 12, color: '#93c5fd', lineHeight: 1.5 }}>
                          💡 {tip}
                        </div>
                      ))}
                    </div>
                    <div style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 12, padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <Users size={13} color="#60a5fa" />
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#60a5fa' }}>Partner Status</span>
                      </div>
                      <div style={{ fontSize: 12, color: '#475569' }}>
                        {opponentMember ? (opponentMember.username || 'Partner') : 'Waiting…'} is <span style={{ color: '#34d399' }}>coding live</span>
                      </div>
                      {opponentSubmitted && <div style={{ marginTop: 8, fontSize: 12, color: '#34d399', display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle2 size={12} /> Partner submitted!</div>}
                    </div>
                  </div>
                </div>
              )}

              {/* ── MENTOR MODE ─────────────────────────────────────────── */}
              {roomMode === 'mentor' && (
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, minHeight: 0 }}>
                  {/* LEFT: editor — learner types, mentor watches */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: isHost ? '#f87171' : '#60a5fa', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {isHost
                          ? <><motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ width: 6, height: 6, borderRadius: '50%', background: '#f43f5e' }} /> Learner&apos;s Editor — Live</>
                          : <><div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6' }} /> Your Editor</>
                        }
                      </span>
                      <span style={{ fontSize: 11, color: '#334155', fontFamily: 'JetBrains Mono, monospace' }}>Python</span>
                    </div>
                    <div style={{ flex: 1, borderRadius: 12, overflow: 'hidden', border: `1px solid ${isHost ? 'rgba(244,63,94,0.2)' : 'rgba(59,130,246,0.2)'}`, minHeight: 0, opacity: isHost ? 0.85 : 1 }}>
                      <MonacoEditor height="100%" language="python"
                        value={isHost ? opponentCode : myCode}
                        onChange={isHost ? undefined : handleCodeChange}
                        theme="vs-dark"
                        options={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", minimap: { enabled: false }, padding: { top: 10 }, scrollBeyondLastLine: false, readOnly: isHost, lineNumbers: 'on' }} />
                    </div>
                    {!isHost && (
                      <button onClick={handleSubmit} disabled={mySubmitted} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', borderRadius: 12, background: mySubmitted ? 'rgba(16,185,129,0.2)' : 'linear-gradient(135deg, #2563eb, #7c3aed)', color: mySubmitted ? '#34d399' : 'white', fontSize: 14, fontWeight: 700, border: `1px solid ${mySubmitted ? 'rgba(16,185,129,0.4)' : 'transparent'}`, cursor: mySubmitted ? 'default' : 'pointer', flexShrink: 0 }}>
                        {mySubmitted ? <><CheckCircle2 size={16} /> Submitted!</> : <><Send size={15} /> Submit Solution</>}
                      </button>
                    )}
                    {isHost && <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.15)', fontSize: 12, color: '#f87171', textAlign: 'center', flexShrink: 0 }}>Mentor view — watching learner code in real-time</div>}
                  </div>

                  {/* RIGHT: hints panel */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <MessageSquare size={14} color={isHost ? '#f59e0b' : '#34d399'} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: isHost ? '#f59e0b' : '#34d399' }}>
                        {isHost ? 'Send Hints to Learner' : 'Mentor Hints'}
                      </span>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {receivedHints.length === 0
                        ? <div style={{ color: '#334155', fontSize: 13, textAlign: 'center', marginTop: 24 }}>{isHost ? 'Type a hint below to guide the learner…' : 'Waiting for mentor hints…'}</div>
                        : receivedHints.map((hint, i) => (
                          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                            style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', fontSize: 13, color: '#6ee7b7', lineHeight: 1.5 }}>
                            💡 {hint}
                          </motion.div>
                        ))
                      }
                    </div>
                    {isHost && (
                      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <textarea value={mentorNote} onChange={(e) => setMentorNote(e.target.value)}
                          placeholder="Type a hint… (e.g. 'Think about the current max subarray ending here')" rows={3}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.06)', color: '#fbbf24', fontSize: 13, resize: 'none', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                        <button onClick={() => { if (!mentorNote.trim()) return; sendHintChannelRef.current?.sendHint(mentorNote.trim()); setReceivedHints((h) => [...h, mentorNote.trim()]); setMentorNote(''); }}
                          disabled={!mentorNote.trim()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px', borderRadius: 10, background: mentorNote.trim() ? 'linear-gradient(135deg, #d97706, #f59e0b)' : 'rgba(148,163,184,0.1)', color: mentorNote.trim() ? 'white' : '#475569', fontWeight: 700, fontSize: 14, border: 'none', cursor: mentorNote.trim() ? 'pointer' : 'not-allowed' }}>
                          <Send size={14} /> Send Hint
                        </button>
                        <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 12, padding: 12 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}><Brain size={11} color="#60a5fa" /> AI Suggested Hints</div>
                          {['Consider what happens at each index', "Kadane's: track current max ending here", 'What if all numbers are negative?'].map((s, i) => (
                            <button key={i} onClick={() => { sendHintChannelRef.current?.sendHint(s); setReceivedHints((h) => [...h, s]); }}
                              style={{ display: 'block', width: '100%', textAlign: 'left', marginBottom: 6, padding: '6px 10px', borderRadius: 8, background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', color: '#93c5fd', fontSize: 11, cursor: 'pointer' }}>
                              💡 {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </motion.div>
          )}

          {/* ════════════════════════════════════════════
              FINISHED PHASE
          ════════════════════════════════════════════ */}
          {phase === 'finished' && (
            <motion.div
              key="finished"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 20, textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 64 }}>{winner === 'me' ? '🏆' : '⚔️'}</div>
              <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 32, fontWeight: 900 }}>
                {winner === 'me' ? 'You Won!' : 'Opponent Finished First'}
              </h2>
              <p style={{ color: '#64748b' }}>
                Your time:{' '}
                <span style={{ color: '#60a5fa', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
                  {formatTime(timerSec)}
                </span>
              </p>

              <div style={{
                background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(148,163,184,0.1)',
                borderRadius: 16, padding: 24, maxWidth: 440, width: '100%',
              }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Brain size={15} color="#60a5fa" /> Agent Analysis
                </h3>
                <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.7 }}>
                  Both solutions used a linear scan. Consider Kadane&apos;s algorithm for the optimal
                  O(n) approach with constant space —{' '}
                  <code style={{ color: '#93c5fd', fontFamily: 'JetBrains Mono, monospace' }}>
                    curr = max(n, curr+n)
                  </code>{' '}
                  is the key insight.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <Link href="/multiplayer" style={{
                  padding: '12px 24px', borderRadius: 12,
                  border: '1px solid rgba(148,163,184,0.2)', color: '#94a3b8',
                  textDecoration: 'none', fontSize: 14, fontWeight: 600,
                  background: 'rgba(255,255,255,0.04)',
                }}>
                  New Room
                </Link>
                <Link href="/session" style={{
                  padding: '12px 24px', borderRadius: 12,
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  color: 'white', textDecoration: 'none', fontSize: 14, fontWeight: 700,
                }}>
                  Keep Practicing
                </Link>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}