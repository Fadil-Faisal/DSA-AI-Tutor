'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface Card {
  id: string;
  content: string;
  pairId: number;
}

interface Toast {
  id: number;
  message: string;
}

const conceptPairs: [string, string][] = [
  ['Array', 'Contiguous block of memory'],
  ['Stack', 'Last In First Out'],
  ['Queue', 'First In First Out'],
  ['Tree', 'Hierarchical node structure'],
  ['O(1)', 'Constant time complexity'],
  ['Recursion', 'Function that calls itself'],
];

export default function MemoryGamePage() {
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const [startTime] = useState(Date.now());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [hint3Unlocked, setHint3Unlocked] = useState(false);
  const [showHintAnswer, setShowHintAnswer] = useState(false);
  const [hintAnswer, setHintAnswer] = useState('');
  const [flashAll, setFlashAll] = useState(false);
  const [highlightPair, setHighlightPair] = useState<number | null>(null);
  const toastIdRef = useRef(0);

  useEffect(() => {
    const deck: Card[] = conceptPairs.flatMap(([concept, definition], idx) => [
      { id: `c-${idx}`, content: concept, pairId: idx },
      { id: `d-${idx}`, content: definition, pairId: idx },
    ]);
    const shuffled = deck.sort(() => Math.random() - 0.5).map((card, idx) => ({
      ...card,
      id: `${card.id}-${idx}`,
    }));
    setCards(shuffled);
  }, []);

  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0 && !showCompletion) {
      setTimeout(() => setShowCompletion(true), 500);
    }
  }, [matched, cards, showCompletion]);

  const showToast = (message: string) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 1500);
  };

  const handleCardClick = (index: number) => {
    if (flipped.length === 2 || matched.includes(index) || flipped.includes(index)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [first, second] = newFlipped;
      if (cards[first].pairId === cards[second].pairId) {
        setMatched([...matched, first, second]);
        setFlipped([]);
        showToast('+10 XP');
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  const handleHint = (hintNum: number) => {
    if (hintNum === 1) {
      setFlashAll(true);
      setHintsUsed((h) => h + 1);
      setTimeout(() => setFlashAll(false), 1500);
    } else if (hintNum === 2) {
      const unmatched = cards.filter((_, idx) => !matched.includes(idx));
      if (unmatched.length > 0) {
        const randomPairId = unmatched[Math.floor(Math.random() * unmatched.length)].pairId;
        const pairIndices = cards
          .map((c, idx) => c.pairId === randomPairId ? idx : -1)
          .filter((idx) => idx !== -1);
        setHighlightPair(pairIndices[0]);
        setHintsUsed((h) => h + 1);
        setTimeout(() => setHighlightPair(null), 3000);
      }
    } else if (hintNum === 3 && !hint3Unlocked) {
      setShowHintAnswer(true);
    }
  };

  const handleHintAnswer = (answer: string) => {
    setHintAnswer(answer);
    if (answer.toLowerCase() === 'stack') {
      setHint3Unlocked(true);
      setShowHintAnswer(false);
      setHintsUsed((h) => h + 1);
      const unmatched = cards.filter((_, idx) => !matched.includes(idx));
      if (unmatched.length > 0) {
        const randomPairId = unmatched[0].pairId;
        const pairIndices = cards
          .map((c, idx) => c.pairId === randomPairId ? idx : -1)
          .filter((idx) => idx !== -1);
        setMatched((prev) => [...prev, ...pairIndices]);
      }
    }
  };

  const handleNextLevel = () => {
    router.push('/level/3');
  };

  const timeTaken = Math.floor((Date.now() - startTime) / 1000);
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

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
            🎉
          </motion.div>
          
          <h1 className="text-3xl font-bold text-white mb-8">Level 2 Complete!</h1>

          <div className="flex gap-4 justify-center mb-8">
            <StatCard label="Moves" value={moves.toString()} icon="🔄" delay={0} />
            <StatCard label="Hints" value={hintsUsed.toString()} icon="💡" delay={1} />
            <StatCard label="Time" value={formatTime(timeTaken)} icon="⏱️" delay={2} />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <p className="text-zinc-300 mb-2">Memory unlocked. Your brain is now 2x faster</p>
            <p className="text-amber-400 text-lg">🧠⚡</p>
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
        <h1 className="text-xl font-bold text-amber-400">Level 2 — Memory Game</h1>
        <div className="flex items-center gap-2">
          <span className="text-zinc-400 text-sm">XP</span>
          <div className="w-20 h-2 bg-zinc-700 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 w-0 rounded-full" />
          </div>
        </div>
      </header>

      <div className="relative z-10 text-center py-2">
        <span className="text-zinc-400">Moves: {moves}</span>
      </div>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">
        <div className="grid grid-cols-4 gap-2 max-w-md">
          {cards.map((card, index) => {
            const isFlipped = flipped.includes(index) || matched.includes(index);
            const isMatched = matched.includes(index);
            const isHighlighted = highlightPair === index;

            return (
              <motion.button
                key={card.id}
                onClick={() => handleCardClick(index)}
                className="relative w-20 h-24 perspective-1000"
                style={{ transformStyle: 'preserve-3d' }}
                animate={
                  isMatched
                    ? { scale: [1, 1.05, 1] }
                    : {}
                }
                transition={{ duration: 0.3 }}
              >
                <div
                  className={`w-full h-full transition-all duration-400 ${
                    isFlipped ? 'rotate-y-180' : ''
                  }`}
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  }}
                >
                  <div
                    className={`absolute w-full h-full backface-hidden rounded-xl flex items-center justify-center text-xs text-center p-1 ${
                      isHighlighted
                        ? 'border-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]'
                        : 'border-2 border-zinc-600'
                    } ${
                      isMatched
                        ? 'bg-gradient-to-br from-amber-500/30 to-yellow-600/30 border-amber-500'
                        : flashAll || isFlipped
                        ? 'bg-gradient-to-br from-teal-600/30 to-cyan-600/30 border-teal-500'
                        : 'bg-[#0f1535] border-zinc-700'
                    }`}
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    {isFlipped || flashAll ? (
                      <span className="text-white font-medium">{card.content}</span>
                    ) : (
                      <span className="text-zinc-500 text-lg">?</span>
                    )}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </main>

      <div className="relative z-10 flex gap-2 justify-center pb-6">
        <button
          onClick={() => handleHint(1)}
          className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg text-sm hover:bg-zinc-700"
        >
          Hint 1 (Free)
        </button>
        <button
          onClick={() => handleHint(2)}
          className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg text-sm hover:bg-zinc-700"
        >
          Hint 2 (Free)
        </button>
        <button
          onClick={() => handleHint(3)}
          className={`px-4 py-2 rounded-lg text-sm ${
            hint3Unlocked
              ? 'bg-amber-600 text-white'
              : 'bg-zinc-800 text-zinc-300'
          }`}
        >
          {hint3Unlocked ? 'Hint 3 (Unlocked)' : 'Hint 3 (Locked)'}
        </button>
      </div>

      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100, y: -20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 100, y: -20 }}
            className="absolute top-20 right-6 z-30 bg-amber-500 text-black font-bold px-4 py-2 rounded-lg"
          >
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>

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
              <h3 className="text-white font-bold mb-4">
                Answer to unlock Hint 3:
              </h3>
              <p className="text-zinc-300 mb-4">
                What data structure uses LIFO order?
              </p>
              <input
                type="text"
                value={hintAnswer}
                onChange={(e) => setHintAnswer(e.target.value)}
                placeholder="Type your answer..."
                className="w-full px-4 py-2 bg-zinc-800 text-white rounded-lg mb-4"
              />
              <button
                onClick={() => handleHintAnswer(hintAnswer)}
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
      transition={{ delay: delay * 0.2 }}
      className="bg-zinc-800/80 rounded-xl p-4 min-w-[100px]"
    >
      <div className="text-2xl mb-2">{icon}</div>
      <p className="text-zinc-400 text-sm">{label}</p>
      <p className="text-xl font-bold text-white">{value}</p>
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