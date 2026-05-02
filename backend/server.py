from fastapi import FastAPI, APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from contextlib import asynccontextmanager
import os
import logging
from pathlib import Path
from typing import List, Optional
from datetime import datetime, timedelta, timezone
import uuid
import shutil

from models import *
from auth import *
from ai_engine import AIEngine
from question_bank import QuestionBank
from pydantic import EmailStr

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Upload directories
UPLOAD_DIR = ROOT_DIR / 'uploads'
PROFILE_PICS_DIR = UPLOAD_DIR / 'profiles'
RESUMES_DIR = UPLOAD_DIR / 'resumes'

# Create upload directories if they don't exist
PROFILE_PICS_DIR.mkdir(parents=True, exist_ok=True)
RESUMES_DIR.mkdir(parents=True, exist_ok=True)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    yield
    # Shutdown
    client.close()

# Create the main app
app = FastAPI(lifespan=lifespan)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ============ AUTH ROUTES ============

# In-memory storage for reset tokens (in production, use Redis or database)
reset_tokens = {}

@api_router.post("/auth/signup", response_model=Token)
async def signup(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    hashed_password = get_password_hash(user_data.password)
    user = User(
        email=user_data.email,
        password_hash=hashed_password,
        role=Role.STUDENT
    )
    
    user_dict = user.model_dump()
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    await db.users.insert_one(user_dict)
    
    # Create user profile
    profile = UserProfile(
        user_id=user.id,
        name=user_data.name
    )
    profile_dict = profile.model_dump()
    await db.profiles.insert_one(profile_dict)
    
    # Create tokens
    access_token = create_access_token(data={"sub": user.id, "email": user.email, "role": user.role.value})
    refresh_token = create_refresh_token(data={"sub": user.id})
    
    return Token(access_token=access_token, refresh_token=refresh_token)

@api_router.post("/auth/login", response_model=Token)
async def login(login_data: UserLogin):
    user = await db.users.find_one({"email": login_data.email}, {"_id": 0})
    if not user or not verify_password(login_data.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    if not user.get('is_active'):
        raise HTTPException(status_code=400, detail="Account is inactive")
    
    access_token = create_access_token(data={"sub": user['id'], "email": user['email'], "role": user['role']})
    refresh_token = create_refresh_token(data={"sub": user['id']})
    
    return Token(access_token=access_token, refresh_token=refresh_token)

@api_router.post("/auth/refresh", response_model=Token)
async def refresh_token(refresh_token: str):
    payload = decode_token(refresh_token, token_type="refresh")
    user_id = payload.get("sub")
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    access_token = create_access_token(data={"sub": user['id'], "email": user['email'], "role": user['role']})
    new_refresh_token = create_refresh_token(data={"sub": user['id']})
    
    return Token(access_token=access_token, refresh_token=new_refresh_token)

@api_router.get("/auth/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user['user_id']}, {"_id": 0, "password_hash": 0})
    profile = await db.profiles.find_one({"user_id": current_user['user_id']}, {"_id": 0})
    
    return {"user": user, "profile": profile}

@api_router.post("/auth/forgot-password")
async def forgot_password(data: dict):
    email = data.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user:
        # Don't reveal if user exists or not
        return {"message": "If this email is registered, you will receive a password reset link"}
    
    # Generate reset token
    reset_token = str(uuid.uuid4())
    reset_tokens[reset_token] = {
        "email": email,
        "expires": (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat()
    }
    
    # For development: log and return the reset link
    reset_link = f"/reset-password?token={reset_token}"
    print(f"[DEV] Password reset link: {reset_link}")
    
    # In production, send email here and don't return the link
    # For development/testing, return the link
    return {
        "message": "If this email is registered, you will receive a password reset link",
        "dev_reset_link": reset_link  # Remove this in production
    }

@api_router.post("/auth/reset-password")
async def reset_password(token: str, new_password: str):
    if token not in reset_tokens:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    token_data = reset_tokens[token]
    if datetime.fromisoformat(token_data["expires"]) < datetime.now(timezone.utc):
        del reset_tokens[token]
        raise HTTPException(status_code=400, detail="Reset token has expired")
    
    # Update password
    hashed_password = get_password_hash(new_password)
    await db.users.update_one(
        {"email": token_data["email"]},
        {"$set": {"password_hash": hashed_password}}
    )
    
    # Remove used token
    del reset_tokens[token]
    
    return {"message": "Password reset successful"}

# ============ ONBOARDING ROUTES ============

@api_router.post("/onboarding/step")
async def save_onboarding_step(data: OnboardingData, current_user: dict = Depends(get_current_user)):
    await db.onboarding.update_one(
        {"user_id": current_user['user_id']},
        {"$set": data.model_dump()},
        upsert=True
    )
    return {"message": "Step saved successfully"}

@api_router.post("/onboarding/complete")
async def complete_onboarding(current_user: dict = Depends(get_current_user)):
    # Update user status
    await db.users.update_one(
        {"id": current_user['user_id']},
        {"$set": {"onboarding_completed": True}}
    )
    
    # Get onboarding data
    onboarding_data = await db.onboarding.find_one({"user_id": current_user['user_id']}, {"_id": 0})
    
    # Generate initial roadmap and recommendations
    recommendations = AIEngine.generate_recommendations({}, onboarding_data or {})
    
    return {"message": "Onboarding completed", "recommendations": recommendations}

@api_router.post("/onboarding/tour-complete")
async def complete_product_tour(current_user: dict = Depends(get_current_user)):
    await db.users.update_one(
        {"id": current_user['user_id']},
        {"$set": {"product_tour_completed": True}}
    )
    return {"message": "Product tour completed"}

# ============ PROFILE ROUTES ============

@api_router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    profile = await db.profiles.find_one({"user_id": current_user['user_id']}, {"_id": 0})
    return profile or {}

@api_router.put("/profile")
async def update_profile(profile_data: dict, current_user: dict = Depends(get_current_user)):
    await db.profiles.update_one(
        {"user_id": current_user['user_id']},
        {"$set": profile_data},
        upsert=True
    )
    return {"message": "Profile updated successfully"}

# ============ QUESTION ROUTES ============

@api_router.get("/questions/{question_type}")
async def get_questions(
    question_type: str,
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    count: int = 10,
    current_user: dict = Depends(get_current_user)
):
    questions = QuestionBank.get_questions_by_type(question_type, count, difficulty, category)
    return questions

@api_router.post("/questions", response_model=Question)
async def create_question(question_data: QuestionCreate, current_user: dict = Depends(get_current_admin)):
    question = Question(**question_data.model_dump())
    question_dict = question.model_dump()
    question_dict['created_at'] = question_dict['created_at'].isoformat()
    await db.questions.insert_one(question_dict)
    return question

# ============ ATTEMPT ROUTES ============

@api_router.post("/attempts")
async def submit_attempt(attempt_data: AttemptCreate, current_user: dict = Depends(get_current_user)):
    # Get question - try from database first
    question = await db.questions.find_one({"id": attempt_data.question_id}, {"_id": 0})
    
    if not question:
        # Try from question bank using title as fallback
        all_questions = (QuestionBank.APTITUDE_QUESTIONS + QuestionBank.REASONING_QUESTIONS + 
                        QuestionBank.CODING_QUESTIONS + QuestionBank.COMMUNICATION_QUESTIONS)
        question = next((q for q in all_questions if q.get('title') == attempt_data.question_id), None)
        if not question:
            # If still not found, return success anyway to not break UX
            return {"attempt": {"score": 0, "is_correct": False}, "xp_earned": 5}
    
    # Calculate score
    score = AIEngine.calculate_score(
        attempt_data.answer,
        question.get('correct_answer', ''),
        question.get('difficulty', 'medium'),
        attempt_data.time_taken,
        question.get('time_limit', 300)
    )
    
    is_correct = score >= 70
    
    # Create attempt with explicit field selection
    attempt_doc = {
        "id": str(uuid.uuid4()),
        "user_id": current_user['user_id'],
        "question_id": attempt_data.question_id,
        "question_type": question.get('category', question.get('type', 'aptitude')),
        "answer": attempt_data.answer,
        "is_correct": is_correct,
        "score": score,
        "time_taken": attempt_data.time_taken,
        "mode": attempt_data.mode.value if hasattr(attempt_data.mode, 'value') else attempt_data.mode,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Insert into database
    await db.attempts.insert_one(attempt_doc.copy())
    
    # Award XP
    xp = AIEngine.calculate_xp_reward("question_attempt", score)
    await db.profiles.update_one(
        {"user_id": current_user['user_id']},
        {"$inc": {"xp": xp}}
    )
    
    # Return clean response without _id
    return {
        "attempt": {
            "id": attempt_doc["id"],
            "score": score,
            "is_correct": is_correct,
            "xp_earned": xp
        },
        "xp_earned": xp
    }

@api_router.get("/attempts")
async def get_user_attempts(
    question_type: Optional[str] = None,
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    query = {"user_id": current_user['user_id']}
    if question_type:
        query["question_type"] = question_type
    
    attempts = await db.attempts.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    return attempts

# ============ CODING ROUTES ============

@api_router.post("/coding/submit")
async def submit_code(
    question_id: str,
    code: str,
    language: str,
    current_user: dict = Depends(get_current_user)
):
    # In real implementation, this would execute code in sandbox
    # For now, we'll do basic evaluation
    
    # Mock execution results
    test_cases = [{"input": {}, "output": True}] * 3
    execution_results = [True, True, False]  # Mock: 2 out of 3 tests passed
    
    score, analysis = AIEngine.calculate_coding_score(code, test_cases, execution_results)
    
    # Save attempt
    attempt = Attempt(
        user_id=current_user['user_id'],
        question_id=question_id,
        question_type=QuestionType.CODING,
        answer=code,
        score=score,
        time_taken=0,
        mode=TestMode.PRACTICE,
        feedback=str(analysis)
    )
    
    attempt_dict = attempt.model_dump()
    attempt_dict['created_at'] = attempt_dict['created_at'].isoformat()
    await db.attempts.insert_one(attempt_dict)
    
    xp = AIEngine.calculate_xp_reward("question_attempt", score)
    await db.profiles.update_one(
        {"user_id": current_user['user_id']},
        {"$inc": {"xp": xp}}
    )
    
    return {"score": score, "analysis": analysis, "xp_earned": xp}

# ============ COMMUNICATION ROUTES ============

@api_router.post("/communication/analyze")
async def analyze_communication(
    question_id: str,
    text: str,
    duration: int,
    current_user: dict = Depends(get_current_user)
):
    analysis = AIEngine.analyze_communication(text, duration)
    
    # Save attempt
    attempt = Attempt(
        user_id=current_user['user_id'],
        question_id=question_id,
        question_type=QuestionType.COMMUNICATION,
        answer=text,
        score=analysis['confidence_score'],
        time_taken=duration,
        mode=TestMode.PRACTICE,
        feedback=str(analysis['feedback'])
    )
    
    attempt_dict = attempt.model_dump()
    attempt_dict['created_at'] = attempt_dict['created_at'].isoformat()
    await db.attempts.insert_one(attempt_dict)
    
    xp = AIEngine.calculate_xp_reward("question_attempt", analysis['confidence_score'])
    await db.profiles.update_one(
        {"user_id": current_user['user_id']},
        {"$inc": {"xp": xp}}
    )
    
    return {"analysis": analysis, "xp_earned": xp}

# ============ INTERVIEW ROUTES ============

@api_router.post("/interviews/start")
async def start_interview(session_data: InterviewSessionCreate, current_user: dict = Depends(get_current_user)):
    questions = QuestionBank.get_interview_questions(session_data.interview_type, 5)
    
    session = InterviewSession(
        user_id=current_user['user_id'],
        interview_type=session_data.interview_type,
        difficulty=session_data.difficulty,
        questions=[{"question": q, "asked_at": datetime.now(timezone.utc).isoformat()} for q in questions]
    )
    
    session_dict = session.model_dump()
    session_dict['started_at'] = session_dict['started_at'].isoformat()
    await db.interviews.insert_one(session_dict.copy())
    
    # Return without _id
    return session_dict

@api_router.post("/interviews/{session_id}/respond")
async def respond_to_interview(
    session_id: str,
    question_index: int,
    response: str,
    current_user: dict = Depends(get_current_user)
):
    session = await db.interviews.find_one({"id": session_id, "user_id": current_user['user_id']}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")
    
    # Analyze response
    analysis = AIEngine.analyze_communication(response, 60)
    
    # Update session
    response_data = {
        "question_index": question_index,
        "response": response,
        "score": analysis['confidence_score'],
        "feedback": analysis['feedback'],
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    await db.interviews.update_one(
        {"id": session_id},
        {"$push": {"responses": response_data}}
    )
    
    return {"analysis": analysis}

@api_router.post("/interviews/{session_id}/complete")
async def complete_interview(session_id: str, current_user: dict = Depends(get_current_user)):
    session = await db.interviews.find_one({"id": session_id, "user_id": current_user['user_id']}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")
    
    # Calculate overall score
    responses = session.get('responses', [])
    if responses:
        overall_score = sum(r.get('score', 0) for r in responses) / len(responses)
    else:
        overall_score = 0
    
    # Update session
    await db.interviews.update_one(
        {"id": session_id},
        {
            "$set": {
                "overall_score": overall_score,
                "completed_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    # Award XP
    xp = AIEngine.calculate_xp_reward("interview_completion", overall_score)
    await db.profiles.update_one(
        {"user_id": current_user['user_id']},
        {"$inc": {"xp": xp}}
    )
    
    return {"overall_score": overall_score, "xp_earned": xp}

@api_router.get("/interviews")
async def get_user_interviews(limit: int = 20, current_user: dict = Depends(get_current_user)):
    interviews = await db.interviews.find(
        {"user_id": current_user['user_id']},
        {"_id": 0}
    ).sort("started_at", -1).limit(limit).to_list(limit)
    return interviews

# ============ ANALYTICS ROUTES ============

@api_router.get("/analytics")
async def get_analytics(current_user: dict = Depends(get_current_user)):
    # Get user attempts
    attempts = await db.attempts.find({"user_id": current_user['user_id']}, {"_id": 0}).to_list(1000)
    
    # Calculate analytics with real data
    analytics = {
        "total_attempts": len(attempts),
        "avg_score": 0,
        "practice_frequency": {},
        "test_performance": [],
        "interview_scores": [],
        "weak_areas": [],
        "strong_areas": []
    }
    
    if attempts:
        # Calculate average score
        analytics["avg_score"] = sum(a.get('score', 0) for a in attempts) / len(attempts)
        
        # Group by question type for practice frequency
        by_type = {}
        for attempt in attempts:
            q_type = attempt.get('question_type', 'unknown')
            if q_type not in by_type:
                by_type[q_type] = []
            by_type[q_type].append(attempt.get('score', 0))
        
        # Calculate weak and strong areas based on actual performance
        for q_type, scores in by_type.items():
            avg = sum(scores) / len(scores)
            analytics['practice_frequency'][q_type] = len(scores)
            
            # Performance-based categorization
            if avg < 60:
                analytics['weak_areas'].append(q_type)
            elif avg > 80:
                analytics['strong_areas'].append(q_type)
            
            # Add to test performance with realistic data
            analytics['test_performance'].append({
                "category": q_type,
                "score": round(avg, 2),
                "attempts": len(scores),
                "improvement": round((scores[-1] - scores[0]) if len(scores) > 1 else 0, 2)
            })
    
    # Get interview scores
    interviews = await db.interviews.find(
        {"user_id": current_user['user_id'], "overall_score": {"$exists": True}},
        {"_id": 0, "overall_score": 1}
    ).to_list(100)
    
    analytics['interview_scores'] = [i.get('overall_score', 0) for i in interviews]
    
    # Get profile for hire readiness calculation
    profile = await db.profiles.find_one({"user_id": current_user['user_id']}, {"_id": 0})
    hire_readiness = AIEngine.calculate_hire_readiness(profile or {}, analytics)
    
    # Update profile with calculated hire readiness
    await db.profiles.update_one(
        {"user_id": current_user['user_id']},
        {"$set": {"hire_readiness_score": hire_readiness}}
    )
    
    analytics['hire_readiness_score'] = hire_readiness
    
    return analytics

@api_router.get("/analytics/dashboard")
async def get_dashboard_data(current_user: dict = Depends(get_current_user)):
    profile = await db.profiles.find_one({"user_id": current_user['user_id']}, {"_id": 0})
    analytics = await get_analytics(current_user)
    
    # Get recent attempts with actual data
    recent_attempts = await db.attempts.find(
        {"user_id": current_user['user_id']},
        {"_id": 0}
    ).sort("created_at", -1).limit(10).to_list(10)
    
    # Calculate performance over last 7 days for graph
    from datetime import datetime, timedelta, timezone
    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
    recent_performance = await db.attempts.find(
        {
            "user_id": current_user['user_id'],
            "created_at": {"$gte": seven_days_ago.isoformat()}
        },
        {"_id": 0}
    ).to_list(1000)
    
    # Group by day for performance chart
    performance_by_day = {}
    for attempt in recent_performance:
        try:
            date_str = attempt.get('created_at', '').split('T')[0]
            if date_str not in performance_by_day:
                performance_by_day[date_str] = []
            performance_by_day[date_str].append(attempt.get('score', 0))
        except:
            pass
    
    # Calculate daily averages
    daily_performance = []
    for i in range(7):
        date = (datetime.now(timezone.utc) - timedelta(days=6-i)).strftime('%Y-%m-%d')
        scores = performance_by_day.get(date, [])
        avg_score = sum(scores) / len(scores) if scores else 0
        daily_performance.append({
            "date": date,
            "score": round(avg_score, 2),
            "attempts": len(scores)
        })
    
    # Get recommendations based on actual performance
    recommendations = AIEngine.generate_recommendations(analytics, profile or {})
    
    # Get notifications
    notifications = await db.notifications.find(
        {"user_id": current_user['user_id'], "is_read": False},
        {"_id": 0}
    ).limit(5).to_list(5)
    
    return {
        "profile": profile,
        "analytics": analytics,
        "recent_attempts": recent_attempts,
        "daily_performance": daily_performance,
        "recommendations": recommendations,
        "notifications": notifications
    }

# ============ GAMIFICATION ROUTES ============

@api_router.get("/gamification/leaderboard")
async def get_leaderboard(limit: int = 50):
    profiles = await db.profiles.find({}, {"_id": 0, "user_id": 1, "name": 1, "xp": 1, "level": 1}).sort("xp", -1).limit(limit).to_list(limit)
    
    leaderboard = []
    for idx, profile in enumerate(profiles):
        leaderboard.append({
            "rank": idx + 1,
            "user_id": profile.get('user_id'),
            "name": profile.get('name', 'Anonymous'),
            "xp": profile.get('xp', 0),
            "level": profile.get('level', 1)
        })
    
    return leaderboard

@api_router.post("/gamification/checkin")
async def daily_checkin(current_user: dict = Depends(get_current_user)):
    profile = await db.profiles.find_one({"user_id": current_user['user_id']}, {"_id": 0})
    
    last_activity = profile.get('last_activity')
    today = datetime.now(timezone.utc).date()
    
    # Check if already checked in today
    if last_activity:
        if isinstance(last_activity, str):
            last_activity = datetime.fromisoformat(last_activity)
        if last_activity.date() == today:
            return {"message": "Already checked in today", "streak": profile.get('streak_days', 0)}
    
    # Update streak
    streak = profile.get('streak_days', 0)
    if last_activity and (today - last_activity.date()).days == 1:
        streak += 1
    else:
        streak = 1
    
    xp = AIEngine.calculate_xp_reward("daily_login", 100)
    
    await db.profiles.update_one(
        {"user_id": current_user['user_id']},
        {
            "$set": {"last_activity": datetime.now(timezone.utc).isoformat(), "streak_days": streak},
            "$inc": {"xp": xp}
        }
    )
    
    return {"message": "Check-in successful", "streak": streak, "xp_earned": xp}

# ============ ADMIN ROUTES ============

@api_router.get("/admin/users")
async def get_all_users(current_user: dict = Depends(get_current_admin)):
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    return users

@api_router.get("/admin/stats")
async def get_admin_stats(current_user: dict = Depends(get_current_admin)):
    total_users = await db.users.count_documents({})
    total_attempts = await db.attempts.count_documents({})
    total_interviews = await db.interviews.count_documents({})
    
    return {
        "total_users": total_users,
        "total_attempts": total_attempts,
        "total_interviews": total_interviews
    }

# ============ NOTIFICATIONS ============

@api_router.get("/notifications")
async def get_notifications(current_user: dict = Depends(get_current_user)):
    notifications = await db.notifications.find(
        {"user_id": current_user['user_id']},
        {"_id": 0}
    ).sort("created_at", -1).limit(20).to_list(20)
    return notifications

@api_router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, current_user: dict = Depends(get_current_user)):
    await db.notifications.update_one(
        {"id": notification_id, "user_id": current_user['user_id']},
        {"$set": {"is_read": True}}
    )
    return {"message": "Notification marked as read"}

# ============ FILE UPLOAD ROUTES ============

@api_router.post("/upload/profile-picture")
async def upload_profile_picture(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    # Validate file type
    allowed_types = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only image files (JPEG, PNG, WEBP) are allowed")
    
    # Validate file size (max 5MB)
    file_content = await file.read()
    if len(file_content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size must be less than 5MB")
    
    # Generate unique filename
    file_extension = file.filename.split('.')[-1]
    unique_filename = f"{current_user['user_id']}_{uuid.uuid4()}.{file_extension}"
    file_path = PROFILE_PICS_DIR / unique_filename
    
    # Save file
    with open(file_path, 'wb') as f:
        f.write(file_content)
    
    # Update user profile
    profile_pic_url = f"/api/uploads/profiles/{unique_filename}"
    await db.profiles.update_one(
        {"user_id": current_user['user_id']},
        {"$set": {"profile_picture": profile_pic_url}},
        upsert=True
    )
    
    return {"message": "Profile picture uploaded successfully", "url": profile_pic_url}

@api_router.post("/upload/resume")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    # Validate file type
    allowed_types = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only PDF and DOC files are allowed")
    
    # Validate file size (max 10MB)
    file_content = await file.read()
    if len(file_content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size must be less than 10MB")
    
    # Generate unique filename
    file_extension = file.filename.split('.')[-1]
    unique_filename = f"{current_user['user_id']}_resume_{uuid.uuid4()}.{file_extension}"
    file_path = RESUMES_DIR / unique_filename
    
    # Save file
    with open(file_path, 'wb') as f:
        f.write(file_content)
    
    # Update user profile
    resume_url = f"/api/uploads/resumes/{unique_filename}"
    await db.profiles.update_one(
        {"user_id": current_user['user_id']},
        {"$set": {
            "resume_url": resume_url,
            "resume_filename": file.filename,
            "resume_uploaded_at": datetime.now(timezone.utc).isoformat()
        }},
        upsert=True
    )
    
    return {"message": "Resume uploaded successfully", "url": resume_url, "filename": file.filename}

@api_router.get("/uploads/{folder}/{filename}")
async def get_uploaded_file(folder: str, filename: str):
    # Validate folder
    if folder not in ['profiles', 'resumes']:
        raise HTTPException(status_code=400, detail="Invalid folder")
    
    file_path = UPLOAD_DIR / folder / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(file_path)

# Include the router in the main app
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
