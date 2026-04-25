'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface Question {
  id: number;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  hintEliminate: number;
  hintClue: string;
  hintRecall: string;
}

const questions: Question[] = [
  {
    id: 1,
    question: 'Which data structure follows FIFO order?',
    options: ['Stack', 'Queue', 'Tree', 'Array'],
    answer: 1,
    explanation: 'Queue uses First In First Out - like a line at a store.',
    hintEliminate: 0,
    hintClue: 'Think about waiting in line for something.',
    hintRecall: 'We covered this in Level 1 video!',
  },
  {
    id: 2,
    question: 'What is the worst case time complexity of binary search?',
    options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
    answer: 1,
    explanation: 'Binary search halves the search space each step = log n.',
    hintEliminate: 2,
    hintClue: 'It cuts the problem in half each time.',
    hintRecall: 'Remember our time complexity discussions?',
  },
  {
    id: 3,
    question: 'Which traversal visits root node first?',
    options: ['Inorder', 'Postorder', 'Preorder', 'Level order'],
    answer: 2,
    explanation: 'Preorder visits: Root → Left → Right.',
    hintEliminate: 0,
    hintClue: '"Pre" means before...',
    hintRecall: 'Tree traversals were in Level 1!',
  },
  {
    id: 4,
    question: 'What is the maximum number of nodes at level k in a binary tree?',
    options: ['2k', '2^k', 'k²', 'k+1'],
    answer: 1,
    explanation: 'Each level doubles: 1, 2, 4, 8... = 2^k',
    hintEliminate: 3,
    hintClue: 'Level 0 has 1 node, level 1 has 2...',
    hintRecall: 'Related to binary tree structure!',
  },
  {
    id: 5,
    question: 'Which algorithm is used to find shortest path in a graph?',
    options: ['DFS', 'BFS', 'Binary Search', 'Merge Sort'],
    answer: 1,
    explanation: 'BFS finds shortest path in unweighted graphs.',
    hintEliminate: 2,
    hintClue: 'It explores layer by layer.',
    hintRecall: 'Graph algorithms in the video!',
  },
];

export default function QuizChallengePage() {
  const router = useRouter();
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [hintsUsed, setHintsUsed] = useState<number[]>([]);
  const [revealedWrong, setRevealedWrong] = useState<number | null>(null);
  const [showHintAnswer, setShowHintAnswer] = useState(false);
  const [hintAnswer, setHintAnswer] = useState('');
  const [hint3Used, setHint3Used] = useState(false);
  const [eliminated, setEliminated] = useState<number[]>([]);
  const [showClue, setShowClue] = useState(false);
  const [startTime] = useState(Date.now());
  const [showCompletion, setShowCompletion] = useState(false);

  const question = questions[currentQ];

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(index);
    setRevealedWrong(index);

    let xpGained = 0;
    const hintsForThisQ = hintsUsed.filter((h) => h === currentQ).length;

    if (index === question.answer) {
      if (hintsForThisQ === 0) xpGained = 20;
      else if (hintsForThisQ === 1) xpGained = 10;
      else xpGained = 5;
      setScore((s) => s + 1);
    }

    setXpEarned((xp) => xp + xpGained);
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelectedAnswer(null);
      setRevealedWrong(null);
      setEliminated([]);
      setShowClue(false);
    } else {
      setShowCompletion(true);
    }
  };

  const handleHint = (hintNum: number) => {
    const hintsForThisQ = hintsUsed.filter((h) => h === currentQ).length;

    if (hintNum === 1) {
      setEliminated([...eliminated, question.hintEliminate]);
      setHintsUsed([...hintsUsed, currentQ]);
    } else if (hintNum === 2) {
      setShowClue(true);
      setHintsUsed([...hintsUsed, currentQ]);
    } else if (hintNum === 3 && !hint3Used) {
      setShowHintAnswer(true);
    }
  };

  const handleHintSubmit = () => {
    setShowHintAnswer(false);
    setHint3Used(true);
    setHintsUsed([...hintsUsed, currentQ]);
    setSelectedAnswer(question.answer);
    setRevealedWrong(null);
    setXpEarned((xp) => xp + 5);
  };

  const handleNextLevel = () => {
    router.push('/roadmap');
  };

  const timeTaken = Math.floor((Date.now() - startTime) / 1000);
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  const accuracy = Math.round((score / questions.length) * 100);

  if (showCompletion) {
    return (
      <div className="min-h-screen w-full bg-[#0a0a1a] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <Starfield />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="text-6xl mb-4"
          >
            ⚡
          </motion.div>
          
          <h1 className="text-3xl font-bold text-white mb-8">Quiz Complete!</h1>

          <div className="flex gap-4 justify-center mb-8">
            <StatCard label="Score" value={`${score}/${questions.length}`} icon="🏆" delay={0} />
            <StatCard label="XP" value={`+${xpEarned}`} icon="⭐" delay={1} />
            <StatCard label="Accuracy" value={`${accuracy}%`} icon="🎯" delay={2} />
            <StatCard label="Time" value={formatTime(timeTaken)} icon="⏱️" delay={3} />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <p className="text-lg font-medium text-amber-400">
              {score === 5
                ? "Perfect score. You're built different 🏆"
                : score >= 3
                ? "Solid performance. Keep pushing 💪"
                : "Every mistake is a lesson. Come back stronger 🔄"}
            </p>
          </motion.div>

          <motion.button
            onClick={handleNextLevel}
            className="px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-600 text-black text-xl font-bold rounded-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Next Level →
          </motion.button>
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
        <h1 className="text-xl font-bold text-amber-400">Level 3 — Quiz Challenge</h1>
        <div className="flex items-center gap-2">
          <span className="text-zinc-400 text-sm">XP</span>
          <div className="w-20 h-2 bg-zinc-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber-500 rounded-full" 
              style={{ width: `${Math.min(100, xpEarned)}%` }}
            />
          </div>
        </div>
      </header>

      <div className="relative z-10 text-center py-2">
        <span className="text-zinc-400">Question {currentQ + 1} of {questions.length}</span>
      </div>

      <div className="relative z-10 w-full max-w-lg mx-auto px-4">
        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 to-yellow-500"
            initial={{ width: 0 }}
            animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-lg bg-[#0f1535] rounded-2xl border border-teal-500/50 p-6 shadow-[0_0_30px_rgba(20,184,166,0.2)]"
          >
            <h2 className="text-xl text-white font-medium mb-6">
              {question.question}
            </h2>

            <div className="flex flex-col gap-3 mb-4">
              {question.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === question.answer;
                const isEliminated = eliminated.includes(index);
                
                let bgClass = 'bg-zinc-800 border-zinc-700';
                let borderClass = 'border-2';
                
                if (selectedAnswer !== null) {
                  if (isCorrect) {
                    bgClass = 'bg-green-600/30 border-green-500';
                  } else if (isSelected) {
                    bgClass = 'bg-red-600/30 border-red-500';
                  }
                } else if (isSelected) {
                  bgClass = 'bg-amber-600/30 border-amber-500';
                }

                if (isEliminated) {
                  bgClass = 'bg-zinc-900/50 border-zinc-800 opacity-50';
                }

                return (
                  <motion.button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={selectedAnswer !== null || isEliminated}
                    className={`p-4 rounded-xl ${borderClass} text-left text-white font-medium ${bgClass}`}
                    whileHover={
                      !selectedAnswer && !isEliminated
                        ? { scale: 1.02 }
                        : {}
                    }
                    whileTap={
                      !selectedAnswer && !isEliminated
                        ? { scale: 0.98 }
                        : {}
                    }
                  >
                    {option}
                  </motion.button>
                );
              })}
            </div>

            {selectedAnswer !== null && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-zinc-400 text-sm mb-4"
              >
                {question.explanation}
              </motion.p>
            )}

            {selectedAnswer === null && (
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => handleHint(1)}
                  disabled={eliminated.length > 0}
                  className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-lg text-sm disabled:opacity-50"
                >
                  Hint 1
                </button>
                <button
                  onClick={() => handleHint(2)}
                  disabled={showClue}
                  className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-lg text-sm disabled:opacity-50"
                >
                  Hint 2
                </button>
                <button
                  onClick={() => handleHint(3)}
                  className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-lg text-sm"
                >
                  Hint 3
                </button>
              </div>
            )}

            {showClue && selectedAnswer === null && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-cyan-400 text-sm mb-4"
              >
                💡 {question.hintClue}
              </motion.p>
            )}

            {selectedAnswer !== null && (
              <motion.button
                onClick={handleNext}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold rounded-xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {currentQ < questions.length - 1 ? 'Next Question →' : 'See Results →'}
              </motion.button>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

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
                {question.hintRecall}
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
      className="bg-zinc-800/80 rounded-xl p-4 min-w-[80px]"
    >
      <div className="text-2xl mb-1">{icon}</div>
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