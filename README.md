<div align="center">

# 🦙 LhamaLearns — Adaptive AI DSA Tutor



An autonomous Data Structures & Algorithms tutor that builds a real-time cognitive model of each learner and adapts the curriculum to their pace.

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

🏆 Built for **AAYAM 2026 Hackathon**

</div>

---

## 📖 About The Project

Most DSA practice tools just tell you if your answer was right or wrong. **LhamaLearns** goes further: it maintains a live cognitive model of each learner — topic confidence, streaks, recurring mistakes — and uses that model to adapt difficulty, generate targeted hints, and steer what the learner sees next. Instead of grading correctness alone, an AI tutor agent analyzes *how* a learner solves each problem.

It's split into a backend (Next.js API routes handling code execution, the AI agent, and quizzes) and a separate frontend app (the actual learning UI), sharing a Supabase database and real-time layer.

---

## 🛠️ Built With

| Category | Stack |
|---|---|
| **Framework** | ![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white) (App Router) |
| **UI** | ![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white) Radix UI |
| **State** | Zustand, Immer |
| **Code Editor** | Monaco Editor |
| **Animation & Visualization** | Framer Motion, Recharts (confidence radar), React Flow (roadmap graph), Canvas Confetti |
| **Database & Realtime** | ![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white) (PostgreSQL + Realtime) |
| **AI Providers** | Ollama (local), Groq, Google Gemini (`@google/generative-ai`, `openai` SDK for Groq's OpenAI-compatible endpoint) |
| **Code Execution** | Judge0 |
| **PDF/Export** | jsPDF, html2canvas |

---

## ✨ Features

**🤖 Adaptive AI Tutor Agent**
- Real-time cognitive learner modeling — topic confidence, streaks, mistake patterns
- Multi-provider AI fallback chain: Ollama → Groq → Gemini
- Context-aware feedback that looks at *how* a problem was solved, not just the final answer
- Dynamic difficulty adjustment based on live performance

**💻 Interactive Code Editor**
- Monaco Editor with syntax highlighting for Python, JavaScript, Java, and C++
- Auto-execution against test cases (via Judge0) with detailed feedback
- Live hints from the AI agent while coding

**👥 Multiplayer Modes** (Supabase Realtime)
- **Battle** — race to solve a problem, compare solutions
- **Collaborative** — shared editor, real-time co-editing
- **Mentor** — a teacher watches a learner's code and sends private hints

**📚 Learning Paths**
- **Roadmap** — visual DSA journey with unlockable nodes (React Flow)
- **Session** — problem-solving with AI coaching
- **Rapid Quiz** — 20 Python questions in 60 seconds
- **Matching Game** — vocabulary reinforcement

**📊 Dashboard**
- Topic confidence radar charts (Recharts)
- Streak tracking and weak-area identification

---

## 🏗️ Architecture

```
dsa-tutor/
├── app/                    # Next.js App Router (backend API routes)
│   ├── api/                # /api/run, /api/agent, /api/quiz
│   └── ...
├── lib/agent/               # AI provider integrations (Ollama, Groq, Gemini)
├── frontend/                # Separate Next.js app (learner-facing UI)
│   ├── app/                 # Pages (main-menu, session, roadmap, etc.)
│   ├── components/          # Reusable UI components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utilities
│   └── store/                 # Zustand state management
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm
- A [Supabase](https://supabase.com/) project
- At least one AI provider key (Ollama running locally, or a Groq/Gemini API key)

### Installation

```bash
git clone https://github.com/Fadil-Faisal/DSA-AI-Tutor.git
cd DSA-AI-Tutor/dsa-tutor

# Backend dependencies
npm install

# Frontend dependencies
cd frontend
npm install
cd ..
```

### Environment variables

Create `dsa-tutor/.env.local` (backend):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Providers (at least one required)
GROQ_API_KEY=your-groq-key
GEMINI_API_KEY=your-gemini-key
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3

# Execution
NEXT_PUBLIC_JUDGE0_URL=https://ce.judge0.com
```

Create `dsa-tutor/frontend/.env` (frontend):

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Running locally

```bash
# Terminal 1 — backend
cd dsa-tutor
npm run dev

# Terminal 2 — frontend
cd dsa-tutor/frontend
npm run dev
```

Open **http://localhost:3000**.

---

## 💻 Usage

**Run a submission against the AI agent** (backend API route):

```bash
curl -X POST http://localhost:3000/api/agent \
  -H "Content-Type: application/json" \
  -d '{
    "problemId": "two-sum",
    "code": "def two_sum(nums, target): ...",
    "language": "python"
  }'
```

**Execute code against test cases:**

```bash
curl -X POST http://localhost:3000/api/run \
  -H "Content-Type: application/json" \
  -d '{
    "code": "print(sum([1,2,3]))",
    "language": "python"
  }'
```

A Postman collection is included under `dsa-tutor/postman/` for exploring the full API surface.

---

## ☁️ Deployment

Deploy to Vercel — backend and frontend are separate apps and deploy independently:

```bash
# Backend
cd dsa-tutor
npx vercel --prod

# Frontend
cd dsa-tutor/frontend
npx vercel --prod
```

**Backend env vars:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GROQ_API_KEY`, `GEMINI_API_KEY`, `NEXT_PUBLIC_JUDGE0_URL`

**Frontend env vars:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_URL`

---

## 🗺️ Roadmap

- [ ] Merge backend and frontend into a single deployable app (or document why they're split)
- [ ] Add automated tests for the AI agent's fallback logic (Ollama → Groq → Gemini)
- [ ] Expand language support beyond Python/JavaScript/Java/C++
- [ ] Add persistent analytics for long-term progress tracking
- [ ] Polish onboarding flow for first-time learners

See [open issues](https://github.com/Fadil-Faisal/DSA-AI-Tutor/issues) for the full list.

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/your-feature`)
3. Commit your changes
4. Push and open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.

---

## 📬 Contact

**Fadil Faisal** — [GitHub](https://github.com/Fadil-Faisal)

Project Link: [https://github.com/Fadil-Faisal/DSA-AI-Tutor](https://github.com/Fadil-Faisal/DSA-AI-Tutor)

</div>
