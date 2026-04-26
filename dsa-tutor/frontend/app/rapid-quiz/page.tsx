'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Zap, Timer, Play, XCircle } from 'lucide-react';
import { useLearnerStore } from '@/store/learnerStore';

const QUESTIONS = [
  { q: 'How do you print in Python?', opts: ['print()', 'echo()', 'console.log()', 'printf()'], correct: 0 },
  { q: 'Which creates a list?', opts: ['[1,2,3]', '(1,2,3)', '{1,2,3}', '<1,2,3>'], correct: 0 },
  { q: 'How to get list length?', opts: ['len()', 'size()', 'length()', 'count()'], correct: 0 },
  { q: 'Python comment starts with?', opts: ['#', '//', '/*', '--'], correct: 0 },
  { q: 'Define function keyword?', opts: ['def', 'function', 'func', 'void'], correct: 0 },
  { q: 'For loop syntax?', opts: ['for i in range()', 'for i:', 'loop i in', 'iterate i'], correct: 0 },
  { q: 'Import random module?', opts: ['import random', 'include random', 'require random', 'using random'], correct: 0 },
  { q: 'Get user input?', opts: ['input()', 'scan()', 'read()', 'get()'], correct: 0 },
  { q: 'String to integer?', opts: ['int()', 'toInteger()', 'parseInt()', 'integer()'], correct: 0 },
  { q: 'Append to list?', opts: ['list.append()', 'list.add()', 'list.push()', 'list.insert()'], correct: 0 },
  { q: 'Python file extension?', opts: ['.py', '.python', '.pyt', '.py3'], correct: 0 },
  { q: 'AND operator?', opts: ['and', '&&', '&', 'AND'], correct: 0 },
  { q: 'OR operator?', opts: ['or', '||', '|', 'OR'], correct: 0 },
  { q: 'NOT operator?', opts: ['not', '!', '!=', 'NO'], correct: 0 },
  { q: 'Create dictionary?', opts: ['{}', '[]', '()', '<>'], correct: 0 },
  { q: 'Get dict value?', opts: ['dict["key"]', 'dict.key', 'dict(key)', 'dict->key'], correct: 0 },
  { q: 'While loop syntax?', opts: ['while:', 'while ()', 'do while', 'loop'], correct: 0 },
  { q: 'Else if syntax?', opts: ['elif', 'else if', 'elseif', 'elsif'], correct: 0 },
  { q: 'True boolean?', opts: ['True', 'true', 'TRUE', 'yes'], correct: 0 },
  { q: 'False boolean?', opts: ['False', 'false', 'FALSE', 'no'], correct: 0 },
];

const TIME_LIMIT = 60;

export default function RapidQuizPage() {
  const router = useRouter();
  const { userName } = useLearnerStore();
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(QUESTIONS.map(() => null));

  useEffect(() => {
    if (!started || finished) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setFinished(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [started, finished]);

  const handleAnswer = useCallback((idx: number) => {
    if (selected !== null || finished) return;
    setSelected(idx);
    const newAnswers = [...answers];
    newAnswers[current] = idx;
    setAnswers(newAnswers);
    if (idx === QUESTIONS[current].correct) {
      setScore((s) => s + 1);
    }
    setTimeout(() => {
      setSelected(null);
      if (current < QUESTIONS.length - 1) {
        setCurrent((c) => c + 1);
      } else {
        setFinished(true);
      }
    }, 200);
  }, [selected, finished, current, answers]);

  // Landing
  if (!started) {
    return (
      <div style={{
        minHeight: '100dvh',
        background: 'linear-gradient(180deg, #030712 0%, #060e1e 50%, #030712 100%)',
        color: '#f8fafc',
        display: 'flex', flexDirection: 'column',
      }}>
        <nav style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '18px 28px',
          borderBottom: '1px solid rgba(148,163,184,0.08)',
        }}>
          <Link href="/extra" style={{ color: '#475569', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <ArrowLeft size={18} />
          </Link>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Rapid Quiz</span>
        </nav>

        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(10,22,40,0.95) 100%)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(148,163,184,0.15)',
              borderRadius: 24, padding: '40px 32px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24,
              maxWidth: 400, width: '100%',
            }}
          >
            <div style={{
              width: 64, height: 64, borderRadius: 16,
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 32px rgba(59,130,246,0.4)',
            }}>
              <Zap size={28} color="white" />
            </div>

            <div style={{ textAlign: 'center' }}>
              <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
                Rapid Quiz
              </h1>
              <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>
                20 Python questions<br />60 seconds
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setStarted(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '14px 36px', borderRadius: 14,
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                color: 'white', fontSize: 15, fontWeight: 700,
                border: 'none', cursor: 'pointer',
                boxShadow: '0 0 24px rgba(59,130,246,0.3)',
              }}
            >
              <Play size={18} /> Start
            </motion.button>
          </motion.div>
        </main>
      </div>
    );
  }

  // Results
  if (finished) {
    const percent = Math.round((score / QUESTIONS.length) * 100);
    return (
      <div style={{
        minHeight: '100dvh',
        background: 'linear-gradient(180deg, #030712 0%, #060e1e 50%, #030712 100%)',
        color: '#f8fafc',
        display: 'flex', flexDirection: 'column',
      }}>
        <nav style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '18px 28px',
          borderBottom: '1px solid rgba(148,163,184,0.08)',
        }}>
          <Link href="/extra" style={{ color: '#475569', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <ArrowLeft size={18} />
          </Link>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Results</span>
        </nav>

        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: 'linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(10,22,40,0.95) 100%)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(148,163,184,0.15)',
              borderRadius: 24, padding: '40px 32px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
              maxWidth: 380, width: '100%',
            }}
          >
            <div style={{ fontSize: 56 }}>{score >= 15 ? '🏆' : score >= 10 ? '⭐' : '💪'}</div>
            
            <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 24, fontWeight: 800 }}>
              {score >= 15 ? 'Excellent!' : score >= 10 ? 'Good Job!' : 'Keep Practicing!'}
            </h1>
            
            <div style={{ fontSize: 36, fontWeight: 800, color: '#60a5fa' }}>
              {score} / {QUESTIONS.length}
            </div>
            <div style={{ color: '#64748b', fontSize: 13 }}>{percent}% correct</div>

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <Link href="/extra" style={{
                padding: '12px 24px', borderRadius: 12,
                border: '1px solid rgba(148,163,184,0.2)', color: '#94a3b8',
                textDecoration: 'none', fontSize: 14, fontWeight: 600,
              }}>
                Back
              </Link>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { setStarted(false); setScore(0); setCurrent(0); setFinished(false); setAnswers(QUESTIONS.map(() => null)); }}
                style={{
                  padding: '12px 24px', borderRadius: 12,
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  color: 'white', fontSize: 14, fontWeight: 700,
                  border: 'none', cursor: 'pointer',
                }}>
                Try Again
              </motion.button>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  // Quiz
  const q = QUESTIONS[current];
  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(180deg, #030712 0%, #060e1e 50%, #030712 100%)',
      color: '#f8fafc',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Timer Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 24px',
      }}>
        <div style={{ fontSize: 13, color: '#64748b' }}>Q {current + 1} / {QUESTIONS.length}</div>
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: 6, 
          padding: '6px 12px', borderRadius: 99,
          background: timeLeft <= 10 ? 'rgba(244,63,94,0.15)' : 'rgba(59,130,246,0.15)',
          color: timeLeft <= 10 ? '#f43f5e' : '#60a5fa',
          fontSize: 13, fontWeight: 700,
        }}>
          <Timer size={14} />
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
      </div>

      {/* Question Card */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, paddingTop: 0 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(10,22,40,0.95) 100%)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(148,163,184,0.15)',
            borderRadius: 24, padding: '32px 24px',
            display: 'flex', flexDirection: 'column', gap: 24,
            maxWidth: 420, width: '100%',
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 700, textAlign: 'center' }}>{q.q}</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {q.opts.map((opt, i) => {
              const isSelected = selected === i;
              const isCorrect = i === q.correct;
              let bg = 'rgba(255,255,255,0.04)';
              let border = 'rgba(148,163,184,0.15)';
              if (selected !== null) {
                if (isCorrect) {
                  bg = 'rgba(16,185,129,0.15)';
                  border = 'rgba(16,185,129,0.4)';
                } else if (isSelected) {
                  bg = 'rgba(244,63,94,0.15)';
                  border = 'rgba(244,63,94,0.4)';
                }
              }
              return (
                <motion.button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  whileTap={{ scale: 0.98 }}
                  disabled={selected !== null}
                  style={{
                    padding: '14px 18px', borderRadius: 12,
                    background: bg, border: `1px solid ${border}`,
                    color: '#e2e8f0', fontSize: 14, textAlign: 'left',
                    cursor: selected !== null ? 'default' : 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {opt}
                </motion.button>
              );
            })}
          </div>

          <div style={{ textAlign: 'center', fontSize: 12, color: '#64748b', marginTop: 8 }}>
            Score: {score}
          </div>
        </motion.div>
      </main>
    </div>
  );
}