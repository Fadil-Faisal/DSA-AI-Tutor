'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Brain, CheckCircle2, XCircle, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { useLearnerStore } from '@/store/learnerStore';

// ── Quiz Breakpoints ──────────────────────────────────────────────────────────
// For a ~2 min video: breakpoints at 30s, 70s, 110s
interface Question {
  id: number;
  triggerAt: number; // seconds
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    triggerAt: 30,
    question: 'Who created Python?',
    options: ['James Gosling', 'Dennis Ritchie', 'Guido van Rossum', 'Bjarne Stroustrup'],
    correctIndex: 2,
    explanation: 'Python was created by Guido van Rossum and first released on February 20, 1991.',
  },
  {
    id: 2,
    triggerAt: 70,
    question: 'What type of language is Python?',
    options: ['Low-level language', 'Assembly language', 'High-level language', 'Machine language'],
    correctIndex: 2,
    explanation: 'Python is a high-level, general-purpose programming language that abstracts away most complex computer details.',
  },
  {
    id: 3,
    triggerAt: 110,
    question: 'How does Python define code blocks?',
    options: ['Using curly braces {}', 'Using semicolons ;', 'Using indentation', 'Using brackets []'],
    correctIndex: 2,
    explanation: 'Unlike many other languages, Python uniquely relies on consistent whitespace indentation to define code blocks.',
  },
];

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
}

// ── Quiz Overlay ──────────────────────────────────────────────────────────────
function QuizOverlay({
  q,
  onContinue,
}: {
  q: Question;
  onContinue: () => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;
  const isCorrect = selected === q.correctIndex;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(3,7,18,0.88)', backdropFilter: 'blur(6px)',
        padding: 16,
      }}
    >
      <motion.div
        initial={{ scale: 0.88, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        style={{
          background: 'rgba(10,22,40,0.98)',
          border: '1px solid rgba(99,102,241,0.4)',
          borderRadius: 20,
          padding: 24,
          maxWidth: 500,
          width: '100%',
          boxShadow: '0 0 48px rgba(99,102,241,0.2)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Brain size={18} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#7c3aed', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Quick Check
            </div>
            <div style={{ fontSize: 13, color: '#64748b' }}>Answer to continue watching</div>
          </div>
        </div>

        {/* Question */}
        <p style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', lineHeight: 1.5, marginBottom: 18 }}>
          {q.question}
        </p>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {q.options.map((opt, i) => {
            const isSelected = selected === i;
            const isRight = i === q.correctIndex;
            let bg = 'rgba(255,255,255,0.04)';
            let border = 'rgba(148,163,184,0.15)';
            let color = '#94a3b8';
            if (answered && isRight) { bg = 'rgba(16,185,129,0.12)'; border = 'rgba(16,185,129,0.5)'; color = '#34d399'; }
            else if (answered && isSelected && !isRight) { bg = 'rgba(244,63,94,0.1)'; border = 'rgba(244,63,94,0.4)'; color = '#f87171'; }
            else if (isSelected) { bg = 'rgba(99,102,241,0.12)'; border = 'rgba(99,102,241,0.5)'; color = '#a5b4fc'; }

            return (
              <motion.button
                key={i}
                onClick={() => !answered && setSelected(i)}
                whileHover={answered ? {} : { scale: 1.01 }}
                whileTap={answered ? {} : { scale: 0.99 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px', borderRadius: 12,
                  background: bg, border: `1.5px solid ${border}`,
                  color, fontSize: 14, fontWeight: 600,
                  cursor: answered ? 'default' : 'pointer',
                  textAlign: 'left', transition: 'all 0.15s',
                }}
              >
                <span style={{
                  width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                  background: border, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 12, fontWeight: 800,
                  color: 'white',
                }}>
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
                {answered && isRight && <CheckCircle2 size={16} style={{ marginLeft: 'auto' }} />}
                {answered && isSelected && !isRight && <XCircle size={16} style={{ marginLeft: 'auto' }} />}
              </motion.button>
            );
          })}
        </div>

        {/* Explanation + Continue */}
        <AnimatePresence>
          {answered && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{
                padding: '12px 16px', borderRadius: 12, marginBottom: 16,
                background: isCorrect ? 'rgba(16,185,129,0.08)' : 'rgba(99,102,241,0.08)',
                border: `1px solid ${isCorrect ? 'rgba(16,185,129,0.3)' : 'rgba(99,102,241,0.3)'}`,
                fontSize: 13, color: isCorrect ? '#34d399' : '#a5b4fc', lineHeight: 1.6,
              }}>
                💡 {q.explanation}
              </div>
              <motion.button
                onClick={onContinue}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  width: '100%', padding: '13px', borderRadius: 12,
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  color: 'white', fontSize: 15, fontWeight: 800,
                  border: 'none', cursor: 'pointer',
                  boxShadow: '0 0 24px rgba(99,102,241,0.3)',
                }}
              >
                Continue Watching →
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function VideoLessonPage() {
  const { setCompletedLesson1 } = useLearnerStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentQ, setCurrentQ] = useState<Question | null>(null);
  const [triggered, setTriggered] = useState<Set<number>>(new Set());
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [completed, setCompleted] = useState(false);

  // Detect breakpoints
  const handleTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    const t = v.currentTime;
    setCurrentTime(t);

    for (const q of QUESTIONS) {
      if (!triggered.has(q.id) && t >= q.triggerAt) {
        v.pause();
        setPlaying(false);
        setCurrentQ(q);
        setTriggered(prev => new Set(prev).add(q.id));
        break;
      }
    }
  }, [triggered]);

  const handleContinue = () => {
    setCurrentQ(null);
    videoRef.current?.play();
    setPlaying(true);
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v || currentQ) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const handleEnded = () => {
    setPlaying(false);
    setCompleted(true);
    setCompletedLesson1(true);
  };

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const answeredCount = triggered.size;

  return (
    <div style={{
      minHeight: '100dvh', background: '#030712', color: '#f8fafc',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', height: 56, flexShrink: 0,
        background: 'rgba(6,14,30,0.95)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(148,163,184,0.08)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/roadmap" style={{ color: '#475569', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <ArrowLeft size={18} />
          </Link>
          <div style={{ width: 1, height: 20, background: 'rgba(148,163,184,0.15)' }} />
          <span style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>
            Python Basics — Video Lesson
          </span>
        </div>
        {/* Quiz progress pills */}
        <div style={{ display: 'flex', gap: 6 }}>
          {QUESTIONS.map((q, i) => (
            <div key={q.id} style={{
              width: 28, height: 28, borderRadius: '50%',
              background: triggered.has(q.id) ? 'rgba(16,185,129,0.2)' : 'rgba(148,163,184,0.1)',
              border: `2px solid ${triggered.has(q.id) ? '#34d399' : 'rgba(148,163,184,0.2)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 800,
              color: triggered.has(q.id) ? '#34d399' : '#475569',
              transition: 'all 0.3s',
            }}>
              {triggered.has(q.id) ? '✓' : i + 1}
            </div>
          ))}
        </div>
      </nav>

      {/* Video player */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', gap: 20 }}>
        <div style={{
          position: 'relative', width: '100%', maxWidth: 800,
          borderRadius: 18, overflow: 'hidden',
          border: '1px solid rgba(148,163,184,0.12)',
          boxShadow: '0 0 48px rgba(0,0,0,0.6)',
          background: '#000',
          aspectRatio: '16/9',
        }}>
          {/* Video element */}
          <video
            ref={videoRef}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={(e) => setDuration((e.target as HTMLVideoElement).duration)}
            onEnded={handleEnded}
            style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }}
            onClick={togglePlay}
          >
            {/* Place your video file in frontend/public/videos/lesson1.mp4 */}
            <source src="/videos/lesson1.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Quiz overlay */}
          <AnimatePresence>
            {currentQ && <QuizOverlay q={currentQ} onContinue={handleContinue} />}
          </AnimatePresence>

          {/* Play overlay when paused (not during quiz) */}
          {!playing && !currentQ && !completed && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={togglePlay}
              style={{
                position: 'absolute', inset: 0, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,0.35)', cursor: 'pointer',
              }}
            >
              <motion.div
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'rgba(37,99,235,0.9)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 32px rgba(37,99,235,0.6)',
                }}
              >
                <Play size={30} color="white" fill="white" />
              </motion.div>
            </motion.div>
          )}

          {/* Breakpoint markers on progress bar area */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '0 0 2px',
            background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
          }}>
            {/* Progress bar */}
            <div 
              style={{ position: 'relative', height: 12, background: 'rgba(255,255,255,0.15)', margin: '0 0 8px', cursor: 'pointer' }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const newPct = clickX / rect.width;
                if (videoRef.current && duration > 0) {
                  videoRef.current.currentTime = newPct * duration;
                }
              }}
            >
              <div style={{ height: '100%', background: 'linear-gradient(90deg, #2563eb, #7c3aed)', width: `${progressPct}%`, transition: 'width 0.1s linear', pointerEvents: 'none' }} />
              {/* Breakpoint markers */}
              {QUESTIONS.map(q => (
                <div key={q.id} style={{
                  position: 'absolute', top: 1, left: `${(q.triggerAt / (duration || 120)) * 100}%`,
                  width: 10, height: 10, borderRadius: '50%', transform: 'translateX(-50%)',
                  background: triggered.has(q.id) ? '#34d399' : '#f59e0b',
                  border: '2px solid rgba(0,0,0,0.5)',
                  boxShadow: triggered.has(q.id) ? 'none' : '0 0 8px rgba(245,158,11,0.8)',
                  zIndex: 5, pointerEvents: 'none',
                }} title={`Question ${q.id} at ${formatTime(q.triggerAt)}`} />
              ))}
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 12px 8px' }}>
              <button onClick={togglePlay} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', display: 'flex' }}>
                {playing ? <Pause size={18} /> : <Play size={18} />}
              </button>
              <button onClick={toggleMute} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', display: 'flex' }}>
                {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontFamily: 'JetBrains Mono, monospace' }}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              <span style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
                🟡 = upcoming quiz
              </span>
            </div>
          </div>
        </div>

        {/* Completion card */}
        <AnimatePresence>
          {completed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              style={{
                maxWidth: 500, width: '100%',
                padding: 24, borderRadius: 18,
                background: 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.3)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
              <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 22, fontWeight: 900, marginBottom: 8 }}>
                Lesson Complete!
              </h2>
              <p style={{ color: '#64748b', fontSize: 14, marginBottom: 20 }}>
                You answered {answeredCount}/{QUESTIONS.length} quiz checkpoints.
              </p>
              <Link href="/roadmap" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 28px', borderRadius: 14,
                background: 'linear-gradient(135deg, #059669, #10b981)',
                color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: 15,
              }}>
                Back to Roadmap →
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
