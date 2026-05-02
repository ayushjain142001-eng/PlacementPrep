"""Tests for new /api/questions/{type} with category+difficulty filters and uniqueness."""
import os
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://interview-ready-21.preview.emergentagent.com').rstrip('/')
EMAIL = "test@example.com"
PASSWORD = "Test@123"


@pytest.fixture(scope="module")
def token():
    # Try login; if fails, signup
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": EMAIL, "password": PASSWORD})
    if r.status_code != 200:
        requests.post(f"{BASE_URL}/api/auth/signup", json={"email": EMAIL, "password": PASSWORD, "name": "Test User"})
        r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": EMAIL, "password": PASSWORD})
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    return r.json()["access_token"]


@pytest.fixture
def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


# ---------- Aptitude ----------
def test_aptitude_quantitative_easy_5(auth_headers):
    r = requests.get(f"{BASE_URL}/api/questions/aptitude",
                     params={"category": "quantitative", "difficulty": "easy", "count": 5},
                     headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) == 5
    titles = [q["title"] for q in data]
    assert len(set(titles)) == 5, f"Duplicates found: {titles}"
    for q in data:
        assert q["difficulty"] == "easy"
        assert q["category"] == "quantitative"


def test_aptitude_logical_hard_count10_unique(auth_headers):
    r = requests.get(f"{BASE_URL}/api/questions/aptitude",
                     params={"category": "logical", "difficulty": "hard", "count": 10},
                     headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    # Expect multiple hard logical questions (at least 5) and all unique
    assert len(data) >= 5, f"Expected >=5, got {len(data)}"
    titles = [q["title"] for q in data]
    assert len(set(titles)) == len(titles), f"Duplicates: {titles}"
    for q in data:
        assert q["difficulty"] == "hard"
        assert q["category"] == "logical"


def test_aptitude_verbal_medium(auth_headers):
    r = requests.get(f"{BASE_URL}/api/questions/aptitude",
                     params={"category": "verbal", "difficulty": "medium", "count": 10},
                     headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert len(data) >= 1
    titles = [q["title"] for q in data]
    assert len(set(titles)) == len(titles)
    for q in data:
        assert q["difficulty"] == "medium"


# ---------- Reasoning ----------
def test_reasoning_pattern_hard_unique(auth_headers):
    r = requests.get(f"{BASE_URL}/api/questions/reasoning",
                     params={"category": "pattern", "difficulty": "hard", "count": 10},
                     headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert len(data) >= 3
    titles = [q["title"] for q in data]
    assert len(set(titles)) == len(titles)
    for q in data:
        assert q["difficulty"] == "hard"
        assert q["category"] == "pattern"


def test_reasoning_analytical_medium_unique(auth_headers):
    r = requests.get(f"{BASE_URL}/api/questions/reasoning",
                     params={"category": "analytical", "difficulty": "medium", "count": 10},
                     headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert len(data) >= 2
    titles = [q["title"] for q in data]
    assert len(set(titles)) == len(titles)
    for q in data:
        assert q["difficulty"] == "medium"
        assert q["category"] == "analytical"


def test_reasoning_visual_easy(auth_headers):
    r = requests.get(f"{BASE_URL}/api/questions/reasoning",
                     params={"category": "visual", "difficulty": "easy", "count": 10},
                     headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert len(data) >= 1
    for q in data:
        assert q["difficulty"] == "easy"
        assert q["category"] == "visual"


# ---------- Validation ----------
def test_invalid_difficulty_rejected(auth_headers):
    r = requests.get(f"{BASE_URL}/api/questions/aptitude",
                     params={"category": "quantitative", "difficulty": "expert", "count": 5},
                     headers=auth_headers)
    assert r.status_code == 400
    body = r.json()
    assert "detail" in body


def test_no_auth_rejected():
    r = requests.get(f"{BASE_URL}/api/questions/aptitude",
                     params={"category": "quantitative", "difficulty": "easy", "count": 5})
    assert r.status_code in (401, 403)


# ---------- Submit attempt with new filtered question ----------
def test_submit_attempt_from_filtered_question(auth_headers):
    # Fetch an easy quantitative question
    r = requests.get(f"{BASE_URL}/api/questions/aptitude",
                     params={"category": "quantitative", "difficulty": "easy", "count": 1},
                     headers=auth_headers)
    assert r.status_code == 200
    questions = r.json()
    assert len(questions) >= 1
    q = questions[0]

    # Submit using title as question_id (matches AptitudeModule.js behavior)
    payload = {
        "question_id": q["title"],
        "answer": q["correct_answer"],
        "time_taken": 30,
        "mode": "practice"
    }
    sr = requests.post(f"{BASE_URL}/api/attempts", json=payload, headers=auth_headers)
    assert sr.status_code == 200, f"Attempt submit failed: {sr.status_code} {sr.text}"
    body = sr.json()
    assert "attempt" in body
    assert "xp_earned" in body
    assert body["attempt"]["is_correct"] is True
    assert body["attempt"]["score"] >= 70
