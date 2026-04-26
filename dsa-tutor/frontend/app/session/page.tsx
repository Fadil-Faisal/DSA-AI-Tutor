'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Send, RotateCcw, ChevronDown, Cpu, Flame, Users } from 'lucide-react';
import { useLearnerStore } from '@/store/learnerStore';
import { ProblemPanel } from '@/components/session/ProblemPanel';
import { AgentPanel } from '@/components/session/AgentPanel';
import { OutputPanel } from '@/components/session/OutputPanel';
import { Badge } from '@/components/ui/GlobalComponents';
import { ExecutionResult, Problem, ProgrammingLanguage } from '@/types/problem';
import { ExplanationMode } from '@/types/learner';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const DEMO_PROBLEMS: Problem[] = [
  {
    id: 'python-001',
    title: 'Hello World',
    topic: 'arrays',
    difficulty: 'Easy',
    description: 'Write a Python program to print "Hello, World!" to the console.\n\nThis is your first step in Python programming!',
    examples: [{ input: '', output: 'Hello, World!', explanation: 'Using the print() function' }],
    hints: ['Use the print() function in Python', 'Put the text inside quotes: print("...")', 'The exact output should be: Hello, World!'],
    solution: 'print("Hello, World!")',
    time_complexity: 'O(1)', space_complexity: 'O(1)',
    companies: ['Google', 'Amazon', 'Meta'],
  },
  {
    id: 'python-002',
    title: 'Sum of Two Numbers',
    topic: 'arrays',
    difficulty: 'Easy',
    description: 'Write a Python function `add(a, b)` that takes two numbers and returns their sum.\n\nExample: add(3, 5) should return 8.',
    examples: [
      { input: 'a=3, b=5', output: '8', explanation: '3 + 5 = 8' },
      { input: 'a=10, b=-2', output: '8', explanation: '10 + (-2) = 8' },
    ],
    hints: ['Define a function using the `def` keyword', 'Use the + operator', 'Don\'t forget to return the result'],
    solution: 'def add(a, b):\n    return a + b',
    time_complexity: 'O(1)', space_complexity: 'O(1)',
    companies: ['Google', 'Meta'],
  },
  {
    id: 'python-003',
    title: 'FizzBuzz',
    topic: 'arrays',
    difficulty: 'Easy',
    description: 'Print numbers from 1 to 20. But for multiples of 3 print "Fizz", for multiples of 5 print "Buzz", and for multiples of both print "FizzBuzz".',
    examples: [
      { input: '', output: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz...', explanation: 'Loop 1-20 checking divisibility' },
    ],
    hints: ['Use a for loop: for i in range(1, 21)', 'Use the modulo operator % to check divisibility', 'Check for FizzBuzz (divisible by both) FIRST before Fizz or Buzz'],
    solution: 'for i in range(1, 21):\n    if i % 15 == 0:\n        print("FizzBuzz")\n    elif i % 3 == 0:\n        print("Fizz")\n    elif i % 5 == 0:\n        print("Buzz")\n    else:\n        print(i)',
    time_complexity: 'O(1)', space_complexity: 'O(1)',
    companies: ['Amazon', 'Microsoft', 'Apple'],
  },
];

const STARTER_CODE: Record<ProgrammingLanguage, string> = {
  python: '# Write your solution here\n',
  javascript: '// Write your solution here\n',
  java: '// Write your solution here\npublic class Main {\n    public static void main(String[] args) {\n        \n    }\n}',
  cpp: '// Write your solution here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}',
};

const LANGUAGES: { value: ProgrammingLanguage; label: string }[] = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JS' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
];

const MONACO_LANG: Record<ProgrammingLanguage, string> = {
  python: 'python', javascript: 'javascript', java: 'java', cpp: 'cpp',
};

// ─── Language Selector ────────────────────────────────────────────────────
function LanguageSelector({ value, onChange }: { value: ProgrammingLanguage; onChange: (l: ProgrammingLanguage) => void }) {
  const [open, setOpen] = useState(false);
  const selected = LANGUAGES.find((l) => l.value === value)!;

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 12px', borderRadius: 8,
          border: '1px solid rgba(148,163,184,0.2)',
          background: 'rgba(15,23,42,0.8)',
          color: '#cbd5e1', fontSize: 12, fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        {selected.label}
        <ChevronDown size={12} color="#64748b" style={{ transform: open ? 'rotate(180deg)' : undefined, transition: 'transform 0.2s' }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            style={{
              position: 'absolute', top: '100%', left: 0, marginTop: 4,
              background: 'rgba(10,22,40,0.98)', border: '1px solid rgba(148,163,184,0.12)',
              borderRadius: 10, overflow: 'hidden', zIndex: 50, minWidth: 100,
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}
          >
            {LANGUAGES.map((l) => (
              <button
                key={l.value}
                onClick={() => { onChange(l.value); setOpen(false); }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '8px 14px', fontSize: 12, fontWeight: 500,
                  background: value === l.value ? 'rgba(59,130,246,0.12)' : 'transparent',
                  color: value === l.value ? '#60a5fa' : '#94a3b8',
                  cursor: 'pointer', border: 'none',
                }}
              >
                {l.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Mode toggle ──────────────────────────────────────────────────────────
function ExplanationToggle() {
  const { explanationMode, setExplanationMode } = useLearnerStore();
  return (
    <button
      onClick={() => setExplanationMode(explanationMode === 'simple' ? 'complex' : 'simple')}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '5px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600,
        cursor: 'pointer',
        border: explanationMode === 'simple' ? '1px solid rgba(59,130,246,0.4)' : '1px solid rgba(139,92,246,0.4)',
        background: explanationMode === 'simple' ? 'rgba(59,130,246,0.1)' : 'rgba(139,92,246,0.1)',
        color: explanationMode === 'simple' ? '#60a5fa' : '#a78bfa',
      }}
      title="Toggle explanation mode"
    >
      <Cpu size={11} />
      {explanationMode === 'simple' ? 'Simple' : 'Complex'}
    </button>
  );
}

type MobileTab = 'problem' | 'editor' | 'agent';

// ─── Main Session Page ────────────────────────────────────────────────────
export default function SessionPage() {
  const {
    currentProblem, setCurrentProblem,
    setAgentReasoning, setAgentLoading, agentLoading,
    explanationMode, sessionId,
    currentHintLevel, incrementHintLevel,
    timerSeconds, timerStarted,
    startTimer, tickTimer, resetTimer,
    currentStreak, setDecisionType,
    hintsUsed, attemptsOnCurrentProblem,
  } = useLearnerStore();

  const [language, setLanguage] = useState<ProgrammingLanguage>('python');
  const [code, setCode] = useState(STARTER_CODE.python);
  const [results, setResults] = useState<ExecutionResult[]>([]);
  const [outputLoading, setOutputLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>('problem');
  const [problemIndex, setProblemIndex] = useState(0);
  const [agentProvider, setAgentProvider] = useState<string>('');

  useEffect(() => {
    const p = DEMO_PROBLEMS[problemIndex];
    setCurrentProblem(p);
    setAgentReasoning(`Starting with "${p.title}" — this is Problem ${problemIndex + 1} of ${DEMO_PROBLEMS.length}. I'm watching your speed, hints, and attempts to build a model of your Python skills.`);
    setDecisionType('next_problem');
  }, [problemIndex]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (timerStarted) {
      timerRef.current = setInterval(tickTimer, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerStarted, tickTimer]);

  const handleLanguageChange = useCallback((l: ProgrammingLanguage) => {
    setLanguage(l);
    setCode(STARTER_CODE[l]);
  }, []);

  const handleCodeChange = useCallback((val: string | undefined) => {
    const newCode = val ?? '';
    setCode(newCode);
    if (!timerStarted && newCode.trim() !== STARTER_CODE[language].trim()) startTimer();
  }, [timerStarted, startTimer, language]);

  // Returns true if the problem id is a local demo problem (not a UUID)
  const isLocalProblem = useCallback((id: string) => {
    return id.startsWith('python-');
  }, []);

  // Call the real AI agent and update state based on its decision
  const callAgent = useCallback(async (isCorrect: boolean, submittedCode: string) => {
    if (!currentProblem) return;
    const store = useLearnerStore.getState();
    setAgentLoading(true);
    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: currentProblem.id,
          problemTitle: currentProblem.title,
          problemTopic: currentProblem.topic,
          code: submittedCode,
          correct: isCorrect,
          timeTaken: store.timerSeconds,
          hintsUsed: store.hintsUsed,
          attemptCount: store.attemptsOnCurrentProblem,
          confidence: store.confidence,
          explanationMode: store.explanationMode,
          problemIndex,
        }),
      });
      const data = await res.json();
      if (data.reasoning) setAgentReasoning(data.reasoning);
      if (data.decisionType) setDecisionType(data.decisionType);
      if (data.providerUsed) setAgentProvider(data.providerUsed);
      if (data.confidenceUpdate) {
        const { topic, delta } = data.confidenceUpdate;
        const current = store.confidence[topic as keyof typeof store.confidence] ?? 0.5;
        store.updateConfidence(topic as any, current + delta);
      }
      if (isCorrect && typeof data.nextProblemIndex === 'number' && data.nextProblemIndex > problemIndex) {
        setTimeout(() => {
          setProblemIndex(data.nextProblemIndex);
          setResults([]);
          setFeedback('');
          setCorrect(null);
          setCode(STARTER_CODE[language]);
          resetTimer();
          setAgentLoading(false);
        }, 2200);
        return;
      }
    } catch (e) {
      console.error('Agent call failed:', e);
    }
    setAgentLoading(false);
  }, [currentProblem, problemIndex, language, resetTimer, setAgentLoading, setAgentReasoning, setDecisionType]);

  const handleRun = useCallback(async () => {
    if (!currentProblem) return;
    setOutputLoading(true);
    setFeedback('');
    setCorrect(null);
    setResults([]);

    // For demo problems, do a quick local check instead of hitting Judge0
    if (isLocalProblem(currentProblem.id)) {
      await new Promise((r) => setTimeout(r, 600));
      const lowerCode = code.toLowerCase();
      const isCorrect =
        lowerCode.includes('print') ||
        lowerCode.includes('console.log') ||
        lowerCode.includes('system.out') ||
        lowerCode.includes('cout');

      setResults(
        currentProblem.examples.map((ex, i) => ({
          testCase: i + 1,
          passed: isCorrect,
          stdout: isCorrect ? ex.output : '',
          stderr: null,
          compile_output: null,
          time: '0.01',
          status: isCorrect ? 'Accepted' : 'Wrong Answer',
        })) as any
      );
      setOutputLoading(false);
      return;
    }

    try {
      const testCases = currentProblem.examples.map((ex) => ({
        input: ex.input || '',
        expectedOutput: ex.output || '',
      }));

      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, testCases }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback(data.error || 'Execution failed');
        setResults([]);
      } else {
        setResults(data.results || []);
        if (data.summary && !data.summary.allPassed) {
          setCorrect(false);
        }
      }
    } catch {
      setFeedback('Failed to connect to execution service.');
    }

    setOutputLoading(false);
  }, [code, language, currentProblem, isLocalProblem]);

  const handleSubmit = useCallback(async () => {
    if (!currentProblem) return;
    setOutputLoading(true);
    setFeedback('');
    setCorrect(null);

    const store = useLearnerStore.getState();
    store.incrementAttempts();

    // ── Demo / local problems: evaluate without hitting the database ──────────
    if (isLocalProblem(currentProblem.id)) {
      await new Promise((r) => setTimeout(r, 700));

      const lowerCode = code.toLowerCase();
      const isCorrect =
        lowerCode.includes('print') ||
        lowerCode.includes('console.log') ||
        lowerCode.includes('system.out') ||
        lowerCode.includes('cout');

      setResults(
        currentProblem.examples.map((ex, i) => ({
          testCase: i + 1,
          passed: isCorrect,
          stdout: isCorrect ? ex.output : '',
          stderr: null,
          compile_output: null,
          time: '0.01',
          status: isCorrect ? 'Accepted' : 'Wrong Answer',
        })) as any
      );
      setCorrect(isCorrect);

      if (isCorrect) {
        setFeedback('✓ Passed! The agent is analysing your performance…');
        store.incrementStreak();
        store.addSolvedProblem({
          problemId: currentProblem.id,
          topic: currentProblem.topic as any,
          correct: true,
          timeTaken: store.timerSeconds,
          timestamp: Date.now(),
        });
      } else {
        setFeedback('Not quite. Review the hints and try again.');
        store.resetStreak();
        store.addSolvedProblem({
          problemId: currentProblem.id,
          topic: currentProblem.topic as any,
          correct: false,
          timeTaken: store.timerSeconds,
          timestamp: Date.now(),
        });
      }

      // Call the real AI agent regardless of correctness
      await callAgent(isCorrect, code);

      setOutputLoading(false);
      return;
    }

    // ── Real problems: hit the /api/run backend ────────────────────
    try {
      const res = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: store.sessionId,
          problemId: currentProblem.id,
          code,
          language,
          explanationMode: store.explanationMode,
          timeTaken: store.timerSeconds,
          attemptsCount: store.attemptsOnCurrentProblem,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback(data.error || 'Execution failed');
        setResults([]);
        setCorrect(false);
      } else {
        setResults(data.results || []);
        setCorrect(data.correct ?? false);

        if (data.feedback) {
          setFeedback(data.feedback);
        }

        if (data.correct) {
          store.incrementStreak();
          store.addSolvedProblem({
            problemId: currentProblem.id,
            topic: currentProblem.topic as any,
            correct: true,
            timeTaken: store.timerSeconds,
            timestamp: Date.now(),
          });
          setTimeout(() => {
            setAgentLoading(true);
            setTimeout(() => {
              setCurrentProblem({
                ...DEMO_PROBLEMS[0],
                id: 'arrays-002',
                title: 'Best Time to Buy & Sell Stock',
                difficulty: 'Easy',
              });
              setAgentReasoning(
                'You nailed it! Moving to sliding window — "Best Time to Buy & Sell Stock" continues the array mastery path.'
              );
              setDecisionType('next_problem');
              setAgentLoading(false);
              setFeedback('');
              setCorrect(null);
              setResults([]);
              setCode(STARTER_CODE[language]);
              resetTimer();
            }, 2000);
          }, 2000);
        } else {
          store.resetStreak();
          store.addSolvedProblem({
            problemId: currentProblem.id,
            topic: currentProblem.topic as any,
            correct: false,
            timeTaken: store.timerSeconds,
            timestamp: Date.now(),
          });
        }
      }
    } catch {
      setFeedback('Failed to connect to execution service.');
      setCorrect(false);
    }

    setOutputLoading(false);
  }, [currentProblem, code, language, isLocalProblem, callAgent, resetTimer, setAgentLoading, setAgentReasoning, setCurrentProblem, setDecisionType]);

  const handleReset = useCallback(() => {
    setCode(STARTER_CODE[language]);
    setResults([]);
    setFeedback('');
    setCorrect(null);
  }, [language]);

  const problem = currentProblem ?? DEMO_PROBLEMS[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden', background: 'var(--bg-void)' }}>

      {/* ── Header ── */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', height: 52, flexShrink: 0,
        background: 'rgba(6,14,30,0.9)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(148,163,184,0.08)',
        gap: 16,
      }}>
        {/* Logo */}
        <Link href="/main-menu" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, cursor: 'pointer' }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Cpu size={15} color="white" />
            </div>
            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 15, color: '#f8fafc' }}>
              Lhama<span style={{ color: '#60a5fa' }}>Learns</span>
            </span>
            <span style={{ fontSize: 11, color: '#334155', fontWeight: 600, marginLeft: 4 }}>
              {problemIndex + 1}/{DEMO_PROBLEMS.length}
              {agentProvider && <span style={{ color: '#1e3a5f', marginLeft: 6 }}>· via {agentProvider}</span>}
            </span>
          </div>
        </Link>

        {/* Center: problem info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, justifyContent: 'center', overflow: 'hidden' }}>
          <Badge variant={problem.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard'}>
            {problem.difficulty}
          </Badge>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {problem.title}
          </span>
          
          {/* Stats: Time | Hints | Attempts */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 10, color: '#64748b' }}>TIME</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: timerSeconds < 30 ? '#10b981' : timerSeconds < 60 ? '#f59e0b' : '#f43f5e' }}>
                {timerSeconds}s
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 10, color: '#64748b' }}>HINTS</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: hintsUsed === 0 ? '#10b981' : hintsUsed <= 2 ? '#f59e0b' : '#f43f5e' }}>
                {hintsUsed}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 10, color: '#64748b' }}>ATTEMPTS</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: attemptsOnCurrentProblem === 1 ? '#10b981' : attemptsOnCurrentProblem <= 3 ? '#f59e0b' : '#f43f5e' }}>
                {attemptsOnCurrentProblem}
              </span>
            </div>
          </div>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 99, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)' }}>
            <Flame size={13} color="#fb923c" />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#fb923c' }}>{currentStreak}</span>
          </div>
          <ExplanationToggle />
          <a href="/multiplayer" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#475569', textDecoration: 'none', padding: '4px 8px' }}>
            <Users size={12} />
            Multiplayer
          </a>
          <a href="/dashboard" style={{ fontSize: 12, color: '#475569', textDecoration: 'none', padding: '4px 8px' }}>Dashboard</a>
        </div>
      </header>

      {/* ── Three-column body ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>

        {/* ── Problem Panel (25%) ── */}
        <div style={{
          width: '25%', minWidth: 220, maxWidth: 320,
          borderRight: '1px solid rgba(148,163,184,0.08)',
          overflowY: 'auto', flexShrink: 0,
          display: mobileTab === 'problem' ? 'block' : 'none',
        }} className="!block md:!block">
          <ProblemPanel
            problem={problem}
            loading={agentLoading}
            explanationMode={explanationMode}
            sessionId={sessionId}
            currentHintLevel={currentHintLevel}
            onHintRequest={incrementHintLevel}
          />
        </div>

        {/* ── Editor Panel (flex) ── */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
          borderRight: '1px solid rgba(148,163,184,0.08)',
        }} className={mobileTab !== 'editor' ? 'hidden md:flex' : ''}>

          {/* Toolbar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 12px', borderBottom: '1px solid rgba(148,163,184,0.08)',
            background: 'rgba(6,14,30,0.5)', flexShrink: 0, gap: 8,
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Python</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={handleReset} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(148,163,184,0.15)', background: 'transparent', color: '#94a3b8', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                <RotateCcw size={12} /> Reset
              </button>
              <button onClick={handleRun} disabled={outputLoading} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(148,163,184,0.2)', background: 'rgba(148,163,184,0.08)', color: '#e2e8f0', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                <Play size={12} /> Run
              </button>
              <button onClick={handleSubmit} disabled={outputLoading} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, border: 'none', background: '#2563eb', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                <Send size={12} /> Submit
              </button>
            </div>
          </div>

          {/* Monaco */}
          <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
            <MonacoEditor
              height="100%"
              language={MONACO_LANG[language]}
              value={code}
              onChange={handleCodeChange}
              theme="vs-dark"
              options={{
                fontSize: 13,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontLigatures: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 12, bottom: 12 },
                lineNumbers: 'on',
                renderLineHighlight: 'gutter',
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                tabSize: 4,
                wordWrap: 'on',
              }}
            />
          </div>

          {/* Output */}
          <div style={{
            flexShrink: 0, borderTop: '1px solid rgba(148,163,184,0.08)',
            padding: 12, display: 'flex', flexDirection: 'column', gap: 10,
            minHeight: 250, maxHeight: '50%', overflowY: 'auto', background: 'rgba(6,14,30,0.4)',
          }}>
            <OutputPanel results={results} loading={outputLoading} feedback={feedback} correct={correct} />
          </div>
        </div>

        {/* ── Agent Panel (28%) ── */}
        <div style={{
          width: '28%', minWidth: 240, maxWidth: 360,
          overflowY: 'auto', flexShrink: 0,
        }} className={mobileTab !== 'agent' ? 'hidden md:block' : ''}>
          <AgentPanel />
        </div>
      </div>
    </div>
  );
}
