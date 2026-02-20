from typing import Dict, List, Any, Tuple
from datetime import datetime, timedelta, timezone
import re
import math

class AIEngine:
    """Local AI/Intelligence engine with rule-based scoring and adaptive algorithms"""
    
    # Skill weights for different categories
    SKILL_WEIGHTS = {
        "coding": 0.3,
        "aptitude": 0.2,
        "reasoning": 0.2,
        "communication": 0.2,
        "system_design": 0.1
    }
    
    # Difficulty multipliers
    DIFFICULTY_MULTIPLIERS = {
        "easy": 1.0,
        "medium": 1.5,
        "hard": 2.0
    }
    
    @staticmethod
    def calculate_score(answer: Any, correct_answer: Any, difficulty: str, time_taken: int, time_limit: int) -> float:
        """Calculate score based on answer correctness, difficulty, and time"""
        base_score = 0.0
        
        # Check correctness
        if str(answer).strip().lower() == str(correct_answer).strip().lower():
            base_score = 100.0
        
        # Apply difficulty multiplier
        difficulty_multiplier = AIEngine.DIFFICULTY_MULTIPLIERS.get(difficulty, 1.0)
        score = base_score * difficulty_multiplier
        
        # Apply time bonus (faster answers get bonus)
        if time_limit and time_taken < time_limit:
            time_ratio = time_taken / time_limit
            time_bonus = (1 - time_ratio) * 0.2  # Up to 20% bonus
            score += score * time_bonus
        
        return min(score, 100.0)
    
    @staticmethod
    def calculate_coding_score(code: str, test_cases: List[Dict], execution_results: List[bool]) -> Tuple[float, Dict[str, Any]]:
        """Evaluate code quality and correctness"""
        if not execution_results:
            return 0.0, {"correctness": 0, "quality": 0, "feedback": []}
        
        # Correctness score
        passed_tests = sum(execution_results)
        total_tests = len(execution_results)
        correctness_score = (passed_tests / total_tests) * 70  # 70% weight
        
        # Code quality analysis
        quality_feedback = []
        quality_score = 30  # Start with full quality score
        
        # Check for common issues
        if len(code) > 1000:
            quality_score -= 5
            quality_feedback.append("Consider breaking down into smaller functions")
        
        # Check for comments
        comment_count = len(re.findall(r'#.*|//.*|/\*.*?\*/', code, re.DOTALL))
        if comment_count == 0 and len(code) > 200:
            quality_score -= 3
            quality_feedback.append("Add comments to explain complex logic")
        
        # Check for proper naming
        if re.search(r'\b[a-z]\b', code):  # Single letter variables
            quality_score -= 2
            quality_feedback.append("Use descriptive variable names")
        
        # Time complexity analysis (basic)
        nested_loops = len(re.findall(r'for.*for|while.*while', code, re.DOTALL))
        if nested_loops > 2:
            quality_feedback.append("High time complexity detected - consider optimization")
        
        total_score = correctness_score + quality_score
        
        return total_score, {
            "correctness": (passed_tests / total_tests) * 100,
            "quality": quality_score,
            "passed_tests": passed_tests,
            "total_tests": total_tests,
            "feedback": quality_feedback
        }
    
    @staticmethod
    def analyze_communication(text: str, speech_duration: int) -> Dict[str, Any]:
        """Analyze communication quality"""
        words = text.split()
        word_count = len(words)
        
        # Filler word detection
        filler_words = ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'literally']
        filler_count = sum(text.lower().count(filler) for filler in filler_words)
        
        # Grammar check (basic)
        sentences = text.count('.') + text.count('!') + text.count('?')
        avg_sentence_length = word_count / max(sentences, 1)
        
        # Confidence score calculation
        confidence_score = 100
        
        # Penalize excessive filler words
        filler_ratio = filler_count / max(word_count, 1)
        if filler_ratio > 0.05:
            confidence_score -= min(30, int(filler_ratio * 100))
        
        # Penalize very short or very long sentences
        if avg_sentence_length < 5:
            confidence_score -= 10
        elif avg_sentence_length > 30:
            confidence_score -= 15
        
        # Speech rate analysis
        if speech_duration > 0:
            words_per_minute = (word_count / speech_duration) * 60
            if words_per_minute < 100:
                confidence_score -= 10
            elif words_per_minute > 200:
                confidence_score -= 15
        
        feedback = []
        if filler_count > 3:
            feedback.append(f"Reduce filler words ({filler_count} detected)")
        if avg_sentence_length > 25:
            feedback.append("Use shorter, clearer sentences")
        if word_count < 50:
            feedback.append("Provide more detailed responses")
        
        return {
            "confidence_score": max(confidence_score, 0),
            "word_count": word_count,
            "filler_count": filler_count,
            "avg_sentence_length": round(avg_sentence_length, 1),
            "feedback": feedback
        }
    
    @staticmethod
    def calculate_hire_readiness(user_profile: Dict[str, Any], analytics: Dict[str, Any]) -> float:
        """Calculate overall hire readiness score"""
        score = 0.0
        
        # Skills component (40%)
        skills = user_profile.get('skills', [])
        if skills:
            avg_skill_level = sum(s['level'] for s in skills) / len(skills)
            avg_confidence = sum(s['confidence'] for s in skills) / len(skills)
            skills_score = ((avg_skill_level / 10) * 0.6 + (avg_confidence / 100) * 0.4) * 40
            score += skills_score
        
        # Practice frequency (20%)
        practice_freq = analytics.get('practice_frequency', {})
        if practice_freq:
            total_practice = sum(practice_freq.values())
            practice_score = min(total_practice / 50, 1.0) * 20
            score += practice_score
        
        # Test performance (20%)
        test_performance = analytics.get('test_performance', [])
        if test_performance:
            avg_test_score = sum(t.get('score', 0) for t in test_performance) / len(test_performance)
            score += (avg_test_score / 100) * 20
        
        # Interview scores (20%)
        interview_scores = analytics.get('interview_scores', [])
        if interview_scores:
            avg_interview_score = sum(interview_scores) / len(interview_scores)
            score += (avg_interview_score / 100) * 20
        
        return min(score, 100.0)
    
    @staticmethod
    def adaptive_difficulty(user_performance: List[Dict[str, Any]]) -> str:
        """Determine next question difficulty based on recent performance"""
        if not user_performance or len(user_performance) < 3:
            return "easy"
        
        # Look at last 5 attempts
        recent = user_performance[-5:]
        avg_score = sum(p.get('score', 0) for p in recent) / len(recent)
        
        if avg_score >= 80:
            return "hard"
        elif avg_score >= 60:
            return "medium"
        else:
            return "easy"
    
    @staticmethod
    def generate_recommendations(analytics: Dict[str, Any], user_profile: Dict[str, Any]) -> List[Dict[str, str]]:
        """Generate personalized study recommendations"""
        recommendations = []
        
        weak_areas = analytics.get('weak_areas', [])
        if weak_areas:
            for area in weak_areas[:3]:
                recommendations.append({
                    "type": "focus_area",
                    "title": f"Improve {area}",
                    "description": f"Practice more {area} questions to strengthen this skill",
                    "priority": "high"
                })
        
        # Check streak
        streak = user_profile.get('streak_days', 0)
        if streak == 0:
            recommendations.append({
                "type": "habit",
                "title": "Start Your Streak",
                "description": "Practice daily to build momentum",
                "priority": "medium"
            })
        
        # Practice frequency
        practice_freq = analytics.get('practice_frequency', {})
        total_practice = sum(practice_freq.values())
        if total_practice < 10:
            recommendations.append({
                "type": "practice",
                "title": "Increase Practice Volume",
                "description": "Aim for at least 10 problems per week",
                "priority": "medium"
            })
        
        return recommendations
    
    @staticmethod
    def calculate_spaced_repetition(review_count: int, ease_factor: float, performance: int) -> Tuple[int, float]:
        """Calculate next review interval using spaced repetition algorithm"""
        # Performance: 0-5 scale
        # 0-2: Reset
        # 3: Same interval
        # 4-5: Increase interval
        
        if performance < 3:
            return 1, max(ease_factor - 0.2, 1.3)
        
        # Calculate interval
        if review_count == 0:
            interval = 1
        elif review_count == 1:
            interval = 3
        else:
            # SM-2 algorithm
            interval = math.ceil(interval * ease_factor)
        
        # Adjust ease factor
        new_ease = ease_factor + (0.1 - (5 - performance) * (0.08 + (5 - performance) * 0.02))
        new_ease = max(new_ease, 1.3)
        
        return interval, new_ease
    
    @staticmethod
    def analyze_resume(resume_text: str) -> Dict[str, Any]:
        """Extract key information from resume text"""
        # Extract skills (common programming languages and technologies)
        tech_skills = [
            'python', 'java', 'javascript', 'typescript', 'c\\+\\+', 'c#', 'ruby', 'go', 'rust',
            'react', 'angular', 'vue', 'node', 'django', 'flask', 'spring', 'express',
            'mongodb', 'postgresql', 'mysql', 'redis', 'docker', 'kubernetes', 'aws', 'azure', 'gcp',
            'machine learning', 'deep learning', 'data science', 'ai', 'nlp'
        ]
        
        found_skills = []
        resume_lower = resume_text.lower()
        for skill in tech_skills:
            if re.search(r'\b' + skill + r'\b', resume_lower):
                found_skills.append(skill.replace('\\\\', ''))
        
        # Extract education
        education = []
        edu_keywords = ['bachelor', 'master', 'phd', 'b.tech', 'm.tech', 'b.e.', 'm.e.', 'bsc', 'msc']
        for keyword in edu_keywords:
            if keyword in resume_lower:
                education.append(keyword.upper())
        
        # Extract years of experience (rough estimate)
        years_pattern = r'(\d+)\+?\s*years?\s*(?:of\s*)?experience'
        years_match = re.search(years_pattern, resume_lower)
        years_experience = int(years_match.group(1)) if years_match else 0
        
        # Extract projects count
        project_sections = resume_lower.count('project')
        
        return {
            "skills": found_skills,
            "education": education,
            "years_experience": years_experience,
            "projects_count": project_sections,
            "completeness": min(len(found_skills) * 10 + len(education) * 15 + years_experience * 5, 100)
        }
    
    @staticmethod
    def calculate_xp_reward(action_type: str, performance: float) -> int:
        """Calculate XP reward for different actions"""
        base_xp = {
            "question_attempt": 10,
            "test_completion": 50,
            "interview_completion": 100,
            "daily_login": 5,
            "streak_milestone": 20,
            "badge_earned": 30
        }
        
        xp = base_xp.get(action_type, 10)
        
        # Performance multiplier
        if performance >= 90:
            xp = int(xp * 1.5)
        elif performance >= 75:
            xp = int(xp * 1.2)
        
        return xp
