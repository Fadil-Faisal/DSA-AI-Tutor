# LhamaLearns Backend & API Services ⚙️

In the LhamaLearns architecture, there is no separate Express or Python backend server running on a different port. Instead, we utilize a **Serverless monolith architecture** powered by **Next.js API Routes** (found in `/frontend/app/api`).

This directory (`/backend/`) serves as logical documentation for our data layer, code execution, and AI agent integrations.

## 🏗️ Architecture Overview

Our backend infrastructure relies on three core pillars:
1. **Next.js API Routes**: Serverless functions handling business logic, AI orchestration, and proxying.
2. **Supabase**: PostgreSQL database, Authentication, and Realtime WebSocket orchestration.
3. **AI Provider Fallback Mesh**: A resilient chain of LLMs (Ollama → Groq → Gemini).

---

## 🤖 The AI Agent Brain (`/api/agent`)

The core innovation of LhamaLearns is the Adaptive Tutor Agent. When a user submits code, the frontend sends a "Performance Snapshot" to `POST /api/agent`:

### Input Snapshot:
```json
{
  "problemId": "python-001",
  "code": "print('Hello')",
  "correct": true,
  "timeTaken": 45,
  "hintsUsed": 0,
  "attemptCount": 1,
  "confidence": { "arrays": 0.5, "trees": 0.5 }
}
```

### The Fallback Mesh
To guarantee the agent is always responsive, the backend attempts to generate the cognitive model update using three providers in sequence:
1. **Ollama (Llama 3)**: Hits `http://localhost:11434`. This is the primary provider. It runs locally, ensuring zero latency, zero cost, and complete privacy.
2. **Groq (Llama 3.3 70B)**: If Ollama isn't running, it falls back to Groq. Groq provides LPU-accelerated inference (~500+ tokens/second).
3. **Gemini (1.5 Flash)**: The final safety net using Google's API.

### Output:
The chosen LLM returns a structured JSON payload dictating the frontend's next move:
```json
{
  "reasoning": "You solved this quickly without hints. You understand basic syntax.",
  "feedback": "Great job! Let's move to something harder.",
  "decisionType": "next_problem",
  "confidenceUpdate": { "topic": "arrays", "delta": 0.08 },
  "nextProblemIndex": 1
}
```

---

## ⚡ Code Execution (`/api/run` & `/api/execute`)

We support Python, JavaScript, Java, and C++.
- **Demo Mode**: For the onboarding demo problems, code evaluation is done locally via fast string/regex heuristics to provide instant, sub-second feedback without server load.
- **Production Mode**: Connects to a secure sandbox (like Judge0) to compile, run, and evaluate user code against hidden test cases.

---

## 📡 Multiplayer & Data Layer (Supabase)

LhamaLearns uses Supabase for almost all persistent state and real-time networking:

### 1. Authentication
Handled via `@supabase/supabase-js`. Users can register and log in, storing their unique `uuid`.

### 2. Realtime Multiplayer (`[roomCode]`)
We utilize Supabase's Realtime Broadcast and Presence features to power the `/multiplayer` routes.
- **Cursor/Code Sync**: Keystrokes are broadcasted over WebSockets to peers in the same room.
- **Presence**: Tracks who is currently in the room (Mentors vs Students).
- **Mode Switching**: The room owner can seamlessly swap the room state between `collaborative` and `mentor` modes, instantly updating the UI for all connected clients.

---

## 🔑 Environment Variables Required

If you are developing backend features, ensure these are set in `frontend/.env`:
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3
GROQ_API_KEY=...
GEMINI_API_KEY=...
```
