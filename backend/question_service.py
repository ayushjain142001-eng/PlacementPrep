"""Unified question service.

Combines:
  - Curated seed questions (question_bank.py) — high quality, hand-written
  - Cached AI-generated questions (MongoDB `question_cache` collection)
  - On-demand Gemini generation when pool is exhausted

Provides session-based non-repetition by accepting a list of `seen_ids`.
"""
from __future__ import annotations

import hashlib
import logging
import random
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from question_bank import QuestionBank
from topic_catalog import get_topic, get_category
import ai_service

logger = logging.getLogger(__name__)


# Map seed-question titles → topic ids. Falls back to None.
_TITLE_TOPIC_HINTS = [
    ("simple interest", "simple-interest"),
    ("compound interest", "compound-interest"),
    ("percentage", "percentage"),
    ("profit and loss", "profit-loss"),
    ("discount", "profit-loss"),
    ("time and work", "time-work"),
    ("pipes and cisterns", "pipes-cisterns"),
    ("speed distance time", "speed-distance"),
    ("boats and streams", "boats-streams"),
    ("ratio and proportion", "ratio-proportion"),
    ("average", "average"),
    ("age problem", "ages"),
    ("mixture problem", "mixture-allegation"),
    ("alligation", "mixture-allegation"),
    ("area calculation", "area-perimeter"),
    ("probability", "probability"),
    ("permutation", "permutation-combination"),
    ("number system", "number-system"),
    ("time calculation", "clock"),
    # logical
    ("blood relation", "blood-relations"),
    ("direction sense", "direction-sense"),
    ("coding-decoding", "coding-decoding"),
    ("complex coding", "coding-decoding"),
    ("analogy", "analogy"),
    ("syllogism", "syllogism"),
    ("calendar", "calendar"),
    ("clock problem", "clock"),
    ("ranking", "ranking"),
    ("complex rank", "ranking"),
    ("letter series", "series"),
    ("number series", "series"),
    ("seating", "seating-arrangement"),
    ("circular arrangement", "seating-arrangement"),
    ("venn diagram", "puzzles"),
    ("odd one out", "classification"),
    # verbal
    ("synonym", "synonyms"),
    ("antonym", "antonyms"),
    ("sentence correction", "sentence-correction"),
    ("idiom", "vocabulary"),
    ("one word", "vocabulary"),
    ("phrasal verb", "vocabulary"),
    ("spelling", "error-detection"),
    ("fill in the blank", "fill-blanks"),
    ("reading comprehension", "reading-comprehension"),
    ("active passive", "active-passive"),
    ("para jumble", "para-jumbles"),
    ("sentence rearrangement", "para-jumbles"),
]


def _infer_topic(title: str) -> Optional[str]:
    t = (title or "").lower()
    for needle, tid in _TITLE_TOPIC_HINTS:
        if needle in t:
            return tid
    return None


def question_id(q: Dict[str, Any]) -> str:
    """Stable id based on question content."""
    raw = f"{q.get('category', '')}|{q.get('topic', '')}|{q.get('title', '')}|{q.get('description', '')}"
    return hashlib.sha1(raw.encode("utf-8")).hexdigest()[:16]


def _decorate(q: Dict[str, Any]) -> Dict[str, Any]:
    out = dict(q)
    out["id"] = question_id(q)
    out.pop("_id", None)
    return out


def _seed_pool(category: str, topic: Optional[str], difficulty: Optional[str], module: str) -> List[Dict[str, Any]]:
    """Pull from curated seed bank with topic auto-inference."""
    pool: List[Dict[str, Any]] = []
    src = QuestionBank.APTITUDE_QUESTIONS if module == "aptitude" else QuestionBank.REASONING_QUESTIONS
    for q in src:
        if q.get("category") != category:
            continue
        q_topic = q.get("topic") or _infer_topic(q.get("title", ""))
        if topic and q_topic != topic:
            continue
        if difficulty and q.get("difficulty") != difficulty:
            continue
        cleaned = {**q, "topic": q_topic or topic, "source": q.get("source", "seed")}
        pool.append(cleaned)
    return pool


async def _cache_pool(db, category: str, topic: str, difficulty: str) -> List[Dict[str, Any]]:
    cursor = db.question_cache.find(
        {"category": category, "topic": topic, "difficulty": difficulty},
        {"_id": 0},
    )
    return [doc async for doc in cursor]


async def _store_cache(db, questions: List[Dict[str, Any]]) -> None:
    if not questions:
        return
    docs = []
    for q in questions:
        doc = dict(q)
        doc["question_hash"] = question_id(doc)
        doc["created_at"] = datetime.now(timezone.utc).isoformat()
        docs.append(doc)
    try:
        # Avoid duplicates via upsert by hash
        for doc in docs:
            await db.question_cache.update_one(
                {"question_hash": doc["question_hash"]},
                {"$setOnInsert": doc},
                upsert=True,
            )
    except Exception as e:
        logger.warning("Failed to cache generated questions: %s", e)


async def get_questions(
    db,
    *,
    module: str,           # 'aptitude' or 'reasoning'
    category: str,
    topic: Optional[str] = None,
    difficulty: str = "medium",
    count: int = 10,
    seen_ids: Optional[List[str]] = None,
    subtopic: Optional[str] = None,
    allow_generation: bool = True,
) -> List[Dict[str, Any]]:
    """Return up to `count` unique questions, excluding any in `seen_ids`."""
    seen = set(seen_ids or [])

    # 1. Seed + cache pool
    pool = _seed_pool(category, topic, difficulty, module)
    if topic:
        pool += await _cache_pool(db, category, topic, difficulty)

    # Decorate + dedupe by id
    decorated: Dict[str, Dict[str, Any]] = {}
    for q in pool:
        d = _decorate(q)
        if d["id"] not in seen:
            decorated[d["id"]] = d

    available = list(decorated.values())

    # 2. If we have enough, return shuffled
    if len(available) >= count:
        random.shuffle(available)
        return available[:count]

    # 3. Need more — generate via Gemini if allowed and topic is provided
    needed = count - len(available)
    if allow_generation and topic:
        topic_obj = get_topic(category, topic)
        topic_name = topic_obj["name"] if topic_obj else topic
        try:
            generated = await ai_service.generate_questions(
                category=category,
                topic=topic,
                topic_name=topic_name,
                difficulty=difficulty,
                count=max(needed + 2, 5),  # buffer
                subtopic=subtopic,
            )
        except Exception as e:
            logger.error("AI generation failed: %s", e)
            generated = []

        if generated:
            await _store_cache(db, generated)
            for q in generated:
                d = _decorate(q)
                if d["id"] not in seen and d["id"] not in decorated:
                    decorated[d["id"]] = d
            available = list(decorated.values())

    random.shuffle(available)
    return available[:count]
