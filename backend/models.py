from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from enum import Enum
import uuid

class Role(str, Enum):
    STUDENT = "student"
    ADMIN = "admin"

class DifficultyLevel(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"

class QuestionType(str, Enum):
    APTITUDE = "aptitude"
    REASONING = "reasoning"
    CODING = "coding"
    COMMUNICATION = "communication"

class TestMode(str, Enum):
    PRACTICE = "practice"
    MOCK_TEST = "mock_test"
    REVISION = "revision"
    TEST = "test"  # alias used by Aptitude/Reasoning frontend — treated like mock_test

# User Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    password_hash: str
    role: Role = Role.STUDENT
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    onboarding_completed: bool = False
    product_tour_completed: bool = False

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

# Profile Models
class SkillLevel(BaseModel):
    skill: str
    level: int = Field(ge=1, le=10)
    confidence: float = Field(ge=0, le=100)
    last_updated: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    name: str
    avatar_url: Optional[str] = None
    target_role: Optional[str] = None
    target_companies: List[str] = []
    preferred_tech_stack: List[str] = []
    daily_hours: Optional[int] = None
    target_timeline: Optional[str] = None
    skills: List[SkillLevel] = []
    resume_url: Optional[str] = None
    resume_data: Optional[Dict[str, Any]] = None
    hire_readiness_score: float = 0.0
    xp: int = 0
    level: int = 1
    streak_days: int = 0
    last_activity: Optional[datetime] = None

class OnboardingData(BaseModel):
    step: int
    career_goals: Optional[Dict[str, Any]] = None
    skill_assessment: Optional[Dict[str, Any]] = None
    availability: Optional[Dict[str, Any]] = None
    resume_info: Optional[Dict[str, Any]] = None

# Question Models
class Question(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: QuestionType
    category: str
    title: str
    description: str
    difficulty: DifficultyLevel
    options: Optional[List[str]] = None
    correct_answer: Optional[str] = None
    test_cases: Optional[List[Dict[str, Any]]] = None
    hints: List[str] = []
    tags: List[str] = []
    points: int = 10
    time_limit: Optional[int] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class QuestionCreate(BaseModel):
    type: QuestionType
    category: str
    title: str
    description: str
    difficulty: DifficultyLevel
    options: Optional[List[str]] = None
    correct_answer: Optional[str] = None
    test_cases: Optional[List[Dict[str, Any]]] = None
    hints: List[str] = []
    tags: List[str] = []
    points: int = 10
    time_limit: Optional[int] = None

# Attempt Models
class Attempt(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    question_id: str
    question_type: QuestionType
    answer: Any
    is_correct: Optional[bool] = None
    score: float = 0.0
    time_taken: int
    mode: TestMode
    feedback: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AttemptCreate(BaseModel):
    question_id: str
    answer: Any
    time_taken: int
    mode: TestMode = TestMode.PRACTICE

# Interview Models
class InterviewSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    interview_type: str
    difficulty: DifficultyLevel
    questions: List[Dict[str, Any]] = []
    responses: List[Dict[str, Any]] = []
    overall_score: float = 0.0
    feedback: Dict[str, Any] = {}
    duration: int = 0
    started_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None

class InterviewSessionCreate(BaseModel):
    interview_type: str
    difficulty: DifficultyLevel

# Gamification Models
class Badge(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    icon: str
    criteria: Dict[str, Any]

class UserBadge(BaseModel):
    user_id: str
    badge_id: str
    earned_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class LeaderboardEntry(BaseModel):
    user_id: str
    name: str
    xp: int
    level: int
    rank: int

# Analytics Models
class UserAnalytics(BaseModel):
    user_id: str
    skill_growth: Dict[str, List[float]] = {}
    practice_frequency: Dict[str, int] = {}
    test_performance: List[Dict[str, Any]] = []
    interview_scores: List[float] = []
    weak_areas: List[str] = []
    strong_areas: List[str] = []
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Revision Models
class RevisionItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    topic: str
    category: str
    last_reviewed: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    next_review: datetime
    interval_days: int = 1
    ease_factor: float = 2.5
    review_count: int = 0

# Notification Models
class Notification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    message: str
    type: str
    is_read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Response Models (exclude password)
class UserResponse(BaseModel):
    id: str
    email: str
    role: Role
    is_active: bool
    created_at: datetime
    onboarding_completed: bool
    product_tour_completed: bool
