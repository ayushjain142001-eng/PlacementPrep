# PlacementPrep — Product Requirements Document

## Original Problem Statement
Full-stack AI-powered placement prep platform. Modules: Aptitude, Reasoning, Communication, Coding, Interview, Resume, Revision, plus Dashboard, AI Chatbot, Developer Profile, Leaderboard.

## Constraints
- Backend: Python/FastAPI, MongoDB (Motor)
- LLM: Google Gemini 2.5 Pro via Emergent Universal Key
- JWT auth (existing — secure, not migrated to 3rd-party)
- Strict QA: production-ready reliability

## Architecture
```
/app/
├── backend/
│   ├── server.py              # FastAPI main (~1050 lines)
│   ├── auth.py, models.py     # JWT + Pydantic
│   ├── topic_catalog.py       # 52 topics
│   ├── question_bank.py       # Curated seed
│   ├── question_service.py    # Seed + cache + Gemini pipeline
│   ├── ai_service.py          # Gemini wrappers
│   ├── code_executor.py       # NEW: Python subprocess sandbox
│   └── tests/                 # pytest (iter1-6 suites)
├── frontend/src/
│   ├── components/Chatbot.js, Layout.js
│   └── pages/                 # AptitudeModule, CodingModule, ResumeModule (coming soon), DeveloperPage, …
└── memory/PRD.md, test_credentials.md
```

## Test Credentials
`/app/memory/test_credentials.md` — `test@example.com / Test@123`

---

## Implementation Status

### ✅ Completed (Feb 2026)

**Iteration 6 — FINAL Stabilization Pass**
- 🚨 **Coding evaluator FIXED**: was returning hardcoded [True,True,False]→75% for any code. Now uses real Python subprocess sandbox with 6s timeout, JSON I/O harness, robust list/numeric comparison, boilerplate detection
- 🚨 **Communication /analyze FIXED**: was expecting query params, frontend sends JSON body → 422 silent failure. Now uses `CommunicationAnalyzeRequest` Pydantic body model
- 🚨 **Interview /respond FIXED**: same query-params-vs-body bug as Communication. Now uses `InterviewRespondRequest`
- **Resume module**: replaced with honest "Coming Soon" page — no fake hallucinated skills
- **Developer page**: tech stack section removed, About widened
- **Leaderboard**: "XP" → "Practice Points" (11 occurrences + sidebar)
- **Theme palette**: applied user's exact spec (Dark #0F172A/#1E293B/#3B82F6, Light #F8FAFC/#FFFFFF/#2563EB)
- **Error toasts**: now display backend's `detail` message instead of generic "Failed"
- **Coding language selector**: JS/Java/C++ disabled with "(coming soon)" since only Python is supported in the sandbox
- **CodingModule UI**: submission results card rewritten with `passed/total/is_correct/error` fields

**Iteration 5 — Major Upgrade**
- 52-topic Aptitude catalog (27 Quant + 15 Logical + 10 Verbal), each with 2-4 subtopics × 3 difficulties
- Gemini 2.5 Pro question generation with MongoDB cache + session-based `seen_ids` non-repetition
- AI Chatbot floating widget (per-user session isolation, multi-turn context via inlined transcript)
- Developer profile page with AJ monogram avatar
- New endpoints: `/api/catalog/*`, `/api/questions/topic`, `/api/chatbot/*`

**Earlier iterations**
- Iter 4: Difficulty system, glass-bg CSS fix, hard-tier question expansion
- Iter 3 & earlier: Coding stabilization, theme refactor, Product Tour, forgot-password, profile/resume scaffolding

### 🟡 Remaining
- **Revision module** UX redesign (P1)
- **Guide page** content verification (P2)
- **server.py refactor** to `/routes/*.py` (P2 — file is now ~1050 lines)
- Pre-warm Gemini cache for all 81 quant cells (background script)
- Sweep remaining `violet-*`/`purple-*` Tailwind classes for full theme consistency

## Testing
- 6 iterations of testing-agent runs, plus pytest suites in `/app/backend/tests/`
- **Iter 6**: 15/15 backend tests PASS, ~95% frontend (one display bug fixed post-test)
- Verified: coding boilerplate=0%, correct solution=100%, communication body, interview body, theme palette, language disable, error toasts

---

## Changelog
- **Feb 2026 (iter 6, FINAL)** — Coding evaluator subprocess sandbox; Communication/Interview body-model fixes; Resume → Coming Soon; Developer trimmed; Leaderboard relabeled; theme palette applied to user spec; CodingModule UI sync.
- **Feb 2026 (iter 5)** — 52-topic catalog, Gemini gen + chatbot, Developer profile, per-user session isolation.
- **Feb 2026 (iter 4)** — Difficulty system + glass-bg CSS fix.
- **Earlier** — Coding stabilization, theme refactor, product tour, profile/resume scaffolding.
