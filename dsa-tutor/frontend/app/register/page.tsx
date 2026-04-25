'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Mail, Lock, Eye, EyeOff, User, Zap, AlertCircle, ChevronRight,
  Sparkles, CheckCircle2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase/browser';
import { useAuth } from '@/hooks/useAuth';
import { useLearnerStore } from '@/store/learnerStore';

// ── Neural Canvas ──────────────────────────────────────────────────────────
function NeuralCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    type P = { x: number; y: number; vx: number; vy: number; r: number };
    const nodes: P[] = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 0.8,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 130) {
            ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(139,92,246,${0.12 * (1 - d / 130)})`; ctx.lineWidth = 1; ctx.stroke();
          }
        }
      }
      nodes.forEach((n) => {
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(167,139,250,0.5)'; ctx.fill();
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} aria-hidden style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.45 }} />;
}

// ── Input Field ────────────────────────────────────────────────────────────
function InputField({
  id, label, type = 'text', value, onChange, placeholder, icon, rightEl, error,
}: {
  id: string; label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder: string;
  icon: React.ReactNode; rightEl?: React.ReactNode; error?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label htmlFor={id} style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.01em' }}>
        {label}
      </label>
      <div style={{
        position: 'relative', display: 'flex', alignItems: 'center',
        border: `1px solid ${error ? 'rgba(244,63,94,0.5)' : focused ? 'rgba(139,92,246,0.6)' : 'rgba(148,163,184,0.12)'}`,
        borderRadius: 12, background: focused ? 'rgba(139,92,246,0.04)' : 'rgba(15,23,42,0.6)',
        boxShadow: focused ? '0 0 0 3px rgba(139,92,246,0.12)' : 'none',
        transition: 'all 0.2s',
      }}>
        <span style={{ position: 'absolute', left: 14, color: error ? '#f43f5e' : focused ? '#a78bfa' : '#475569', display: 'flex', transition: 'color 0.2s' }}>
          {icon}
        </span>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          autoComplete={type === 'password' ? 'new-password' : type === 'email' ? 'email' : 'on'}
          style={{
            flex: 1, padding: '13px 14px 13px 44px', background: 'transparent', border: 'none',
            outline: 'none', fontSize: 14, color: '#f1f5f9', fontFamily: 'Inter, sans-serif',
            paddingRight: rightEl ? 44 : 14,
          }}
        />
        {rightEl && (
          <span style={{ position: 'absolute', right: 14, display: 'flex', cursor: 'pointer', color: '#475569' }}>
            {rightEl}
          </span>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            style={{ fontSize: 12, color: '#f43f5e', display: 'flex', alignItems: 'center', gap: 5, margin: 0 }}>
            <AlertCircle size={12} /> {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Password Strength ─────────────────────────────────────────────────────
function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const checks = [
    { label: 'At least 8 characters', pass: password.length >= 8 },
    { label: 'Contains a number', pass: /\d/.test(password) },
    { label: 'Contains uppercase', pass: /[A-Z]/.test(password) },
    { label: 'Contains special char', pass: /[^a-zA-Z0-9]/.test(password) },
  ];
  const strength = checks.filter(c => c.pass).length;
  const colors = ['#f43f5e', '#f59e0b', '#3b82f6', '#10b981'];
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];

  return (
    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 2 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i < strength ? colors[strength - 1] : 'rgba(148,163,184,0.15)', transition: 'all 0.3s' }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
          {checks.map((c, i) => (
            <span key={i} style={{ fontSize: 11, color: c.pass ? '#34d399' : '#475569', display: 'flex', alignItems: 'center', gap: 3 }}>
              {c.pass ? <CheckCircle2 size={10} /> : <span style={{ width: 10, height: 10, borderRadius: '50%', border: '1px solid #334155', display: 'inline-block' }} />}
              {c.label}
            </span>
          ))}
        </div>
        {strength > 0 && (
          <span style={{ fontSize: 11, fontWeight: 700, color: colors[strength - 1], flexShrink: 0 }}>
            {labels[strength - 1]}
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { setSessionId, setUserName } = useLearnerStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirm?: string; global?: string }>({});
  const [success, setSuccess] = useState(false);

  // If already logged in, redirect home
  useEffect(() => {
    if (!authLoading && user) router.push('/');
  }, [user, authLoading, router]);

  const validate = () => {
    const e: typeof errors = {};
    if (!name.trim()) e.name = 'Full name is required';
    else if (name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Password must be at least 6 characters';
    if (!confirmPass) e.confirm = 'Please confirm your password';
    else if (confirmPass !== password) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      const { error, data } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: name.trim() },
        },
      });
      if (error) {
        setErrors({ global: error.message });
      } else {
        if (data.user) {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              auth_id: data.user.id, 
              full_name: name.trim() 
            }),
          });
          if (res.ok) {
            const { sessionId } = await res.json();
            if (sessionId) {
              setSessionId(sessionId);
              setUserName(name.trim());
            }
          } else {
            console.error('Failed to create profile');
          }
        }
        setSuccess(true);
        setTimeout(() => router.push('/'), 1800);
      }
    } catch {
      setErrors({ global: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(135deg, #030712 0%, #060e1e 50%, #030712 100%)',
      position: 'relative', overflowX: 'hidden',
    }}>
      <NeuralCanvas />

      {/* Ambient glow blobs */}
      <div aria-hidden style={{ position: 'fixed', top: '15%', right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div aria-hidden style={{ position: 'fixed', bottom: '20%', left: '8%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Nav */}
      <nav style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 32px' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(59,130,246,0.4)' }}>
            <Brain size={18} color="white" />
          </div>
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 18, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            Neural<span style={{ color: '#60a5fa' }}>DSA</span>
          </span>
        </a>
        <a href="/login" style={{ padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#94a3b8', textDecoration: 'none', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(148,163,184,0.1)', transition: 'all 0.2s' }}>
          Sign in →
        </a>
      </nav>

      {/* Main */}
      <main style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: 460 }}
        >
          {/* Card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(10,22,40,0.95) 100%)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(148,163,184,0.1)',
            borderRadius: 24,
            padding: '36px 32px',
            boxShadow: '0 8px 48px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring' }}
                style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px',
                  boxShadow: '0 0 32px rgba(139,92,246,0.4)',
                }}
              >
                <Brain size={26} color="white" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', borderRadius: 99, border: '1px solid rgba(139,92,246,0.3)', background: 'rgba(139,92,246,0.08)', color: '#c4b5fd', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 16 }}
              >
                <Sparkles size={11} />
                AAYAM 2026 Hackathon
              </motion.div>

              <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 26, fontWeight: 800, color: '#f1f5f9', marginBottom: 8, letterSpacing: '-0.02em' }}>
                Start learning smarter
              </h1>
              <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>
                Create your account and let the AI build your cognitive model
              </p>
            </div>

            {/* Success state */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ padding: '14px 16px', borderRadius: 12, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', fontSize: 14, fontWeight: 600, textAlign: 'center', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  <Zap size={16} /> Account created! Redirecting…
                </motion.div>
              )}
            </AnimatePresence>

            {/* Global error */}
            <AnimatePresence>
              {errors.global && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', color: '#fb7185', fontSize: 13, fontWeight: 500, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <AlertCircle size={15} style={{ flexShrink: 0 }} />
                  {errors.global}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleRegister} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <InputField
                id="register-name"
                label="Full name"
                value={name}
                onChange={setName}
                placeholder="e.g. Hamood Ayoob Khan"
                icon={<User size={16} />}
                error={errors.name}
              />
              <InputField
                id="register-email"
                label="Email address"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="you@example.com"
                icon={<Mail size={16} />}
                error={errors.email}
              />

              {/* Password with strength meter */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <InputField
                  id="register-password"
                  label="Password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={setPassword}
                  placeholder="Create a strong password"
                  icon={<Lock size={16} />}
                  error={errors.password}
                  rightEl={
                    <button type="button" onClick={() => setShowPass(!showPass)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#475569', display: 'flex' }}>
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />
                <PasswordStrength password={password} />
              </div>

              <InputField
                id="register-confirm-password"
                label="Confirm password"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPass}
                onChange={setConfirmPass}
                placeholder="Re-enter your password"
                icon={<Lock size={16} />}
                error={errors.confirm}
                rightEl={
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#475569', display: 'flex' }}>
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />

              <motion.button
                id="register-submit"
                type="submit"
                disabled={loading || success}
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  padding: '14px', borderRadius: 14, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  background: loading || success ? 'rgba(139,92,246,0.4)' : 'linear-gradient(135deg, #7c3aed, #2563eb)',
                  color: 'white', fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em',
                  boxShadow: loading || success ? 'none' : '0 0 32px rgba(139,92,246,0.35)',
                  transition: 'all 0.2s', marginTop: 4,
                }}
              >
                {loading ? (
                  <>
                    <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                    Creating account…
                  </>
                ) : (
                  <>
                    <Brain size={17} /> Create Account <ChevronRight size={16} />
                  </>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(148,163,184,0.1)' }} />
              <span style={{ fontSize: 12, color: '#334155', fontWeight: 500 }}>Already have an account?</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(148,163,184,0.1)' }} />
            </div>

            <a href="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', borderRadius: 14, border: '1px solid rgba(148,163,184,0.15)', background: 'rgba(255,255,255,0.03)', color: '#94a3b8', fontSize: 14, fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s' }}>
              Sign in instead
            </a>
          </div>

          {/* Footer note */}
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#1e293b' }}>
            AAYAM 2026 · Track 1: Build an AI Agent
          </p>
        </motion.div>
      </main>

      {/* Spinner keyframe injection */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
