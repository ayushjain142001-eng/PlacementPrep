"""Gemini-backed AI service: question generation + chatbot.

Uses emergentintegrations.LlmChat with the EMERGENT_LLM_KEY universal key.
Architecture is provider-agnostic — model and provider are read from env so
swap-out is trivial.
"""
from __future__ import annotations

import json
import logging
import os
import re
import uuid
from typing import Any, Dict, List, Optional

from emergentintegrations.llm.chat import LlmChat, UserMessage

logger = logging.getLogger(__name__)

LLM_PROVIDER = os.environ.get("LLM_PROVIDER", "gemini")
LLM_MODEL = os.environ.get("LLM_MODEL", "gemini-2.5-pro")


def _api_key() -> str:
    key = os.environ.get("EMERGENT_LLM_KEY")
    if not key:
        raise RuntimeError("EMERGENT_LLM_KEY missing in backend/.env")
    return key


# ---------------- Question Generation ----------------

QUESTION_GEN_SYSTEM = (
    "You are a senior placement-prep question setter. You produce realistic, "
    "exam-style multiple-choice questions for engineering campus placements "
    "(TCS, Infosys, Wipro, Capgemini level). "
    "Follow these rules strictly: "
    "1) Output ONLY a valid JSON array, no markdown, no commentary. "
    "2) Each question must be solvable from the given options. "
    "3) The 'correct_answer' MUST exactly match one of the strings in 'options'. "
    "4) Difficulty must match the requested level: "
    "   easy = direct formula application; "
    "   medium = 2-step reasoning; "
    "   hard = multi-step / trick / placement-grade. "
    "5) No duplicate options. No giveaway phrasing."
)

QUESTION_SCHEMA_HINT = (
    'Return JSON like: [{"title": "...", "description": "...", '
    '"options": ["A", "B", "C", "D"], "correct_answer": "B", '
    '"difficulty": "medium", "category": "<id>", "topic": "<topic_id>", '
    '"points": 15, "time_limit": 75}]'
)


async def generate_questions(
    *,
    category: str,
    topic: str,
    topic_name: str,
    difficulty: str,
    count: int = 5,
    subtopic: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """Generate `count` placement-style questions for a (topic, difficulty)."""
    points = {"easy": 10, "medium": 15, "hard": 20}.get(difficulty, 15)
    time_limit = {"easy": 60, "medium": 90, "hard": 120}.get(difficulty, 90)

    sub_clause = f' (subtopic: "{subtopic}")' if subtopic else ""
    prompt = (
        f"Generate {count} unique {difficulty} multiple-choice questions on the topic "
        f'"{topic_name}"{sub_clause} from {category} aptitude. '
        f'Each question MUST have exactly 4 distinct options, one correct. '
        f'Set "category" to "{category}", "topic" to "{topic}", '
        f'"difficulty" to "{difficulty}", "points" to {points}, "time_limit" to {time_limit}. '
        f"{QUESTION_SCHEMA_HINT}"
    )

    chat = LlmChat(
        api_key=_api_key(),
        session_id=f"qgen-{uuid.uuid4()}",
        system_message=QUESTION_GEN_SYSTEM,
    ).with_model(LLM_PROVIDER, LLM_MODEL)

    try:
        raw = await chat.send_message(UserMessage(text=prompt))
    except Exception as e:
        logger.error("Question generation LLM call failed: %s", e)
        return []

    parsed = _parse_question_json(raw)
    return _validate_and_clean(parsed, category=category, topic=topic, difficulty=difficulty)


def _parse_question_json(raw: str) -> List[Dict[str, Any]]:
    if not raw:
        return []
    text = raw.strip()
    # Strip markdown fences if present
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        # fall back: try to find first JSON array in the text
        match = re.search(r"\[[\s\S]*\]", text)
        if not match:
            logger.warning("Could not parse LLM question output: %s", text[:200])
            return []
        try:
            data = json.loads(match.group(0))
        except json.JSONDecodeError:
            return []
    return data if isinstance(data, list) else []


def _validate_and_clean(
    questions: List[Dict[str, Any]], *, category: str, topic: str, difficulty: str
) -> List[Dict[str, Any]]:
    cleaned: List[Dict[str, Any]] = []
    for q in questions:
        if not isinstance(q, dict):
            continue
        title = (q.get("title") or "").strip()
        description = (q.get("description") or "").strip()
        options = q.get("options") or []
        correct = q.get("correct_answer")
        if not title or not description or not isinstance(options, list):
            continue
        # Coerce options to strings, dedupe
        opts = []
        seen = set()
        for o in options:
            s = str(o).strip()
            if s and s not in seen:
                seen.add(s)
                opts.append(s)
        if len(opts) < 2 or correct not in opts:
            continue
        cleaned.append({
            "title": title,
            "description": description,
            "options": opts[:4] if len(opts) >= 4 else opts,
            "correct_answer": str(correct),
            "difficulty": difficulty,
            "category": category,
            "topic": topic,
            "points": int(q.get("points") or {"easy": 10, "medium": 15, "hard": 20}.get(difficulty, 15)),
            "time_limit": int(q.get("time_limit") or {"easy": 60, "medium": 90, "hard": 120}.get(difficulty, 90)),
            "source": "ai-generated",
        })
    return cleaned


# ---------------- Chatbot ----------------

CHATBOT_SYSTEM = (
    "You are Ayush's AI Assistant for the PlacementPrep platform. "
    "You help students with aptitude, reasoning, coding (DSA & syntax), "
    "interview preparation (HR / technical / behavioural), resume tips, "
    "and platform navigation. "
    "Respond conversationally, warmly, and concisely (max ~120 words unless "
    "asked for a longer explanation). Use clear bullet points or numbered "
    "steps for solutions. If a user asks something off-topic, gently redirect "
    "to placement preparation. Never claim to be a real person or any other AI."
)


async def chatbot_reply(*, session_id: str, history: List[Dict[str, str]], user_text: str) -> str:
    """Generate a chatbot reply.

    `history` is a list of {role, content} dicts from the database (oldest-first),
    NOT including the current user message. Since LlmChat is stateless across
    instances, we inline the recent history as context in the system prompt
    rather than calling the LLM once per past turn (slow + costs tokens).
    """
    # Build a compact transcript of the recent ~12 turns
    recent = history[-12:]
    transcript_lines: List[str] = []
    for msg in recent:
        role = msg.get("role", "user")
        content = (msg.get("content") or "").strip()
        if not content:
            continue
        speaker = "Student" if role == "user" else "Assistant"
        transcript_lines.append(f"{speaker}: {content}")
    transcript = "\n".join(transcript_lines)

    system = CHATBOT_SYSTEM
    if transcript:
        system = (
            CHATBOT_SYSTEM
            + "\n\n--- Recent conversation (for context) ---\n"
            + transcript
            + "\n--- End of context ---\n"
            + "Continue the conversation naturally."
        )

    chat = LlmChat(
        api_key=_api_key(),
        session_id=session_id,
        system_message=system,
    ).with_model(LLM_PROVIDER, LLM_MODEL)

    try:
        reply = await chat.send_message(UserMessage(text=user_text))
        return (reply or "").strip()
    except Exception as e:
        logger.error("Chatbot LLM call failed: %s", e)
        return (
            "I'm having trouble reaching my AI brain right now. "
            "Please try again in a moment."
        )
