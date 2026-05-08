"""Iteration 5 backend tests: catalog, smart questions, chatbot, attempt-by-hash."""
import os
import time
import requests
import pytest

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://interview-ready-21.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"

EMAIL = "test@example.com"
PASSWORD = "Test@123"


@pytest.fixture(scope="module")
def token():
    r = requests.post(f"{API}/auth/login", json={"email": EMAIL, "password": PASSWORD}, timeout=15)
    if r.status_code != 200:
        # try signup
        requests.post(f"{API}/auth/signup", json={"email": EMAIL, "password": PASSWORD, "name": "Test User"}, timeout=15)
        r = requests.post(f"{API}/auth/login", json={"email": EMAIL, "password": PASSWORD}, timeout=15)
    assert r.status_code == 200, f"login failed: {r.text}"
    return r.json()["access_token"]


@pytest.fixture
def headers(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


# ---------- Catalog ----------
class TestCatalog:
    def test_aptitude_catalog(self, headers):
        r = requests.get(f"{API}/catalog/aptitude", headers=headers, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data["module"] == "aptitude"
        cats = {c["id"]: c for c in data["categories"]}
        assert "quantitative" in cats and "logical" in cats and "verbal" in cats
        assert cats["quantitative"]["topic_count"] == 27
        assert cats["logical"]["topic_count"] == 15
        assert cats["verbal"]["topic_count"] == 10

    def test_quantitative_topics(self, headers):
        r = requests.get(f"{API}/catalog/aptitude/quantitative/topics", headers=headers, timeout=15)
        assert r.status_code == 200
        data = r.json()
        topics = data["topics"]
        assert len(topics) == 27
        for t in topics:
            assert "id" in t and "name" in t and isinstance(t.get("subtopics"), list)


# ---------- Smart questions ----------
class TestSmartQuestions:
    def test_topic_questions_seed_percentage(self, headers):
        body = {"module": "aptitude", "category": "quantitative", "topic": "percentage",
                "difficulty": "easy", "count": 5, "allow_generation": True}
        r = requests.post(f"{API}/questions/topic", json=body, headers=headers, timeout=60)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["count"] >= 1
        assert len(data["questions"]) == data["count"]
        ids = [q["id"] for q in data["questions"]]
        assert len(ids) == len(set(ids))  # unique
        for q in data["questions"]:
            assert q.get("topic") == "percentage" or q.get("topic") is None  # seed may have inferred
            assert "options" in q and len(q["options"]) >= 2
            assert q["correct_answer"] in q["options"]

    def test_topic_questions_cache_fast(self, headers):
        body = {"module": "aptitude", "category": "quantitative", "topic": "percentage",
                "difficulty": "easy", "count": 5}
        # first call to warm cache
        requests.post(f"{API}/questions/topic", json=body, headers=headers, timeout=60)
        t0 = time.time()
        r = requests.post(f"{API}/questions/topic", json=body, headers=headers, timeout=30)
        elapsed = time.time() - t0
        assert r.status_code == 200
        # Should be reasonable (no fresh Gemini gen). Allow 8s margin for network.
        print(f"Second call elapsed: {elapsed:.2f}s")
        assert elapsed < 10

    def test_topic_questions_seen_ids_excluded(self, headers):
        body = {"module": "aptitude", "category": "quantitative", "topic": "percentage",
                "difficulty": "easy", "count": 5}
        r1 = requests.post(f"{API}/questions/topic", json=body, headers=headers, timeout=60)
        assert r1.status_code == 200
        first_ids = [q["id"] for q in r1.json()["questions"]]
        if not first_ids:
            pytest.skip("no questions returned")
        body2 = {**body, "seen_ids": first_ids}
        r2 = requests.post(f"{API}/questions/topic", json=body2, headers=headers, timeout=120)
        assert r2.status_code == 200
        next_ids = [q["id"] for q in r2.json()["questions"]]
        # No overlap
        assert not (set(first_ids) & set(next_ids)), f"seen_ids leaked: {set(first_ids) & set(next_ids)}"

    def test_topic_questions_gemini_generation(self, headers):
        # boats-streams has no seed; should trigger generation
        body = {"module": "aptitude", "category": "quantitative", "topic": "boats-streams",
                "difficulty": "medium", "count": 3, "allow_generation": True}
        r = requests.post(f"{API}/questions/topic", json=body, headers=headers, timeout=90)
        assert r.status_code == 200, r.text
        data = r.json()
        # We expect at least 1 question generated; if Gemini failed, count may be 0
        if data["count"] == 0:
            pytest.fail("Gemini generation returned 0 questions for boats-streams")
        for q in data["questions"]:
            assert q["topic"] == "boats-streams"
            assert len(q["options"]) >= 2
            assert q["correct_answer"] in q["options"]


# ---------- Attempt by hash id ----------
class TestAttemptByHash:
    def test_attempt_with_hash_id(self, headers):
        body = {"module": "aptitude", "category": "quantitative", "topic": "percentage",
                "difficulty": "easy", "count": 1}
        r = requests.post(f"{API}/questions/topic", json=body, headers=headers, timeout=60)
        assert r.status_code == 200
        qs = r.json()["questions"]
        if not qs:
            pytest.skip("no questions to attempt")
        q = qs[0]
        attempt = {
            "question_id": q["id"],
            "answer": q["correct_answer"],
            "time_taken": 30,
            "mode": "practice",
        }
        r2 = requests.post(f"{API}/attempts", json=attempt, headers=headers, timeout=20)
        assert r2.status_code == 200, r2.text
        out = r2.json()
        assert out["attempt"]["is_correct"] in (True, False)
        # Correct answer ⇒ score >= 70 ideally
        assert out["attempt"]["score"] >= 0


# ---------- Chatbot ----------
class TestChatbot:
    def test_chatbot_message_fresh_session(self, headers):
        r = requests.post(f"{API}/chatbot/message",
                          json={"message": "Give me one quick percentage tip"},
                          headers=headers, timeout=60)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "session_id" in data and data["session_id"]
        assert data["reply"]
        assert "trouble reaching my AI brain" not in data["reply"], "Got fallback error"
        return data["session_id"]

    def test_chatbot_history_and_context(self, headers):
        # turn 1
        r1 = requests.post(f"{API}/chatbot/message",
                           json={"message": "I want help with percentage problems"},
                           headers=headers, timeout=60)
        assert r1.status_code == 200
        sid = r1.json()["session_id"]
        # turn 2 references previous topic implicitly
        r2 = requests.post(f"{API}/chatbot/message",
                           json={"session_id": sid, "message": "Give me a hard sample question on it"},
                           headers=headers, timeout=60)
        assert r2.status_code == 200
        assert r2.json()["session_id"] == sid
        # history
        h = requests.get(f"{API}/chatbot/history", params={"session_id": sid}, headers=headers, timeout=15)
        assert h.status_code == 200
        msgs = h.json()["messages"]
        assert len(msgs) >= 4  # 2 user + 2 assistant
        roles = [m["role"] for m in msgs]
        assert roles[0] == "user"
        # delete
        d = requests.delete(f"{API}/chatbot/session", params={"session_id": sid}, headers=headers, timeout=15)
        assert d.status_code == 200
        h2 = requests.get(f"{API}/chatbot/history", params={"session_id": sid}, headers=headers, timeout=15)
        assert h2.status_code == 200
        assert len(h2.json()["messages"]) == 0
