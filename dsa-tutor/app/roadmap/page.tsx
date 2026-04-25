'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface Level {
  id: number;
  name: string;
  icon: string;
  route: string;
}

const levels: Level[] = [
  { id: 1, name: 'Video Lesson', icon: '🎥', route: '/level/1' },
  { id: 2, name: 'Memory Game', icon: '🃏', route: '/level/2' },
  { id: 3, name: 'Quiz Challenge', icon: '⚡', route: '/level/3' },
  { id: 4, name: 'Coding Challenge', icon: '💻', route: '/level/4' },
];

const nodePositions = [
  { x: 50, y: 75 },
  { x: 25, y: 55 },
  { x: 75, y: 35 },
  { x: 50, y: 15 },
];

export default function RoadmapPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('Learner');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedName = localStorage.getItem('user_name');
    if (!storedName) {
      router.push('/');
    } else {
      setUserName(storedName);
    }
  }, [router]);

  if (!isMounted) {
    return null;
  }

  const handleNodeClick = (route: string) => {
    router.push(route);
  };

  return (
    <div className="min-h-screen w-full overflow-hidden bg-[#0a0a1a] relative">
      <Starfield />
      
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent"
        >
          Lama Learns
        </motion.h1>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <span className="text-zinc-300 text-sm">{userName}</span>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-sm font-bold text-black">
            {userName.charAt(0).toUpperCase()}
          </div>
        </motion.div>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute top-20 left-0 right-0 text-center z-10"
      >
        <h2 className="text-xl text-zinc-400 font-light">Your Learning Journey</h2>
      </motion.div>

      <div className="relative w-full h-screen flex items-center justify-center">
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <path
            d="M 50 80 Q 30 60 50 40 Q 70 20 50 0"
            fill="none"
            stroke="url(#pathGradient)"
            strokeWidth="0.5"
            filter="url(#glow)"
            strokeDasharray="2"
          />
        </svg>

        <div className="relative w-full h-full max-w-lg">
          {levels.map((level, index) => (
            <LevelNode 
              key={level.id}
              level={level}
              position={nodePositions[index]}
              index={index}
              onClick={handleNodeClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function LevelNode({ level, position, index, onClick }: { 
  level: Level; 
  position: { x: number; y: number };
  index: number;
  onClick: (route: string) => void;
}) {
  return (
    <motion.button
      onClick={() => onClick(level.route)}
      className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 cursor-pointer"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
      }}
      transition={{
        delay: 1 + index * 0.3,
        type: 'spring',
        stiffness: 300,
        damping: 15,
      }}
      whileHover={{ 
        scale: 1.15,
      }}
    >
      <motion.div
        className="relative w-16 h-16 rounded-full flex items-center justify-center text-2xl bg-gradient-to-br from-amber-400 to-yellow-600 shadow-lg shadow-amber-500/50"
        animate={{
          boxShadow: [
            '0 0 20px rgba(245, 158, 11, 0.3)',
            '0 0 40px rgba(245, 158, 11, 0.6)',
            '0 0 20px rgba(245, 158, 11, 0.3)',
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <span>{level.icon}</span>
      </motion.div>

      <motion.span
        className="text-xs font-medium text-amber-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 + index * 0.3 }}
      >
        {level.name}
      </motion.span>
    </motion.button>
  );
}

function Starfield() {
  const [stars, setStars] = useState<{ x: number; y: number; size: number }[]>([]);

  useEffect(() => {
    const newStars = Array.from({ length: 50 }, () => ({
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
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}