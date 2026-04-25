import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getConfidenceColor(value: number): string {
  if (value > 0.75) return '#10b981';
  if (value >= 0.40) return '#f59e0b';
  return '#f43f5e';
}

export function getConfidenceLabel(value: number): 'Strong' | 'Medium' | 'Weak' {
  if (value > 0.75) return 'Strong';
  if (value >= 0.40) return 'Medium';
  return 'Weak';
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function generateSessionId(): string {
  return typeof crypto !== 'undefined'
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

export function topicLabel(topic: string): string {
  const labels: Record<string, string> = {
    arrays: 'Arrays',
    trees: 'Trees',
    graphs: 'Graphs',
    dp: 'Dynamic Prog.',
    recursion: 'Recursion',
    sorting: 'Sorting',
    searching: 'Searching',
    strings: 'Strings',
    heaps: 'Heaps',
    linked_lists: 'Linked Lists',
  };
  return labels[topic] ?? topic;
}

export function difficultyColor(diff: string): string {
  if (diff === 'Easy') return '#10b981';
  if (diff === 'Medium') return '#f59e0b';
  return '#f43f5e';
}
