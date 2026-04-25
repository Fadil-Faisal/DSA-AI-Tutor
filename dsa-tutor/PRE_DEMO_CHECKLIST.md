# Pre-Demo Checklist — Adaptive DSA Tutor Agent
## AAYAM 2026 · Run this 1 hour before judging begins

---

### ✅ ENVIRONMENT CHECK (5 min)
- [ ] `.env.local` exists and has all 7 variables (OLLAMA_BASE_URL, GROQ_API_KEY, GEMINI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_JUDGE0_URL)
- [ ] Run: `node -e "require('dotenv').config({path:'.env.local'}); console.log(Object.keys(process.env).filter(k => k.includes('SUPABASE') || k.includes('GROQ') || k.includes('GEMINI') || k.includes('OLLAMA')))"` — verify all keys appear
- [ ] `.env.local` is in `.gitignore` — run `git status` and confirm it does NOT appear as a tracked file
- [ ] Ollama is running on the demo laptop — run: `curl http://localhost:11434/api/tags` — verify you get a JSON list of models
- [ ] Verify Ollama has a model pulled — run: `ollama list` — at minimum one model should appear (e.g. `llama3.2` or `mistral`)

---

### ✅ DATABASE CHECK (5 min)
- [ ] Open Supabase dashboard → Table Editor
- [ ] Confirm all 6 tables exist: `learner_profiles`, `problem_attempts`, `problems_bank`, `agent_decisions`, `rooms`, `room_members`
- [ ] Open `problems_bank` table — verify at least 15 rows exist (30 preferred)
- [ ] If problems table is empty: run `npx ts-node scripts/seed-problems.ts` now
- [ ] Confirm Realtime is enabled on `room_members` — go to Database → Replication → verify `room_members` appears in the publication list

---

### ✅ AI SERVICES CHECK (5 min)
- [ ] Test Ollama (primary): `curl http://localhost:11434/api/generate -d '{"model":"llama3.2","prompt":"say hi","stream":false}'` — should return a JSON with `response` field
- [ ] Test Groq (fallback 1): `curl https://api.groq.com/openai/v1/models -H "Authorization: Bearer $GROQ_API_KEY"` — should return a list of models
- [ ] Test Gemini (fallback 2): run `npx ts-node -e "import('./lib/agent/gemini').then(m => m.geminiChat('say hello').then(console.log))"` — should print a greeting
- [ ] Test Judge0: `curl https://ce.judge0.com/about` — should return a JSON with version info. If it returns an error, note the fallback: the app will still run but code execution tests will fail

---

### ✅ API ROUTES CHECK — Run these with Postman (10 min)
Run these in order. Each must return 200/201 before moving to the next.

- [ ] `GET /api/quiz` → 200, returns 5 questions, no `correctOption` field exposed
- [ ] `POST /api/quiz` (submit all correct) → 200, `overallScore: 5`, `aiFeedback` is a non-empty string
- [ ] `POST /api/agent` → 200, response has `problem` object and `reasoning` string
- [ ] `POST /api/evaluate` (correct solution) → 200, `correct: true`
- [ ] `POST /api/evaluate` (wrong solution) → 200, `correct: false`, `mistakePattern` is present
- [ ] `POST /api/hint` (level 1) → 200, `hint` is a non-empty string
- [ ] `POST /api/hint` (level 2) → 200, different and longer hint
- [ ] `POST /api/hint` (level 3) → 200, pseudocode-style hint
- [ ] `GET /api/learner?sessionId=test-session-001` → 200, confidence scores visible
- [ ] `POST /api/rooms` (create) → 201, `roomCode` is 6 chars, save it
- [ ] `PATCH /api/rooms` (join with second session) → 200, `status: active`
- [ ] `GET /api/rooms?roomCode=<saved>` → 200, 2 members in array
- [ ] `PUT /api/rooms` (update code) → 200, `success: true`
- [ ] `POST /api/execute` (Python hello world) → 200, `results[0].passed: true`

---

### ✅ FALLBACK CHAIN CHECK (3 min)
- [ ] Temporarily stop Ollama: `ollama stop` or kill the process
- [ ] Call `POST /api/agent` — it should still return 200 (falling back to Groq)
- [ ] Check server logs — you should see: `"Primary AI (Ollama) failed, trying Groq..."`
- [ ] Restart Ollama: `ollama serve`
- [ ] Confirm `/api/agent` still works after Ollama is back

---

### ✅ MULTIPLAYER CHECK (5 min)
- [ ] Open two browser tabs pointing to the app (or use two Postman requests in sequence)
- [ ] Tab 1: Create a room (`POST /api/rooms`) — copy the `roomCode`
- [ ] Tab 2: Join the room (`PATCH /api/rooms`) with a different `sessionId`
- [ ] Tab 1: Call `PUT /api/rooms` with some code text
- [ ] Tab 2: Call `GET /api/rooms?roomCode=<code>` — verify `members[0].currentCode` reflects what Tab 1 sent
- [ ] (If Supabase Realtime is integrated in the frontend) Open two browser windows, type in one, verify the other updates in real-time within 1–2 seconds

---

### ✅ EXPLANATION MODE CHECK (2 min)
- [ ] Call `POST /api/hint` with `"explanationMode": "simple"` — response should use plain language and analogies, no jargon
- [ ] Call `POST /api/hint` with `"explanationMode": "complex"` — response should mention algorithm names, complexity notation
- [ ] Call `POST /api/evaluate` with both modes — verify feedback tone changes

---

### ✅ FINAL APP CHECK (5 min)
- [ ] Run `npm run build` — confirm zero TypeScript errors and zero build errors
- [ ] Run `npm run dev` — confirm app starts on port 3000 with no errors in terminal
- [ ] Open `http://localhost:3000` in browser — confirm the UI loads without white-screen or console errors
- [ ] Complete a full user flow: Onboarding quiz → Solve a problem → Get a hint → Submit → See feedback → View dashboard
- [ ] Open browser DevTools (F12) → Network tab — confirm no API calls are returning 500 errors

---

### 🚨 EMERGENCY FALLBACKS (if something breaks during the demo)
- **Ollama is down:** Comment out the Ollama primary call in `withFallback.ts` temporarily — Groq becomes primary. Takes 30 seconds.
- **Groq rate limited:** The `withFallback` wrapper automatically falls to Gemini. No code change needed. If Gemini also fails, check `.env.local` keys.
- **Judge0 is down:** Demo code execution by showing the Postman response from earlier in the day (screenshot). Judge0 is a free public service with occasional downtime.
- **Supabase Realtime not working:** Demo multiplayer using manual API calls in Postman — show both `PUT /api/rooms` and `GET /api/rooms` side by side to simulate live sync.
- **Database empty:** Run `npx ts-node scripts/seed-problems.ts` — takes under 10 seconds.
- **Port 3000 already in use:** Run `lsof -ti:3000 | xargs kill -9` then `npm run dev`

---

### 📋 JUDGE DEMO SCRIPT (talking points)
1. **"The agent picks the next problem based on the student's weakest topic"** → Show the reasoning panel text returned by `/api/agent`
2. **"It adapts to two completely different learner levels"** → Demo simple mode vs complex mode feedback side by side
3. **"It remembers mistake patterns across sessions"** → Submit the same wrong code twice → show `mistakePattern` in the response
4. **"Students can practice together in real-time"** → Show the multiplayer room with two browser tabs
5. **"Ollama runs 100% locally — no API costs, no rate limits"** → Show Ollama model running with `ollama ps`

---

*Generated for AAYAM 2026 · Adaptive DSA Tutor Agent · Backend: Fadil Faisal*