# PlacementPrep — Product Requirements Document

## Original Problem Statement
Build a production-style, full-stack AI-powered placement preparation & career coaching platform called **PlacementPrep**. Modules: Aptitude, Reasoning, Communication, Coding, Interview, Resume, Revision. Plus: Dashboard, Admin panel, Smart Onboarding, Product Tour, Gamification, AI Chatbot, and Developer Profile.

## Constraints
- Backend: Python/FastAPI (not Node)
- Database: MongoDB via Motor
- LLM: Google Gemini 2.5 Pro via Emergent Universal Key (free for the user)
- Real-time WebSockets supported
- Strict QA: zero partial fixes, full edge-case coverage

## Tech Stack
- Frontend: React, TailwindCSS, shadcn/ui, framer-motion, Monaco Editor, react-joyride, lucide-react
- Backend: FastAPI, Motor (MongoDB), JWT auth, WebSockets, emergentintegrations (Gemini)
- Testing: pytest (backend), Playwright (frontend via testing agent)

## Architecture
```
/app/
├── backend/
│   ├── server.py              # FastAPI main (~1000 lines, refactor pending)
│   ├── models.py              # Pydantic models
│   ├── auth.py                # JWT & password hashing
│   ├── topic_catalog.py       # 52-topic catalog (27 quant + 15 logical + 10 verbal)
│   ├── question_bank.py       # Curated seed questions
│   ├── question_service.py    # Hybrid pipeline: seed + cache + Gemini generation
│   ├── ai_service.py          # Gemini wrappers: generate_questions(), chatbot_reply()
│   └── tests/                 # pytest suite
├── frontend/src/
│   ├── contexts/              # AuthContext, ThemeContext
│   ├── components/
│   │   ├── Chatbot.js         # Floating AI assistant widget (per-user session)
│   │   └── Layout.js          # App layout with sidebar
│   └── pages/
│       ├── AptitudeModule.js  # Cat→Topic→Subtopic→Difficulty→Mode→Test flow
│       ├── DeveloperPage.js   # Ayush Jain profile with AJ monogram avatar
│       └── …
└── memory/PRD.md
```

## Test Credentials
`/app/memory/test_credentials.md` — `test@example.com / Test@123`

---

## Implementation Status

### ✅ Completed (Feb 2026 — major upgrade)
**Phase 1 — Aptitude Restructure**
- 52-topic catalog: Quantitative (27), Logical Reasoning (15), Verbal Ability (10)
- Each topic exposes 2–4 subtopics + 3 difficulty levels
- New flow: Category → Topic → Subtopic (optional) → Difficulty → Mode → Test
- Topic search filter on the topics screen
- Hybrid question pipeline: curated seed + MongoDB cache + Gemini generation
- Session-based non-repetition via `seen_ids` array
- `/api/catalog/{module}` and `/api/catalog/{module}/{cat}/topics`
- `/api/questions/topic` smart endpoint

**Phase 2 — AI Assistant Chatbot**
- Floating chatbot widget mounted globally, available across all routes
- Gemini 2.5 Pro via Emergent Universal Key (`emergentintegrations.LlmChat`)
- Dynamic greeting using logged-in user's name
- Multi-turn context (last 12 turns inlined as transcript — fast + cheap)
- Per-user session id stored in localStorage (namespaced — no cross-user leakage)
- `/api/chatbot/message`, `/api/chatbot/history`, `/api/chatbot/session` (DELETE)
- Messages persisted in MongoDB `chatbot_messages` collection
- Typing dots, smooth animations, dark/light theme support, mobile responsive

**Phase 3 — Developer Profile + Polish**
- `/developer` route with hero, about, tech stack, vision, contribute sections
- Animated AJ monogram avatar (ready for real photo swap-in later)
- Sidebar nav link added
- Babel `<dynamic.icon />` JSX issue fixed with explicit icon switch components

**Earlier (this session)**
- Coding module stabilized (language switch, submission)
- Aptitude/Reasoning difficulty system foundation + glass-bg CSS bug fix
- Question bank expanded for hard tier
- Theme refactored to professional blue/slate
- Product Tour, Forgot Password, Profile/Resume upload

### 🟡 Next Up (per remaining priorities)
1. **Communication Module** (P1) — fix voice recording → submit pipeline (still broken)
2. **Resume Module** (P1) — real local PDF NLP extraction (replace hallucinated skills)
3. **Interview Module** (P1) — Chat + Audio dual-mode via WebSockets
4. **Coding Module** (P2) — extend new topic/difficulty flow
5. **server.py refactor** (P2) — split ~1000 lines into `/routes/*.py`

### 🔵 Backlog
- Recommended-difficulty AI based on user accuracy
- Admin CRUD panel polish, gamification, Revision content
- spaCy NER for resume (heavier alternative)

## Key API Endpoints (added in this iteration)
- `GET  /api/catalog/{module}` — categories with topic counts
- `GET  /api/catalog/{module}/{category}/topics`
- `POST /api/questions/topic` — smart hybrid question fetch with `seen_ids` dedup
- `POST /api/chatbot/message`
- `GET  /api/chatbot/history?session_id=`
- `DELETE /api/chatbot/session?session_id=`

## Key DB Schemas (new collections)
- `question_cache`: `{question_hash, category, topic, difficulty, title, description, options, correct_answer, source, created_at}`
- `chatbot_messages`: `{id, user_id, session_id, role, content, created_at}`

## Testing
- pytest suite at `/app/backend/tests/` (test_difficulty_filter.py + test_iter5.py)
- Latest: iteration_5.json — **9/9 backend pass, 100% frontend E2E pass**

---

## Changelog
- **Feb 2026 (iter 5)** — Major upgrade: 52-topic Aptitude catalog, Gemini-powered question gen + chatbot, Developer profile page, per-user chatbot session isolation, fixed visual-edit babel plugin compile error in DeveloperPage.
- **Feb 2026 (iter 4)** — Difficulty system for Aptitude/Reasoning, glass-bg CSS fix, question bank hard-tier expansion.
- **Earlier** — Coding stabilization, theme refactor, product tour, profile/resume scaffolding.
