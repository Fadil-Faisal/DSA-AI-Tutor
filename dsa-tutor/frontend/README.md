# LhamaLearns Frontend 🎨

The frontend of LhamaLearns is a modern, high-performance web application built with Next.js 15, React 19, and Tailwind CSS. It is designed to provide a highly interactive, responsive, and beautiful learning environment for mastering Data Structures and Algorithms.

## 🛠️ Tech Stack
- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS (v4) with custom glassmorphism utility classes
- **State Management**: Zustand (with Immer for immutable updates)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Code Editor**: `@monaco-editor/react`

## 📂 Directory Structure

- `/app` — Next.js App Router pages (routing).
  - `/session` — The core AI Tutor interface (Editor, Problem description, Agent panel).
  - `/multiplayer` — Lobby and active room interfaces for collaborative coding.
  - `/video-lesson` — Interactive video lessons with quiz breakpoints.
  - `/matching-game` — Memory card game for DSA terms.
  - `/dashboard` & `/roadmap` — User progress tracking.
  - `/api` — Backend API routes (Agent logic, code execution).
- `/components`
  - `/session` — Modular components for the session page (`AgentPanel`, `OutputPanel`, `ProblemPanel`, `HintSection`, etc.).
  - `/ui` — Reusable global UI components (`Badge`, `Button`, `TopicTag`, `AgentThinkingDots`).
- `/lib` — Utilities (Tailwind merge `cn`, Supabase browser client).
- `/store` — Zustand stores (`learnerStore.ts` for tracking user progress and AI state).
- `/types` — TypeScript interfaces for problems, learner state, and execution results.

## 🎨 Design Philosophy
The frontend utilizes a "Void Dark Theme". We heavily avoid generic, flat designs in favor of:
- **Glassmorphism**: Translucent panels with background blur (`backdrop-filter`).
- **Micro-interactions**: Subtle hover states, animated dropdowns, and pulsing loading states (like the Agent Thinking Dots).
- **Typography**: Clean, monospace fonts (`JetBrains Mono`) for code and `Space Grotesk` / `Inter` for UI elements.

## 🚀 Running the Frontend

Ensure you are in the `frontend` directory:

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

The application will be available at `http://localhost:3000`.

## 🧠 State Management (Zustand)
We use `useLearnerStore` to manage the student's entire learning lifecycle:
- Tracks `confidence` scores across 10 DSA topics (Arrays, Trees, Graphs, etc.).
- Maintains the `currentStreak` and `hintsUsed`.
- Synchronizes the Agent's reasoning string and current AI decision state globally so it can be accessed by both the `AgentPanel` and the execution lifecycle in `SessionPage`.
