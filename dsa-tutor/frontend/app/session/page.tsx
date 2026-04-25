'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Send, RotateCcw, ChevronDown, Cpu, Flame } from 'lucide-react';
import { useLearnerStore } from '@/store/learnerStore';
import { ProblemPanel } from '@/components/session/ProblemPanel';
import { AgentPanel } from '@/components/session/AgentPanel';
import { TimerBar } from '@/components/session/TimerBar';
import { OutputPanel } from '@/components/session/OutputPanel';
import { Badge } from '@/components/ui/GlobalComponents';
import { ExecutionResult, ProgrammingLanguage } from '@/types/problem';
import { Problem } from '@/types/problem';
import { ExplanationMode } from '@/types/learner';
import { cn } from '@/lib/utils';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const DEMO_PROBLEM: Problem = {
  id: 'arrays-001',
  title: 'Two Sum',
  topic: 'arrays',
  difficulty: 'Easy',
  description:
    'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.',
  examples: [
    { input: '[2,7,11,15]\n9', output: '[0,1]', explanation: 'nums[0] + nums[1] = 2 + 7 = 9' },
    { input: '[3,2,4]\n6', output: '[1,2]', explanation: 'nums[1] + nums[2] = 2 + 4 = 6' },
  ],
  hints: [
    'Think about what you need to find: two numbers that add up to target.',
    'Can you use a dictionary/hashmap to store numbers you have already seen?',
    'For each number x, check if (target - x) is already in your hashmap.',
  ],
  solution: '',
  time_complexity: 'O(n)',
  space_complexity: 'O(n)',
  companies: ['Google', 'Amazon', 'Meta', 'Apple'],
};

const STARTER_CODE: Record<ProgrammingLanguage, string> = {
  python: 'import json\n\nline1 = input().strip()\nnums = json.loads(line1)\ntarget = int(input().strip())\n\ndef twoSum(nums, target):\n    pass\n\nprint(twoSum(nums, target))',
  javascript: 'const readline = require("readline");\nconst rl = readline.createInterface({ input: process.stdin });\nconst inputs = [];\nrl.on("line", (line) => inputs.push(line));\nrl.on("close", () => {\n  const nums = JSON.parse(inputs[0]);\n  const target = parseInt(inputs[1]);\n  function twoSum(nums, target) { }\n  console.log(JSON.stringify(twoSum(nums, target)));\n});',
  java: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String line = sc.nextLine();\n        String numsStr = line.replace("[","").replace("]","").trim();\n        int[] nums = Arrays.stream(numsStr.split(",")).map(String::trim).mapToInt(Integer::parseInt).toArray();\n        int target = sc.nextInt();\n    }\n}',
  cpp: '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    string line;\n    getline(cin, line);\n    stringstream ss(line.substr(1, line.size()-2));\n    vector<int> nums;\n    string num;\n    while (getline(ss, num, \',\')) nums.push_back(stoi(num));\n    int target; cin >> target;\n    return 0;\n}',
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

// ─── Mobile Tab Nav ───────────────────────────────────────────────────────
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
  } = useLearnerStore();

  const [language, setLanguage] = useState<ProgrammingLanguage>('python');
  const [code, setCode] = useState(STARTER_CODE.python);
  const [results, setResults] = useState<ExecutionResult[]>([]);
  const [outputLoading, setOutputLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>('problem');

  useEffect(() => {
    if (!currentProblem) {
      setCurrentProblem(DEMO_PROBLEM);
      setAgentReasoning('Arrays confidence is your lowest at 50%. Starting with Two Sum to build foundational hash-map intuition before advancing to harder array problems.');
      setDecisionType('next_problem');
    }
  }, []);

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

  const handleRun = useCallback(async () => {
    if (!currentProblem) return;
    setOutputLoading(true);
    setFeedback('');
    setCorrect(null);
    setResults([]);

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
  }, [code, language, currentProblem]);

  const handleSubmit = useCallback(async () => {
    if (!currentProblem) return;
    setOutputLoading(true);
    setFeedback('');
    setCorrect(null);

    const store = useLearnerStore.getState();
    store.incrementAttempts();

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
          useLearnerStore.getState().incrementStreak();
          useLearnerStore.getState().addSolvedProblem({
            problemId: currentProblem.id,
            topic: currentProblem.topic as any,
            correct: true,
            timeTaken: store.timerSeconds,
            timestamp: Date.now(),
          });
          setTimeout(() => {
            setAgentLoading(true);
            setTimeout(() => {
              setCurrentProblem({ ...DEMO_PROBLEM, id: 'arrays-002', title: 'Best Time to Buy & Sell Stock', difficulty: 'Easy' });
              setAgentReasoning('You nailed Two Sum! Moving to sliding window — "Best Time to Buy & Sell Stock" continues the array mastery path.');
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
          useLearnerStore.getState().resetStreak();
          useLearnerStore.getState().addSolvedProblem({
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
  }, [currentProblem, code, language, resetTimer, setAgentLoading, setAgentReasoning, setCurrentProblem, setDecisionType]);

  const handleReset = useCallback(() => {
    setCode(STARTER_CODE[language]);
    setResults([]);
    setFeedback('');
    setCorrect(null);
  }, [language]);

  const problem = currentProblem ?? DEMO_PROBLEM;

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Cpu size={15} color="white" />
          </div>
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 15, color: '#f8fafc' }}>
            Neural<span style={{ color: '#60a5fa' }}>DSA</span>
          </span>
        </div>

        {/* Center: problem info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, justifyContent: 'center', overflow: 'hidden' }}>
          <Badge variant={problem.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard'}>
            {problem.difficulty}
          </Badge>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {problem.title}
          </span>
          <span style={{ fontSize: 11, color: '#475569', flexShrink: 0 }}>
            DECISION: NEXT PROBLEM
          </span>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 99, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)' }}>
            <Flame size={13} color="#fb923c" />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#fb923c' }}>{currentStreak}</span>
          </div>
          <ExplanationToggle />
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
            <LanguageSelector value={language} onChange={handleLanguageChange} />
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

          {/* Timer */}
          <div style={{ padding: '8px 12px', flexShrink: 0, borderBottom: '1px solid rgba(148,163,184,0.06)' }}>
            <TimerBar seconds={timerSeconds} running={timerStarted} />
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
            maxHeight: 220, overflowY: 'auto', background: 'rgba(6,14,30,0.4)',
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
