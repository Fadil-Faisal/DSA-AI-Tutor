'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Editor from '@monaco-editor/react';

interface TestCase {
  nums: number[];
  target: number;
  expected: number[];
}

const testCases: TestCase[] = [
  { nums: [2, 7, 11, 15], target: 9, expected: [0, 1] },
  { nums: [3, 2, 4], target: 6, expected: [1, 2] },
  { nums: [3, 3], target: 6, expected: [0, 1] },
];

const starterCode = `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  // Write your solution here
  
}`;

export default function CodingChallengePage() {
  const router = useRouter();
  const [code, setCode] = useState(starterCode);
  const [language, setLanguage] = useState('javascript');
  const [testResults, setTestResults] = useState<('pending' | 'pass' | 'fail')[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHintAnswer, setShowHintAnswer] = useState(false);
  const [hintAnswer, setHintAnswer] = useState('');
  const [hint3Unlocked, setHint3Unlocked] = useState(false);
  const [confetti, setConfetti] = useState<{ x: number; delay: number; color: string }[]>([]);
  const startTimeRef = useRef(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (showCompletion) {
      const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'];
      const newConfetti = Array.from({ length: 50 }, () => ({
        x: Math.random() * 100,
        delay: Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
      }));
      setConfetti(newConfetti);
    }
  }, [showCompletion]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  const handleRun = async () => {
    setIsRunning(true);
    setTestResults(Array(testCases.length).fill('pending'));

    for (let i = 0; i < testCases.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      let passed = false;
      try {
        const userFn = new Function('nums', 'target', code.replace(/function twoSum.*?{/, 'function twoSum(nums, target) {').split('function twoSum')[1]);
        const result = userFn(testCases[i].nums, testCases[i].target);
        
        if (Array.isArray(result)) {
          const sortedRes = [...result].sort((a, b) => a - b);
          const sortedExp = [...testCases[i].expected].sort((a, b) => a - b);
          passed = sortedRes.length === sortedExp.length && 
            sortedRes.every((v, idx) => v === sortedExp[idx]);
        }
      } catch (e) {
        passed = false;
      }
      
      setTestResults((prev) => {
        const newResults = [...prev];
        newResults[i] = passed ? 'pass' : 'fail';
        return newResults;
      });
    }

    setIsRunning(false);
  };

  const evaluateCode = () => {
    setShowCompletion(true);
  };

  const analyzeSolution = () => {
    const hasLoop = /for\s*\(|while\s*\(/.test(code);
    const hasMapOrObj = /map|Map|object|\{\}/.test(code);
    const hasReturn = /return/.test(code);

    return { hasLoop, hasMapOrObj, hasReturn };
  };

  const handleHint = (hintNum: number) => {
    if (hintNum === 1) {
      setHintsUsed((h) => h + 1);
      alert('Hint 1: Try using a loop to check every pair of numbers');
    } else if (hintNum === 2) {
      setHintsUsed((h) => h + 1);
      alert('Hint 2: Think about storing values you\'ve seen before in a data structure');
    } else if (hintNum === 3 && !hint3Unlocked) {
      setShowHintAnswer(true);
    }
  };

  const handleHintSubmit = () => {
    setShowHintAnswer(false);
    setHint3Unlocked(true);
    setHintsUsed((h) => h + 1);
    alert('Hint 3: Use a HashMap. For each num, check if (target - num) exists');
  };

  const handleBackToRoadmap = () => {
    localStorage.setItem('level_completed', '4');
    router.push('/roadmap');
  };

  const handleShare = () => {
    const text = 'I just completed Lama Learns DSA journey with 85% accuracy! 🏆';
    navigator.clipboard.writeText(text);
    alert('Result copied to clipboard!');
  };

  if (showCompletion) {
    return (
      <div className="min-h-screen w-full bg-[#0a0a1a] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {confetti.map((c, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full"
            style={{
              left: `${c.x}%`,
              backgroundColor: c.color,
            }}
            initial={{ y: -20, opacity: 1 }}
            animate={{
              y: window.innerHeight + 20,
              opacity: 0,
              rotate: 360,
            }}
            transition={{
              duration: 3 + c.delay,
              ease: 'easeIn',
              delay: c.delay,
            }}
          />
        ))}

        <Starfield />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 text-center max-w-lg"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="text-7xl mb-4 filter drop-shadow-[0_0_20px_rgba(245,158,11,0.8)]"
          >
            🏆
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-2"
          >
            🎉 You Completed Lama Learns!
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-zinc-400 mb-8"
          >
            You&apos;ve gone from zero to hero in one journey
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex gap-3 justify-center mb-8"
          >
            <StatCard label="Time" value={formatTime(elapsedTime)} icon="⏱️" delay={0} />
            <StatCard label="XP" value="+200" icon="⭐" delay={1} />
            <StatCard label="Hints" value={hintsUsed.toString()} icon="💡" delay={2} />
            <StatCard label="Accuracy" value="85%" icon="🎯" delay={3} />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-xl font-medium text-amber-400 mb-8"
          >
            You didn&apos;t just learn DSA. You leveled up your brain. 🧠🔥
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="flex gap-4 justify-center"
          >
            <button
              onClick={handleBackToRoadmap}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold rounded-full"
            >
              Back to Roadmap
            </button>
            <button
              onClick={handleShare}
              className="px-6 py-3 bg-zinc-800 text-white font-bold rounded-full border border-zinc-700"
            >
              Share Result
            </button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 0, y: -150 }}
          transition={{ duration: 2, delay: 0.5 }}
          className="absolute text-4xl font-bold text-amber-400"
        >
          +200 XP
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#0a0a1a] flex flex-col relative overflow-hidden">
      <Starfield />
      
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <button 
          onClick={() => router.push('/roadmap')}
          className="text-zinc-400 hover:text-white transition-colors"
        >
          ← Back
        </button>
        <h1 className="text-xl font-bold text-amber-400">Level 4 — Coding Challenge</h1>
        <div className="flex items-center gap-2">
          <span className="text-zinc-400 text-sm">XP</span>
          <div className="w-20 h-2 bg-zinc-700 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 w-0 rounded-full" />
          </div>
        </div>
      </header>

      <div className="relative z-10 text-center py-2">
        <span className="text-zinc-400 font-mono">{formatTime(elapsedTime)}</span>
      </div>

      <div className="relative z-10 flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="w-full lg:w-[40%] p-4 border-r border-zinc-800 overflow-y-auto">
          <div className="bg-[#0f1535] rounded-xl border-l-4 border-teal-500 p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded">Final Level 🏆</span>
              <span className="text-xs bg-green-600/30 text-green-400 px-2 py-1 rounded">Easy</span>
            </div>

            <h2 className="text-2xl font-bold text-white mb-3">Two Sum</h2>
            
            <p className="text-zinc-300 text-sm mb-4">
              Given an array of integers nums and an integer target, return indices 
              of the two numbers that add up to target. You may assume each input 
              has exactly one solution.
            </p>

            <div className="text-sm mb-4">
              <p className="text-zinc-400 mb-2">Example:</p>
              <pre className="bg-zinc-900 p-3 rounded-lg text-xs text-zinc-300">
{`Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: nums[0] + nums[1] = 9`}
              </pre>
            </div>

            <div className="text-xs text-zinc-500 mb-4">
              <p className="text-zinc-400 mb-1">Constraints:</p>
              <ul className="list-disc list-inside">
                <li>2 &lt;= nums.length &lt;= 10⁴</li>
                <li>Each input has exactly one solution</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleHint(1)}
                className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded text-xs"
              >
                Hint 1
              </button>
              <button
                onClick={() => handleHint(2)}
                className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded text-xs"
              >
                Hint 2
              </button>
              <button
                onClick={() => handleHint(3)}
                className={`px-3 py-1 rounded text-xs ${
                  hint3Unlocked ? 'bg-amber-600 text-white' : 'bg-zinc-800 text-zinc-300'
                }`}
              >
                {hint3Unlocked ? 'Hint 3' : 'Hint 3 🔒'}
              </button>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[60%] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-zinc-800">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-zinc-800 text-white text-sm px-3 py-1 rounded"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
            </select>

            <div className="flex gap-2">
              <button
                onClick={handleRun}
                disabled={isRunning}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-bold rounded transition-colors disabled:opacity-50"
              >
                {isRunning ? 'Running...' : 'Run Code'}
              </button>
              <button
                onClick={evaluateCode}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-black text-sm font-bold rounded"
              >
                Submit
              </button>
            </div>
          </div>

          <div className="flex-1">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>

          <div className="p-4 border-t border-zinc-800">
            <h3 className="text-sm font-bold text-zinc-400 mb-3">Test Cases:</h3>
            <div className="flex flex-col gap-2">
              {testCases.map((tc, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 text-sm"
                >
                  <span className="text-zinc-500">Test {i + 1}:</span>
                  <span className="text-zinc-300">
                    [{tc.nums.join(', ')}], target={tc.target}
                  </span>
                  <span className="text-zinc-500">→</span>
                  <span className="text-green-400">[{tc.expected.join(', ')}]</span>
                  
                  {testResults[i] === 'pending' && (
                    <span className="text-zinc-600">...</span>
                  )}
                  {testResults[i] === 'pass' && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-green-400"
                    >
                      ✓
                    </motion.span>
                  )}
                  {testResults[i] === 'fail' && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-red-400"
                    >
                      ✗
                    </motion.span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showHintAnswer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-black/80 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-zinc-900 p-6 rounded-xl max-w-sm w-full"
            >
              <h3 className="text-white font-bold mb-4">Unlock Hint 3</h3>
              <p className="text-zinc-300 mb-4">
                What did you learn about O(1) lookups in Level 1?
              </p>
              <input
                type="text"
                value={hintAnswer}
                onChange={(e) => setHintAnswer(e.target.value)}
                placeholder="Type your answer..."
                className="w-full px-4 py-2 bg-zinc-800 text-white rounded-lg mb-4"
              />
              <button
                onClick={handleHintSubmit}
                className="w-full py-2 bg-amber-500 text-black font-bold rounded-lg"
              >
                Submit
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ label, value, icon, delay }: { label: string; value: string; icon: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.15 }}
      className="bg-zinc-800/80 rounded-xl p-3 min-w-[80px]"
    >
      <div className="text-xl mb-1">{icon}</div>
      <p className="text-zinc-400 text-xs">{label}</p>
      <p className="text-lg font-bold text-white">{value}</p>
    </motion.div>
  );
}

function Starfield() {
  const [stars, setStars] = useState<{ x: number; y: number; size: number }[]>([]);

  useEffect(() => {
    const newStars = Array.from({ length: 40 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
    }));
    setStars(newStars);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((star, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
          }}
          animate={{
            opacity: [0.2, 0.7, 0.2],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}