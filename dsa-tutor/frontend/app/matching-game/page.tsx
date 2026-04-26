'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Sparkles, RefreshCcw, CheckCircle2, Brain } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLearnerStore } from '@/store/learnerStore';

// Python Basics Matching Pairs
const PAIRS = [
  { id: '1', concept: 'List', match: '[1, 2, 3]' },
  { id: '2', concept: 'Dictionary', match: '{"key": "value"}' },
  { id: '3', concept: 'Tuple', match: '(1, 2, 3)' },
  { id: '4', concept: 'Set', match: '{1, 2, 3}' },
  { id: '5', concept: 'String', match: '"Hello"' },
  { id: '6', concept: 'Integer', match: '42' },
];

interface Card {
  id: string; // unique instance ID
  pairId: string;
  content: string;
  type: 'concept' | 'match';
  isFlipped: boolean;
  isMatched: boolean;
}

export default function MatchingGamePage() {
  const router = useRouter();
  const { setCompletedGame1 } = useLearnerStore();
  const [cards, setCards] = useState<Card[]>([]);
  const [matches, setMatches] = useState(0);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [justMatchedPairId, setJustMatchedPairId] = useState<string | null>(null);

  // Initialize game
  const initGame = () => {
    const newCards: Card[] = [];
    PAIRS.forEach(p => {
      newCards.push({ id: `c_${p.id}`, pairId: p.id, content: p.concept, type: 'concept', isFlipped: false, isMatched: false });
      newCards.push({ id: `m_${p.id}`, pairId: p.id, content: p.match, type: 'match', isFlipped: false, isMatched: false });
    });
    // Shuffle
    for (let i = newCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newCards[i], newCards[j]] = [newCards[j], newCards[i]];
    }
    setCards(newCards);
    setMatches(0);
    setMoves(0);
    setIsWon(false);
    setJustMatchedPairId(null);
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleCardClick = (id: string) => {
    setCards(prevCards => {
      const currentlyFlipped = prevCards.filter(c => c.isFlipped && !c.isMatched);
      
      // If 2 cards are already flipped (and waiting for timeout), ignore clicks
      if (currentlyFlipped.length >= 2) return prevCards;

      const targetCard = prevCards.find(c => c.id === id);
      // Ignore if already flipped or matched
      if (!targetCard || targetCard.isFlipped || targetCard.isMatched) return prevCards;

      // Flip the newly clicked card
      const newCards = prevCards.map(c => c.id === id ? { ...c, isFlipped: true } : c);
      
      const newFlipped = newCards.filter(c => c.isFlipped && !c.isMatched);

      if (newFlipped.length === 2) {
        // We just flipped the second card
        setTimeout(() => setMoves(m => m + 1), 0);

        if (newFlipped[0].pairId === newFlipped[1].pairId) {
          // It's a match! Mark both as matched and keep them flipped
          setTimeout(() => setMatches(m => m + 1), 0);
          setJustMatchedPairId(newFlipped[0].pairId);
          setTimeout(() => setJustMatchedPairId(null), 800);
          return newCards.map(c => 
            (c.id === newFlipped[0].id || c.id === newFlipped[1].id)
              ? { ...c, isMatched: true, isFlipped: true }
              : c
          );
        } else {
          // Not a match: flip them back down after a delay
          setTimeout(() => {
            setCards(currentCards => currentCards.map(c => 
              (c.id === newFlipped[0].id || c.id === newFlipped[1].id)
                ? { ...c, isFlipped: false }
                : c
            ));
          }, 1000);
        }
      }

      return newCards;
    });
  };

  useEffect(() => {
    // Only win when ALL pairs are matched (all 6 pairs = all 12 cards flipped green)
    if (matches === PAIRS.length && PAIRS.length > 0) {
      setTimeout(() => setIsWon(true), 600);
      setCompletedGame1(true);
    }
  }, [matches, setCompletedGame1]);

  return (
    <div style={{
      minHeight: '100dvh', background: '#030712', color: '#f8fafc',
      display: 'flex', flexDirection: 'column',
      backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(59,130,246,0.1) 0%, transparent 50%)',
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
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
            </span>
          </Link>
          <div style={{ width: 1, height: 20, background: 'rgba(148,163,184,0.15)' }} />
          <Brain size={17} color="#8b5cf6" />
          <span style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>
            Python Basics — Memory Match
          </span>
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600, display: 'flex', gap: 16 }}>
          <span>Moves: {moves}</span>
          <span style={{ color: matches === PAIRS.length ? '#34d399' : '#94a3b8' }}>
            Matches: {matches} / {PAIRS.length}
          </span>
        </div>
      </nav>

      {/* Main Game Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>

        {!isWon ? (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16,
            maxWidth: 600, width: '100%',
          }}>
            {cards.map(card => {
              const isFlipped = card.isFlipped || card.isMatched;
              const isJustMatched = card.pairId === justMatchedPairId;

              return (
                <div key={card.id} style={{ perspective: 1000, aspectRatio: '1/1' }}>
                  <motion.div
                    onClick={() => handleCardClick(card.id)}
                    animate={{
                      rotateY: isFlipped ? 180 : 0,
                      scale: isJustMatched ? [1, 1.08, 1] : 1,
                    }}
                    transition={{
                      rotateY: { type: 'spring', stiffness: 260, damping: 20 },
                      scale: { duration: 0.4 },
                    }}
                    style={{
                      width: '100%', height: '100%', position: 'relative',
                      transformStyle: 'preserve-3d', cursor: card.isMatched ? 'default' : 'pointer',
                    }}
                  >
                    {/* ── Front of card (face-down / question mark) ── */}
                    <div style={{
                      position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
                      background: 'linear-gradient(135deg, rgba(30,41,59,0.8), rgba(15,23,42,0.9))',
                      border: '2px solid rgba(148,163,184,0.15)', borderRadius: 16,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                    }}>
                      <Brain size={28} color="#475569" />
                    </div>

                    {/* ── Back of card (face-up / content) ── */}
                    <div style={{
                      position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
                      // Matched = solid green gradient; unmatched flipped = blue/purple
                      background: card.isMatched
                        ? 'linear-gradient(135deg, #059669, #10b981)'
                        : card.type === 'concept'
                        ? 'linear-gradient(135deg, #2563eb, #3b82f6)'
                        : 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
                      border: `2px solid ${card.isMatched ? '#34d399' : card.type === 'concept' ? '#60a5fa' : '#a78bfa'}`,
                      borderRadius: 16,
                      transform: 'rotateY(180deg)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      padding: 10, textAlign: 'center',
                      boxShadow: card.isMatched
                        ? '0 0 32px rgba(16,185,129,0.6), 0 0 64px rgba(16,185,129,0.2)'
                        : `0 0 24px ${card.type === 'concept' ? 'rgba(59,130,246,0.4)' : 'rgba(139,92,246,0.4)'}`,
                      gap: 6,
                    }}>
                      {/* Green checkmark badge on matched cards */}
                      {card.isMatched && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.15, type: 'spring', stiffness: 300 }}
                          style={{
                            width: 22, height: 22, borderRadius: '50%',
                            background: 'rgba(255,255,255,0.25)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <CheckCircle2 size={14} color="white" strokeWidth={2.5} />
                        </motion.div>
                      )}

                      <span style={{
                        fontSize: card.type === 'match' ? 13 : 14,
                        fontWeight: 700, color: 'white',
                        fontFamily: card.type === 'match' ? 'JetBrains Mono, monospace' : 'Inter, sans-serif',
                        wordBreak: 'break-word', lineHeight: 1.3,
                      }}>
                        {card.content}
                      </span>

                      {/* "Matched!" label */}
                      {card.isMatched && (
                        <motion.span
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.25 }}
                          style={{
                            fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.8)',
                            textTransform: 'uppercase', letterSpacing: '0.06em',
                          }}
                        >
                          Matched!
                        </motion.span>
                      )}
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            style={{
              maxWidth: 400, width: '100%', padding: 32, borderRadius: 24,
              background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.1))',
              border: '1px solid rgba(16,185,129,0.3)', textAlign: 'center',
              boxShadow: '0 0 64px rgba(16,185,129,0.15)',
            }}
          >
            <div style={{
              width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
              boxShadow: '0 0 32px rgba(16,185,129,0.5)',
            }}>
              <Sparkles size={32} color="white" />
            </div>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 28, fontWeight: 900, marginBottom: 12 }}>
              All Pairs Matched! 🎉
            </h2>
            <p style={{ color: '#94a3b8', fontSize: 15, marginBottom: 8 }}>
              You matched all {PAIRS.length} pairs in <strong>{moves}</strong> moves.
            </p>
            <p style={{ color: '#64748b', fontSize: 13, marginBottom: 32 }}>
              Every card is green — time to put your skills to work!
            </p>
            
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={initGame} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 14,
                background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', fontSize: 14, fontWeight: 600,
                border: '1px solid rgba(148,163,184,0.2)', cursor: 'pointer',
              }}>
                <RefreshCcw size={16} /> Replay
              </button>
              <button onClick={() => router.push('/session')} style={{
                padding: '12px 24px', borderRadius: 14,
                background: 'linear-gradient(135deg, #059669, #10b981)',
                color: 'white', fontSize: 14, fontWeight: 700,
                border: 'none', cursor: 'pointer', boxShadow: '0 0 24px rgba(16,185,129,0.4)',
              }}>
                Start Solving Problems →
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
