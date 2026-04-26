# LhamaLearns — Adaptive AI DSA Tutor 🦙

An intelligent, autonomous Data Structures & Algorithms tutoring platform that builds a real-time cognitive model of each learner and adapts the curriculum to their pace.

---

## ✨ Features

### 🤖 Adaptive AI Tutor Agent
- Real-time cognitive learner modeling (tracks topic confidence, streaks, mistakes)
- Multi-provider AI fallback: **Ollama** → **Groq** → **Gemini**
- Context-aware feedback that analyzes how you solve problems, not just correctness
- Dynamic difficulty adjustment based on performance

### 💻 Interactive Code Editor
- Monaco Editor with syntax highlighting
- Multi-language: Python, JavaScript, Java, C++
- Auto-execution against test cases with detailed feedback
- Live hints from AI agent

### 👥 Multiplayer Modes (Supabase Realtime)
- **Battle**: Race to solve, compares solutions
- **Collaborative**: Shared editor, real-time collaboration
- **Mentor**: Teacher watches learner code, sends private hints

### 📚 Learning Paths
- **Roadmap**: Visual DSA journey with unlockable nodes
- **Session**: Problem-solving with AI coaching
- **Rapid Quiz**: 20 Python questions in 60 seconds
- **Matching Game**: Vocabulary reinforcement

### 📊 Dashboard
- Topic confidence radar charts
- Streak tracking
- Weak areas identification

---

## 🏗️ Architecture

```
dsa-tutor/
├── app/                    # Next.js App Router (API routes)
│   ├── api/               # /api/run, /api/agent, /api/quiz
│   └── ...
├── lib/agent/             # AI provider integrations (Ollama, Groq, Gemini)
├── frontend/              # Separate Next.js app (UI)
│   ├── app/              # Pages (main-menu, session, roadmap, etc.)
│   ├── components/       # Reusable UI components
│   ├── hooks/           # Custom React hooks
│   ├── lib/            # Utilities
│   └── store/           # Zustand state management
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm
- Supabase account

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd dsa-tutor

# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Environment Variables

Create `dsa-tutor/.env.local`:

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

Create `dsa-tutor/frontend/.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Running Locally

```bash
# Terminal 1: Backend
npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

Open http://localhost:3000

---

## ☁️ Deployment

### Deploy to Vercel

**Backend:**
```bash
cd dsa-tutor
npx vercel --prod
```

**Frontend:**
```bash
cd dsa-tutor/frontend
npx vercel --prod
```

### Required Environment Variables (Vercel)

**Backend:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GROQ_API_KEY`
- `GEMINI_API_KEY`
- `NEXT_PUBLIC_JUDGE0_URL`

**Frontend:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_URL`

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 15, React 19, Zustand, Framer Motion, Monaco Editor
- **Backend:** Next.js API Routes, Supabase
- **AI:** Ollama (local), Groq, Gemini
- **Code Execution:** Judge0
- **Database:** Supabase (PostgreSQL)

---

## 📄 License

MIT

---

Built for AAYAM 2026 Hackathon 🏆