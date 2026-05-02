# PlacementPrep — Product Requirements Document

## Original Problem Statement
Build a production-style, full-stack AI-powered placement preparation & career coaching platform called **PlacementPrep**. Modules: Aptitude, Reasoning, Communication, Coding, Interview, Resume, Revision. Plus: Dashboard, Admin panel, Smart Onboarding, Product Tour, Gamification.

## Constraints
- Backend: Python/FastAPI (not Node)
- Database: MongoDB via Motor
- No paid LLMs or email providers — everything must be local/free
- Real-time WebSockets supported
- Strict QA: zero partial fixes, full edge-case coverage

## Tech Stack
- Frontend: React, TailwindCSS, shadcn/ui, framer-motion, Monaco Editor, react-joyride
- Backend: FastAPI, Motor (MongoDB), JWT auth, WebSockets
- Testing: pytest (backend), Playwright (frontend via testing agent)

## User Persona
Strict "Principal Engineer / QA Lead" acting as PM. Expects end-to-end validation on every change.

## Architecture
```
/app/
├── backend/
│   ├── server.py              # FastAPI main (~860 lines, needs modularization)
│   ├── models.py              # Pydantic models
│   ├── auth.py                # JWT & password hashing
│   ├── question_bank.py       # Seeded aptitude/reasoning/coding data with difficulty
│   └── tests/                 # pytest suite (test_difficulty_filter.py added)
├── frontend/src/
│   ├── contexts/              # AuthContext, ThemeContext
│   ├── components/            # ProductTour, shadcn ui/
│   └── pages/                 # Module pages
└── memory/
    ├── PRD.md
    └── test_credentials.md
```

## Test Credentials
See `/app/memory/test_credentials.md` — `test@example.com / Test@123`.

---

## Implementation Status

### ✅ Completed
- Authentication (JWT register/login/reset-password flow)
- Dashboard with XP / streak / hire-readiness score
- Coding Module (Monaco editor, language switching, submission — stabilized)
- Professional blue/slate theme (replaced childish yellow/amber)
- Aptitude Module — **Topic → Difficulty → Mode → Test** flow (Feb 2026)
- Reasoning Module — **Topic → Difficulty → Mode → Test** flow (Feb 2026)
- Expanded question bank: 5+ hard questions per aptitude category, 4+ hard per reasoning
- Backend `GET /api/questions/{type}` now filters by `category` + `difficulty` + returns unique questions (no artificial duplication)
- CSS glass-bg bug fixed (`--glass-bg` was invalid HSL `255 255 255 / 0.05` → now `0 0% 100% / 0.05`)
- Product Tour via react-joyride
- Forgot Password dev-mode reset link
- Profile Picture + Resume file upload endpoints

### 🟡 In Progress / Next Priority (per user)
1. **Communication Module** (P1): fix voice recording → submission → analysis pipeline. Submit button should enable only when recording exists; fix "Analysis Failed" API error.
2. **Resume Module** (P1): replace hallucinated skills with real local NLP extraction (pdfplumber + curated skills keyword dictionary — user approved defaults).
3. **Interview Module** (P1): implement Chat + Audio dual-mode, fix "Failed to submit response" errors via WebSockets.
4. **Coding Module**: add difficulty-based question selection (parity with Aptitude/Reasoning).

### 🔵 Backlog / Future (P2–P3)
- Refactor `server.py` (860+ lines) into modular `APIRouter`s (`/app/backend/routes/...`)
- Intelligence Engine: dynamic skill-weight algorithms for personalized practice
- Admin panel full CRUD for questions / users
- Gamification: badges, leaderboards, daily challenges
- Revision module content expansion

### Known Low-Priority Issues (from iteration_4 review)
- `server.py` `get_questions` silently falls back if filter yields empty — consider 404
- `POST /api/attempts` returns success with score=0 when question lookup fails (masks bugs)
- `question_id` passed as title (not stable ID) — works via fallback lookup but fragile

## Key API Endpoints
- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/reset-password`
- `GET /api/questions/{type}?category=&difficulty=&count=`
- `POST /api/attempts`
- `POST /api/coding/submit`
- `WS /api/interview/ws` (partial)

## Key DB Schemas
- `users`: `{_id, email, password_hash, xp, streak, hire_readiness_score}`
- `attempts`: `{_id, user_id, module, score, xp_earned, data, timestamp}`
- `profiles`, `resumes`, `communication_attempts`

## Testing
- pytest suite at `/app/backend/tests/`
- Test reports: `/app/test_reports/iteration_{1..4}.json`
- Iteration 4 (Feb 2026): 9/9 backend tests PASS, full Aptitude+Reasoning 4-step frontend flow PASS

---

## Changelog (recent)
- **Feb 2026** — Difficulty Selection System shipped for Aptitude & Reasoning; CSS glass-bg fixed; question bank expanded; unique-question guarantee added.
- **Prev** — Coding module stabilized (language switch, submission); theme refactored to blue/slate; product tour added; profile/resume upload scaffolding.
