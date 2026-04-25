'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Mail, Lock, Eye, EyeOff, User, Zap, AlertCircle, ChevronRight, Calendar,
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
    const nodes: P[] = Array.from({ length: 40 }, () => ({
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
  return <canvas ref={canvasRef} aria-hidden style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.4 }} />;
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label htmlFor={id} style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {label}
      </label>
      <div style={{
        position: 'relative', display: 'flex', alignItems: 'center',
        border: `1px solid ${error ? 'rgba(244,63,94,0.5)' : focused ? 'rgba(139,92,246,0.7)' : 'rgba(148,163,184,0.15)'}`,
        borderRadius: 10, background: focused ? 'rgba(139,92,246,0.05)' : 'rgba(15,23,42,0.7)',
        boxShadow: focused ? '0 0 0 3px rgba(139,92,246,0.12)' : 'none',
        transition: 'all 0.2s',
      }}>
        <span style={{ position: 'absolute', left: 13, color: error ? '#f43f5e' : focused ? '#a78bfa' : '#475569', display: 'flex', transition: 'color 0.2s' }}>
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
            flex: 1, padding: '11px 13px 11px 38px', background: 'transparent', border: 'none',
            outline: 'none', fontSize: 14, color: '#f1f5f9', fontFamily: 'Inter, sans-serif',
            paddingRight: rightEl ? 40 : 13,
          }}
        />
        {rightEl && (
          <span style={{ position: 'absolute', right: 13, display: 'flex', cursor: 'pointer', color: '#475569' }}>
            {rightEl}
          </span>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ fontSize: 11, color: '#f43f5e', display: 'flex', alignItems: 'center', gap: 4, margin: 0 }}>
            <AlertCircle size={10} /> {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { setSessionId, setUserName } = useLearnerStore();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; age?: string; email?: string; password?: string; confirm?: string; global?: string }>({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && user) router.push('/');
  }, [user, authLoading, router]);

  const validate = () => {
    const e: typeof errors = {};
    if (!name.trim()) e.name = 'Full name is required';
    else if (name.trim().length < 2) e.name = 'At least 2 characters';
    if (!age.trim()) e.age = 'Age is required';
    else if (isNaN(Number(age)) || Number(age) < 5 || Number(age) > 120) e.age = 'Enter a valid age';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Minimum 6 characters';
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
        options: { data: { full_name: name.trim(), age: Number(age) } },
      });
      if (error) {
        setErrors({ global: error.message });
      } else {
        if (data.user) {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ auth_id: data.user.id, full_name: name.trim(), age: Number(age) }),
          });
          if (res.ok) {
            const { sessionId } = await res.json();
            if (sessionId) { setSessionId(sessionId); setUserName(name.trim()); }
          }
        }
        setSuccess(true);
        setTimeout(() => router.push('/'), 1200);
      }
    } catch {
      setErrors({ global: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #030712 0%, #060e1e 50%, #030712 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <NeuralCanvas />

      {/* Ambient blobs */}
      <div aria-hidden style={{ position: 'fixed', top: '10%', right: '8%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div aria-hidden style={{ position: 'fixed', bottom: '10%', left: '6%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 520, padding: '0 20px' }}
      >
        {/* Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(10,22,40,0.98) 100%)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(148,163,184,0.12)',
          borderRadius: 22,
          padding: '32px 40px',
          boxShadow: '0 8px 48px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 26 }}>
            <div style={{
              width: 50, height: 50, borderRadius: 15,
              background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 14px',
              boxShadow: '0 0 28px rgba(139,92,246,0.45)',
            }}>
              <Brain size={25} color="white" />
            </div>
            <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 5, letterSpacing: '-0.02em' }}>
              Create your account
            </h1>
            <p style={{ fontSize: 13, color: '#64748b' }}>
              Join LlhamLearns and start your DSA journey
            </p>
          </div>

          {/* Success */}
          <AnimatePresence>
            {success && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                style={{ padding: '11px 16px', borderRadius: 10, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', fontSize: 13, fontWeight: 600, textAlign: 'center', marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Zap size={15} /> Account created! Redirecting…
              </motion.div>
            )}
          </AnimatePresence>

          {/* Global error */}
          <AnimatePresence>
            {errors.global && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ padding: '11px 14px', borderRadius: 10, background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', color: '#fb7185', fontSize: 12, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                {errors.global}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleRegister} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Row 1: Name + Age side by side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 12 }}>
              <InputField
                id="reg-name" label="Full Name"
                value={name} onChange={setName}
                placeholder="Jane Smith"
                icon={<User size={15} />}
                error={errors.name}
              />
              <InputField
                id="reg-age" label="Age"
                type="number"
                value={age} onChange={setAge}
                placeholder="18"
                icon={<Calendar size={15} />}
                error={errors.age}
              />
            </div>

            {/* Row 2: Email full width */}
            <InputField
              id="reg-email" label="Email Address"
              type="email"
              value={email} onChange={setEmail}
              placeholder="you@example.com"
              icon={<Mail size={15} />}
              error={errors.email}
            />

            {/* Row 3: Password full width */}
            <InputField
              id="reg-password" label="Password"
              type={showPass ? 'text' : 'password'}
              value={password} onChange={setPassword}
              placeholder="Minimum 6 characters"
              icon={<Lock size={15} />}
              error={errors.password}
              rightEl={
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#475569', display: 'flex' }}>
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              }
            />

            {/* Row 4: Confirm Password full width — stacked below */}
            <InputField
              id="reg-confirm" label="Confirm Password"
              type={showConfirm ? 'text' : 'password'}
              value={confirmPass} onChange={setConfirmPass}
              placeholder="Repeat your password"
              icon={<Lock size={15} />}
              error={errors.confirm}
              rightEl={
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#475569', display: 'flex' }}>
                  {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              }
            />

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading || success}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                padding: '13px', borderRadius: 12, border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                background: loading || success ? 'rgba(139,92,246,0.4)' : 'linear-gradient(135deg, #7c3aed, #2563eb)',
                color: 'white', fontSize: 15, fontWeight: 700,
                boxShadow: loading || success ? 'none' : '0 0 28px rgba(139,92,246,0.35)',
                transition: 'all 0.2s', marginTop: 2,
              }}
            >
              {loading ? (
                <>
                  <span style={{ width: 15, height: 15, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                  Creating account…
                </>
              ) : (
                <><Brain size={16} /> Create Account <ChevronRight size={16} /></>
              )}
            </motion.button>
          </form>

          {/* Divider + Sign in */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0 14px' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(148,163,184,0.1)' }} />
            <span style={{ fontSize: 12, color: '#334155', fontWeight: 500 }}>Already have an account?</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(148,163,184,0.1)' }} />
          </div>

          <a href="/login" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '11px', borderRadius: 12,
            border: '1px solid rgba(148,163,184,0.15)',
            background: 'rgba(255,255,255,0.03)',
            color: '#94a3b8', fontSize: 13, fontWeight: 600, textDecoration: 'none',
            transition: 'all 0.2s',
          }}>
            Sign in instead
          </a>

        </div>
      </motion.div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
