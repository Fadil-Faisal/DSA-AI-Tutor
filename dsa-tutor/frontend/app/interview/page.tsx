'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { ArrowLeft, Clock, Send, MessageSquare, Award, Brain } from 'lucide-react';
import { useLearnerStore } from '@/store/learnerStore';
import { Button } from '@/components/ui/GlobalComponents';
import { formatTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const INTERVIEW_DURATION = 45 * 60; // 45 min

const INTERVIEW_PROBLEM = {
  title: 'Longest Substring Without Repeating Characters',
  description:
    'Given a string s, find the length of the longest substring without repeating characters.',
  examples: [
    { input: 's = "abcabcbb"', output: '3', explanation: '"abc" is the longest substring' },
  ],
};

const INTERVIEWER_MESSAGES = [
  "Hello! I'll be your interviewer today. We have 45 minutes. Let's start — can you explain your initial approach before coding?",
  "Good thinking. What data structure would you use and why?",
  "What's the time complexity of your solution?",
  "Could you walk me through your code for the edge case where all characters are the same?",
];

type Phase = 'intro' | 'coding' | 'report';

interface ScoreRingProps { score: number; label: string; color: string }
function ScoreRing({ score, label, color }: ScoreRingProps) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="72" height="72" viewBox="0 0 72 72" aria-label={`${label}: ${score}`}>
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        <circle
          cx="36" cy="36" r={r} fill="none"
          stroke={color} strokeWidth="6"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          transform="rotate(-90 36 36)"
          style={{ transition: 'stroke-dasharray 1s ease-out' }}
        />
        <text x="36" y="40" textAnchor="middle" fill={color} fontSize="14" fontWeight="700">
          {score}
        </text>
      </svg>
      <span className="text-[11px] text-slate-500 text-center leading-tight max-w-[72px]">{label}</span>
    </div>
  );
}

export default function InterviewPage() {
  const { explanationMode, sessionId } = useLearnerStore();
  const [phase, setPhase] = useState<Phase>('intro');
  const [timeLeft, setTimeLeft] = useState(INTERVIEW_DURATION);
  const [code, setCode] = useState('# Write your solution\ndef lengthOfLongestSubstring(s: str) -> int:\n    pass\n');
  const [chatMessages, setChatMessages] = useState<{ role: 'agent' | 'user'; text: string }[]>([
    { role: 'agent', text: INTERVIEWER_MESSAGES[0] },
  ]);
  const [userInput, setUserInput] = useState('');
  const [msgIdx, setMsgIdx] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  // Countdown
  useEffect(() => {
    if (phase !== 'coding') return;
    const iv = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(iv); setPhase('report'); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [phase]);

  const timerPct = timeLeft / INTERVIEW_DURATION;
  const timerColor = timerPct > 0.4 ? '#10b981' : timerPct > 0.2 ? '#f59e0b' : '#f43f5e';

  const handleSendMessage = useCallback(() => {
    if (!userInput.trim()) return;
    setChatMessages((m) => [...m, { role: 'user', text: userInput }]);
    setUserInput('');
    const next = INTERVIEWER_MESSAGES[msgIdx];
    if (next) {
      setTimeout(() => {
        setChatMessages((m) => [...m, { role: 'agent', text: next }]);
        setMsgIdx((i) => i + 1);
      }, 1000);
    }
  }, [userInput, msgIdx]);

  const handleSubmit = useCallback(() => {
    setSubmitted(true);
    setTimeout(() => setPhase('report'), 1500);
  }, []);

  // Mock scores
  const scores = {
    time: 72, approach: 85, communication: 68, percentile: 76,
  };

  return (
    <div className="min-h-dvh neural-bg flex flex-col">
      {/* Nav */}
      <nav className="sticky top-0 z-40 glass border-b border-[rgba(148,163,184,0.08)] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/session" className="text-slate-500 hover:text-slate-300 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <Brain className="w-4 h-4 text-violet-400" aria-hidden />
          <span className="font-bold text-slate-100 text-sm" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Interview Simulation
          </span>
        </div>

        {phase === 'coding' && (
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border font-mono text-sm font-bold"
            style={{ borderColor: `${timerColor}40`, color: timerColor, background: `${timerColor}12` }}
            role="timer"
            aria-label={`Time remaining: ${formatTime(timeLeft)}`}
          >
            <Clock className="w-3.5 h-3.5" aria-hidden />
            {formatTime(timeLeft)}
          </div>
        )}
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <AnimatePresence mode="wait">

          {/* ── Intro ── */}
          {phase === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="max-w-lg mx-auto text-center pt-16"
            >
              <div className="w-16 h-16 rounded-2xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-violet-400" />
              </div>
              <h1 className="text-3xl font-extrabold text-slate-100 mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Mock Interview
              </h1>
              <p className="text-slate-400 mb-2">
                45 minutes · 1 problem · No hints
              </p>
              <p className="text-sm text-slate-500 mb-8">
                The agent acts as an interviewer. Answer follow-up questions while coding.
                A performance report is generated at the end.
              </p>
              <div
                className={cn(
                  'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-8 border',
                  explanationMode === 'complex'
                    ? 'border-violet-500/30 bg-violet-500/10 text-violet-300'
                    : 'border-blue-500/30 bg-blue-500/10 text-blue-300'
                )}
              >
                {explanationMode === 'complex' ? '⚡ FAANG-style interviewer' : '🎯 Encouraging interviewer'}
              </div>
              <Button size="lg" onClick={() => setPhase('coding')} icon={<Clock className="w-5 h-5" />}>
                Start Interview
              </Button>
            </motion.div>
          )}

          {/* ── Coding ── */}
          {phase === 'coding' && (
            <motion.div
              key="coding"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100dvh-120px)]"
            >
              {/* Left: Problem + Chat */}
              <div className="flex flex-col gap-4 overflow-hidden">
                <div className="glass-card p-4 shrink-0">
                  <h2 className="text-sm font-bold text-slate-100 mb-2">{INTERVIEW_PROBLEM.title}</h2>
                  <p className="text-xs text-slate-400 leading-relaxed">{INTERVIEW_PROBLEM.description}</p>
                  {INTERVIEW_PROBLEM.examples.map((ex, i) => (
                    <div key={i} className="mt-2 text-xs font-mono bg-[rgba(15,23,42,0.6)] rounded-lg px-3 py-2 text-slate-300">
                      Input: {ex.input} → Output: {ex.output}
                    </div>
                  ))}
                </div>

                {/* Chat */}
                <div className="glass-card flex flex-col flex-1 overflow-hidden p-0">
                  <div className="px-4 py-3 border-b border-[rgba(148,163,184,0.08)] flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-violet-400" />
                    <span className="text-xs font-semibold text-slate-400">Interviewer</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {chatMessages.map((m, i) => (
                      <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                        <div
                          className={cn(
                            'max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed',
                            m.role === 'agent'
                              ? 'bg-violet-500/10 border border-violet-500/20 text-slate-300'
                              : 'bg-blue-600/20 border border-blue-500/20 text-blue-200'
                          )}
                        >
                          {m.text}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-3 border-t border-[rgba(148,163,184,0.08)] flex gap-2">
                    <input
                      className="flex-1 bg-[rgba(15,23,42,0.7)] border border-[rgba(148,163,184,0.15)] rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 outline-none focus:border-blue-500/50 transition-colors"
                      placeholder="Type your response…"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button onClick={handleSendMessage} className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer">
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right: Editor */}
              <div className="flex flex-col gap-3 overflow-hidden">
                <div className="flex-1 rounded-xl border border-[rgba(148,163,184,0.1)] overflow-hidden">
                  <MonacoEditor
                    height="100%"
                    language="python"
                    value={code}
                    onChange={(v) => setCode(v ?? '')}
                    theme="vs-dark"
                    options={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", minimap: { enabled: false }, padding: { top: 12 }, scrollBeyondLastLine: false }}
                  />
                </div>
                <Button variant={submitted ? 'success' : 'primary'} size="lg" onClick={handleSubmit} loading={submitted} className="w-full">
                  {submitted ? 'Submitting…' : 'Submit Final Solution'}
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── Report ── */}
          {phase === 'report' && (
            <motion.div
              key="report"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto pt-8"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-extrabold text-slate-100 mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Interview Complete
                </h2>
                <p className="text-slate-400 text-sm">Here is your performance breakdown</p>
              </div>

              <div className="glass-card p-6 mb-6">
                <div className="flex justify-around flex-wrap gap-6">
                  <ScoreRing score={scores.time} label="Time Management" color="#3b82f6" />
                  <ScoreRing score={scores.approach} label="Approach Quality" color="#10b981" />
                  <ScoreRing score={scores.communication} label="Communication" color="#8b5cf6" />
                  <ScoreRing score={scores.percentile} label="Percentile Rank" color="#f59e0b" />
                </div>
              </div>

              <div className="glass-card p-5 mb-4">
                <h3 className="text-sm font-bold text-slate-200 mb-3">Agent Feedback</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Good approach using the sliding window technique. Your communication was clear when explaining
                  the initial idea. Focus on articulating time/space complexity before coding — interviewers want
                  to see structured thinking before implementation.
                </p>
              </div>

              <div className="flex gap-3">
                <Link href="/session" className="flex-1">
                  <Button variant="primary" size="lg" className="w-full">Continue Practicing</Button>
                </Link>
                <Link href="/dashboard" className="flex-1">
                  <Button variant="secondary" size="lg" className="w-full">View Dashboard</Button>
                </Link>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
