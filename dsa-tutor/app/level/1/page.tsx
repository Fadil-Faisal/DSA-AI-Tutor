'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

const VIDEO_DURATION = 60;
const PAUSE_MARK = 30;

const questions = [
  {
    question: 'What is the time complexity of accessing an element in an array?',
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
    correctAnswer: 0,
  },
];

export default function VideoLessonPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showPauseOverlay, setShowPauseOverlay] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerFeedback, setAnswerFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [startTime] = useState(Date.now());
  const [xp] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const time = video.currentTime;
      setCurrentTime(time);

      if (time >= PAUSE_MARK && !showPauseOverlay && !video.paused) {
        video.pause();
        setShowPauseOverlay(true);
        setIsPlaying(false);
      }
    };

    const handleEnded = () => {
      setShowCompletion(true);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [showPauseOverlay]);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(index);
    const isCorrect = index === questions[0].correctAnswer;
    setAnswerFeedback(isCorrect ? 'correct' : 'incorrect');

    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play();
        setIsPlaying(true);
        setShowPauseOverlay(false);
      }
    }, 1500);
  };

  const handleNextLevel = () => {
    router.push('/level/2');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const timeTaken = Math.floor((Date.now() - startTime) / 1000);
  const accuracy = answerFeedback === 'correct' ? 100 : 0;
  const engagement = Math.max(60, 100 - Math.floor(timeTaken / 2));

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
          
          <h1 className="text-3xl font-bold text-white mb-8">
            You completed Level 1!
          </h1>

          <div className="flex gap-4 justify-center mb-8">
            <StatCard 
              label="Time Taken" 
              value={formatTime(timeTaken)} 
              icon="⏱️" 
              delay={0} 
            />
            <StatCard 
              label="Accuracy" 
              value={`${accuracy}%`} 
              icon="🎯" 
              delay={1} 
            />
            <StatCard 
              label="Engagement" 
              value={`${engagement}/100`} 
              icon="⚡" 
              delay={2} 
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <p className="text-zinc-300 mb-2">You are 77% ahead of learners at your level</p>
            <p className="text-amber-400 text-lg">You&apos;re basically a human CPU 🔥</p>
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
        <h1 className="text-xl font-bold text-amber-400">Level 1 — Video Lesson</h1>
        <div className="flex items-center gap-2">
          <span className="text-zinc-400 text-sm">XP</span>
          <div className="w-20 h-2 bg-zinc-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber-500 rounded-full"
              style={{ width: `${xp}%` }}
            />
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-[800px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="aspect-video bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden relative"
          >
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              src="https://www.w3schools.com/html/mov_bbb.mp4"
              preload="metadata"
            />
            
            {!isPlaying && !showPauseOverlay && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                <motion.button
                  onClick={handlePlay}
                  className="w-20 h-20 rounded-full bg-amber-500 flex items-center justify-center text-3xl"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ▶
                </motion.button>
                <p className="text-white mt-4">Click to play</p>
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-700">
              <div 
                className="h-full bg-amber-500 transition-all"
                style={{ width: `${(currentTime / VIDEO_DURATION) * 100}%` }}
              />
            </div>

            <div className="absolute top-4 right-4 text-white/80 text-sm bg-black/50 px-3 py-1 rounded-full">
              {Math.floor(currentTime)}s / {VIDEO_DURATION}s
            </div>
          </motion.div>
        </div>
      </main>

      <AnimatePresence>
        {showPauseOverlay && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute inset-0 z-20 flex items-end justify-center pb-20"
          >
            <div className="w-full max-w-[800px] bg-zinc-900/95 backdrop-blur-lg rounded-t-3xl border border-zinc-700 p-6">
              <h3 className="text-xl font-bold text-white mb-4 text-center">
                {questions[0].question}
              </h3>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                {questions[0].options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = index === questions[0].correctAnswer;
                  let bgClass = 'bg-zinc-800 border-zinc-700';
                  
                  if (answerFeedback) {
                    if (isCorrect) bgClass = 'bg-green-600 border-green-500';
                    else if (isSelected) bgClass = 'bg-red-600 border-red-500';
                  } else if (isSelected) {
                    bgClass = 'bg-amber-600 border-amber-500';
                  }

                  return (
                    <motion.button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      disabled={answerFeedback !== null}
                      className={`p-4 rounded-xl border-2 text-white font-medium ${bgClass}`}
                      whileHover={!answerFeedback ? { scale: 1.02 } : {}}
                      whileTap={!answerFeedback ? { scale: 0.98 } : {}}
                    >
                      {option}
                    </motion.button>
                  );
                })}
              </div>

              {answerFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <p className={`text-lg font-bold mb-3 ${
                    answerFeedback === 'correct' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {answerFeedback === 'correct' ? '✓ Correct!' : '✗ Incorrect'}
                  </p>
                  <button
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.currentTime = PAUSE_MARK;
                        videoRef.current.play();
                        setIsPlaying(true);
                        setShowPauseOverlay(false);
                      }
                    }}
                    className="px-6 py-2 bg-amber-500 text-black rounded-full font-semibold"
                  >
                    Continue Video
                  </button>
                </motion.div>
              )}
            </div>
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
      className="bg-zinc-800/80 rounded-xl p-4 min-w-[120px]"
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