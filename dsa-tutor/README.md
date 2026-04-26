# LhamaLearns — The Adaptive DSA Tutor Agent 🦙🧠

LhamaLearns is an intelligent, agentic Data Structures & Algorithms (DSA) tutoring platform. Instead of a generic chatbot, LhamaLearns builds a **cognitive model of the learner**, tracks performance (answers, time, hesitations, hint usage), and autonomously guides the user with tailored content, dynamic difficulty adjustments, and specific, actionable feedback.

This project was built for the AAYAM Hackathon and features a premium, dark-themed, glassmorphism UI with real-time multiplayer features and local/cloud AI fallback integration.

---

## 🌟 Key Features

### 1. 🧠 Adaptive AI Tutor Agent
- **Cognitive Learner Model**: Tracks topic confidence, streaks, and hint usage in real-time.
- **Smart Fallback Architecture**:
  - **Primary**: Local **Ollama (Llama 3)** for zero-latency, free local inference.
  - **Fallback 1**: **Groq (Llama 3.3 70B)** for lightning-fast cloud inference.
  - **Fallback 2**: **Gemini 1.5 Flash** as a robust backup.
- **Context-Aware Feedback**: The agent doesn't just check if code is right/wrong. It analyzes *how* you solved it (time taken, hints used) and decides whether to push you to a harder problem or reinforce the current topic.

### 2. ⚡ Real-Time Code Execution
- Integrated Monaco Editor with syntax highlighting for Python, JavaScript, Java, and C++.
- Evaluates code against multiple test cases and provides detailed stdout/stderr feedback.

### 3. 👥 Multiplayer Collaborative Learning
- Powered by **Supabase Realtime**.
- **Collaborative Mode**: Work together with peers in the same editor.
- **Mentor Mode**: Mentors can watch students type live, trigger hints, or take control to explain concepts.

### 4. 🎮 Interactive Learning Modes
- **Video Lessons**: Embedded lessons with interactive breakpoints that pause the video to test your knowledge with pop-up quizzes.
- **Memory Game**: A DSA concept-matching mini-game to test technical vocabulary and definitions in a low-stakes, gamified environment.
- **Progress Dashboard**: Visual analytics on your DSA mastery, radar charts for topic confidence, and streak tracking.

---

## 🏗️ Project Structure

The project is structured into primarily frontend and backend concepts (though housed in a modern Next.js App Router monolith):

- [`/frontend`](./frontend/) — The Next.js 15 React application, UI components, state management (Zustand), and design system.
- [`/backend`](./backend/) — (Logical) documentation covering the Next.js API routes (`/api/agent`, `/api/run`), Supabase integration, and local AI setup.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- npm or pnpm
- (Optional but recommended) [Ollama](https://ollama.com/) installed locally for free AI agent inference.

### 1. Clone & Install
```bash
git clone <repository-url>
cd dsa-tutor/frontend
npm install
```

### 2. Environment Setup
Create a `.env` file in the `frontend` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000

# Supabase Auth & Realtime
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Providers (At least one is required)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Start Local AI (If using Ollama)
```bash
ollama run llama3
```

### 4. Run the App
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎨 Design System
LhamaLearns uses a highly polished **Void Dark Theme**:
- Deep navy/void backgrounds (`#020617`, `#0a1628`).
- Vibrant electric accents (Blue `#3b82f6`, Violet `#8b5cf6`, Amber `#f59e0b`).
- Glassmorphism panels and subtle micro-animations powered by `framer-motion`.

---

