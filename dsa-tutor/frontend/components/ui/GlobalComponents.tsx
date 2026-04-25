'use client';

import { cn, getConfidenceColor, getConfidenceLabel } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { motion, HTMLMotionProps } from 'framer-motion';
import React from 'react';

// ─── Badge ───────────────────────────────────────────────────────────────────

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'easy' | 'medium' | 'hard' | 'simple' | 'complex' | 'topic' | 'default';
}

export function Badge({ variant = 'default', className, children, ...props }: BadgeProps) {
  const variantClass = {
    easy: 'badge badge-easy',
    medium: 'badge badge-medium',
    hard: 'badge badge-hard',
    simple: 'badge badge-simple',
    complex: 'badge badge-complex',
    topic: 'badge border border-[rgba(148,163,184,0.25)] text-slate-300 bg-[rgba(148,163,184,0.08)]',
    default: 'badge border border-[rgba(148,163,184,0.2)] text-slate-400 bg-[rgba(148,163,184,0.06)]',
  }[variant];

  return (
    <span className={cn(variantClass, className)} {...props}>
      {children}
    </span>
  );
}

// ─── GlassCard ───────────────────────────────────────────────────────────────

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: 'blue' | 'violet' | 'none';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function GlassCard({ glow = 'none', padding = 'md', className, children, ...props }: GlassCardProps) {
  const glowClass = { blue: 'glow-blue', violet: 'glow-violet', none: '' }[glow];
  const padClass = { none: '', sm: 'p-3', md: 'p-5', lg: 'p-7' }[padding];

  return (
    <div className={cn('glass-card', glowClass, padClass, className)} {...props}>
      {children}
    </div>
  );
}

// ─── Button ──────────────────────────────────────────────────────────────────

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  icon,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };

  const variants = {
    primary:
      'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/40 focus-visible:outline-blue-500',
    secondary:
      'bg-[rgba(148,163,184,0.1)] hover:bg-[rgba(148,163,184,0.18)] border border-[rgba(148,163,184,0.2)] text-slate-200 focus-visible:outline-slate-400',
    ghost:
      'text-slate-400 hover:text-slate-200 hover:bg-[rgba(255,255,255,0.06)] focus-visible:outline-slate-400',
    danger:
      'bg-rose-600/90 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/40 focus-visible:outline-rose-500',
    success:
      'bg-emerald-600/90 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/40 focus-visible:outline-emerald-500',
  };

  return (
    <button
      className={cn(base, sizes[size], variants[variant], className)}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : icon}
      {children}
    </button>
  );
}

// ─── ConfidencePill ──────────────────────────────────────────────────────────

export function ConfidencePill({ value, label }: { value: number; label?: string }) {
  const color = getConfidenceColor(value);
  const lvl = getConfidenceLabel(value);
  const pct = Math.round(value * 100);

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
      style={{
        color,
        background: `${color}18`,
        borderColor: `${color}40`,
      }}
      aria-label={`${label ?? ''} confidence: ${pct}% — ${lvl}`}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: color }}
        aria-hidden="true"
      />
      {label && <span>{label}</span>}
      <span>{pct}%</span>
    </span>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} aria-hidden="true" />;
}

export function SkeletonCard() {
  return (
    <div className="glass-card p-5 space-y-3" aria-busy="true" aria-label="Loading…">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <Skeleton className="h-3 w-4/6" />
    </div>
  );
}

// ─── SectionTitle ────────────────────────────────────────────────────────────

export function SectionTitle({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold text-slate-100">{children}</h2>
      {sub && <p className="text-sm text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────

export function Divider({ className }: { className?: string }) {
  return <hr className={cn('border-[rgba(148,163,184,0.1)]', className)} />;
}

// ─── TopicTag ────────────────────────────────────────────────────────────────

const TOPIC_COLORS: Record<string, string> = {
  arrays: '#3b82f6',
  trees: '#10b981',
  graphs: '#8b5cf6',
  dp: '#f59e0b',
  recursion: '#ec4899',
  sorting: '#06b6d4',
  searching: '#14b8a6',
  strings: '#a78bfa',
  heaps: '#f97316',
  linked_lists: '#6366f1',
};

export function TopicTag({ topic }: { topic: string }) {
  const color = TOPIC_COLORS[topic] ?? '#94a3b8';
  const label = topic
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border"
      style={{ color, background: `${color}15`, borderColor: `${color}35` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} aria-hidden />
      {label}
    </span>
  );
}

// ─── AgentThinkingDots ────────────────────────────────────────────────────────

export function AgentThinkingDots() {
  return (
    <span className="inline-flex gap-1 items-center" aria-label="Agent thinking">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-blue-400"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          aria-hidden
        />
      ))}
    </span>
  );
}

// ─── StatCard ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
  sub?: string;
}

export function StatCard({ label, value, icon, color = '#3b82f6', sub }: StatCardProps) {
  return (
    <div className="glass-card p-5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
        {icon && (
          <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
            <span style={{ color }}>{icon}</span>
          </span>
        )}
      </div>
      <div className="text-2xl font-bold" style={{ color }}>
        {value}
      </div>
      {sub && <div className="text-xs text-slate-500">{sub}</div>}
    </div>
  );
}
