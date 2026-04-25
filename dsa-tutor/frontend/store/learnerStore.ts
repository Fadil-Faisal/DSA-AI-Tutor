'use client';

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import { ExplanationMode, Confidence, DSATopic } from '@/types/learner';
import { Problem } from '@/types/problem';

const DEFAULT_CONFIDENCE: Confidence = {
  arrays: 0.5,
  trees: 0.5,
  graphs: 0.5,
  dp: 0.5,
  recursion: 0.5,
  sorting: 0.5,
  searching: 0.5,
  strings: 0.5,
  heaps: 0.5,
  linked_lists: 0.5,
};

interface LearnerStore {
  // Identity
  sessionId: string;
  userName: string;
  targetCompany: string | null;

  // Explanation system
  explanationMode: ExplanationMode;

  // Learner model
  confidence: Confidence;
  currentStreak: number;
  totalProblemsAttempted: number;

  // Current session
  currentProblem: Problem | null;
  currentHintLevel: 0 | 1 | 2 | 3;
  hintsUsed: number;
  timerStarted: boolean;
  timerSeconds: number;
  attemptsOnCurrentProblem: number;

  // Agent state
  agentReasoning: string;
  agentLoading: boolean;
  decisionType: string;

  // Solved history (for dashboard)
  solvedProblems: Array<{
    problemId: string;
    topic: DSATopic;
    correct: boolean;
    timeTaken: number;
    timestamp: number;
  }>;

  // Actions
  setSessionId: (id: string) => void;
  setUserName: (name: string) => void;
  setTargetCompany: (company: string | null) => void;
  setExplanationMode: (mode: ExplanationMode) => void;
  updateConfidence: (topic: DSATopic, value: number) => void;
  setConfidenceFromQuiz: (scores: Partial<Confidence>) => void;
  setCurrentProblem: (problem: Problem | null) => void;
  incrementHintLevel: () => void;
  resetHints: () => void;
  setAgentReasoning: (text: string) => void;
  setAgentLoading: (loading: boolean) => void;
  setDecisionType: (type: string) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  incrementAttempts: () => void;
  addSolvedProblem: (entry: LearnerStore['solvedProblems'][0]) => void;
  resetSession: () => void;
  startTimer: () => void;
  tickTimer: () => void;
  resetTimer: () => void;
}

export const useLearnerStore = create<LearnerStore>()(
  persist(
    immer((set) => ({
      sessionId: typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36),
      userName: '',
      targetCompany: null,
      explanationMode: 'simple',
      confidence: { ...DEFAULT_CONFIDENCE },
      currentStreak: 0,
      totalProblemsAttempted: 0,
      currentProblem: null,
      currentHintLevel: 0,
      hintsUsed: 0,
      timerStarted: false,
      timerSeconds: 0,
      attemptsOnCurrentProblem: 0,
      agentReasoning: '',
      agentLoading: false,
      decisionType: 'next_problem',
      solvedProblems: [],

      setSessionId: (id) => set((s) => { s.sessionId = id; }),
      setUserName: (name) => set((s) => { s.userName = name; }),
      setTargetCompany: (company) => set((s) => { s.targetCompany = company; }),
      setExplanationMode: (mode) => set((s) => { s.explanationMode = mode; }),

      updateConfidence: (topic, value) =>
        set((s) => {
          s.confidence[topic] = Math.max(0, Math.min(1, value));
        }),

      setConfidenceFromQuiz: (scores) =>
        set((s) => {
          Object.entries(scores).forEach(([topic, value]) => {
            s.confidence[topic as DSATopic] = Math.max(0, Math.min(1, value as number));
          });
        }),

      setCurrentProblem: (problem) =>
        set((s) => {
          s.currentProblem = problem;
          s.currentHintLevel = 0;
          s.hintsUsed = 0;
          s.attemptsOnCurrentProblem = 0;
          s.timerSeconds = 0;
          s.timerStarted = false;
        }),

      incrementHintLevel: () =>
        set((s) => {
          if (s.currentHintLevel < 3) {
            s.currentHintLevel = (s.currentHintLevel + 1) as 1 | 2 | 3;
            s.hintsUsed += 1;
          }
        }),

      resetHints: () =>
        set((s) => {
          s.currentHintLevel = 0;
          s.hintsUsed = 0;
        }),

      setAgentReasoning: (text) => set((s) => { s.agentReasoning = text; }),
      setAgentLoading: (loading) => set((s) => { s.agentLoading = loading; }),
      setDecisionType: (type) => set((s) => { s.decisionType = type; }),

      incrementStreak: () =>
        set((s) => {
          s.currentStreak += 1;
          s.totalProblemsAttempted += 1;
        }),

      resetStreak: () => set((s) => { s.currentStreak = 0; }),
      incrementAttempts: () => set((s) => { s.attemptsOnCurrentProblem += 1; }),

      addSolvedProblem: (entry) =>
        set((s) => {
          s.solvedProblems.push(entry);
          if (s.solvedProblems.length > 100) s.solvedProblems.shift();
        }),

      resetSession: () =>
        set((s) => {
          s.currentProblem = null;
          s.currentHintLevel = 0;
          s.hintsUsed = 0;
          s.timerStarted = false;
          s.timerSeconds = 0;
          s.agentReasoning = '';
          s.agentLoading = false;
          s.attemptsOnCurrentProblem = 0;
        }),

      startTimer: () => set((s) => { s.timerStarted = true; }),
      tickTimer: () => set((s) => { s.timerSeconds += 1; }),
      resetTimer: () => set((s) => { s.timerSeconds = 0; s.timerStarted = false; }),
    })),
    {
      name: 'dsa-tutor-store',
      partialize: (state) => ({
        sessionId: state.sessionId,
        userName: state.userName,
        targetCompany: state.targetCompany,
        explanationMode: state.explanationMode,
        confidence: state.confidence,
        currentStreak: state.currentStreak,
        totalProblemsAttempted: state.totalProblemsAttempted,
        solvedProblems: state.solvedProblems,
      }),
    }
  )
);
