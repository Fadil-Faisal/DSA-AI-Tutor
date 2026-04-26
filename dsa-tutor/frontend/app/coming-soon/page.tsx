'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Zap, Brain, Sparkles, Timer } from 'lucide-react';

export default function ExtraPage() {
  const router = useRouter();

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(180deg, #030712 0%, #060e1e 50%, #030712 100%)',
      color: '#f8fafc',
      display: 'flex', flexDirection: 'column',
      padding: 24,
    }}>
      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '16px 0',
      }}>
        <Link href="/main-menu" style={{ color: '#475569', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <ArrowLeft size={18} />
        </Link>
        <span style={{ color: '#475569', fontSize: 13 }}>Extra</span>
      </nav>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 32, flex: 1,
          justifyContent: 'center',
        }}
      >
        <h1 style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: 28, fontWeight: 900,
        }}>
          Extra Features
        </h1>

        {/* Rapid Quiz */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/rapid-quiz')}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
            padding: '28px 40px', borderRadius: 20,
            background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(124,58,237,0.15) 100%)',
            border: '1px solid rgba(99,102,241,0.3)',
            cursor: 'pointer', width: '100%', maxWidth: 300,
          }}
        >
          <Zap size={32} color="#60a5fa" />
          <span style={{ fontSize: 18, fontWeight: 700 }}>Rapid Quiz</span>
          <span style={{ fontSize: 12, color: '#64748b' }}>20 questions in 1 minute</span>
        </motion.button>

      </motion.div>
    </div>
  );
}