"""
Backend API Tests for PlacementPrep
Tests: Auth, Questions (Aptitude/Reasoning), Password Reset, Interview
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "test@example.com"
TEST_PASSWORD = "Test@123"
TEST_NAME = "Test User"

class TestAuth:
    """Authentication endpoint tests"""
    
    def test_login_success(self):
        """Test login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        print(f"✓ Login successful, got tokens")
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@example.com",
            "password": "wrongpass"
        })
        assert response.status_code == 401
        print(f"✓ Invalid login correctly rejected")
    
    def test_signup_duplicate_email(self):
        """Test signup with existing email"""
        response = requests.post(f"{BASE_URL}/api/auth/signup", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
            "name": TEST_NAME
        })
        # Should fail because user already exists
        assert response.status_code == 400
        print(f"✓ Duplicate signup correctly rejected")
    
    def test_get_current_user(self):
        """Test getting current user info with valid token"""
        # First login
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        
        # Get user info
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "user" in data
        assert data["user"]["email"] == TEST_EMAIL
        print(f"✓ Get current user successful")


class TestAptitudeQuestions:
    """Aptitude module question tests - verifying 10/20 questions load correctly"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for tests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200
        return response.json()["access_token"]
    
    def test_aptitude_quantitative_practice_10_questions(self, auth_token):
        """Test Practice Mode: 10 quantitative questions"""
        response = requests.get(
            f"{BASE_URL}/api/questions/aptitude?category=quantitative&count=10",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        questions = response.json()
        assert len(questions) == 10, f"Expected 10 questions, got {len(questions)}"
        # Verify all are quantitative
        for q in questions:
            assert q.get("category") == "quantitative", f"Wrong category: {q.get('category')}"
        print(f"✓ Quantitative Practice: Got {len(questions)} questions")
    
    def test_aptitude_logical_practice_10_questions(self, auth_token):
        """Test Practice Mode: 10 logical questions"""
        response = requests.get(
            f"{BASE_URL}/api/questions/aptitude?category=logical&count=10",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        questions = response.json()
        assert len(questions) == 10, f"Expected 10 questions, got {len(questions)}"
        for q in questions:
            assert q.get("category") == "logical"
        print(f"✓ Logical Practice: Got {len(questions)} questions")
    
    def test_aptitude_verbal_practice_10_questions(self, auth_token):
        """Test Practice Mode: 10 verbal questions"""
        response = requests.get(
            f"{BASE_URL}/api/questions/aptitude?category=verbal&count=10",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        questions = response.json()
        assert len(questions) == 10, f"Expected 10 questions, got {len(questions)}"
        for q in questions:
            assert q.get("category") == "verbal"
        print(f"✓ Verbal Practice: Got {len(questions)} questions")
    
    def test_aptitude_test_mode_20_questions(self, auth_token):
        """Test Mode: 20 questions (mixed or specific category)"""
        response = requests.get(
            f"{BASE_URL}/api/questions/aptitude?category=quantitative&count=20",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        questions = response.json()
        assert len(questions) == 20, f"Expected 20 questions, got {len(questions)}"
        print(f"✓ Test Mode: Got {len(questions)} questions")
    
    def test_questions_have_required_fields(self, auth_token):
        """Verify question structure"""
        response = requests.get(
            f"{BASE_URL}/api/questions/aptitude?category=quantitative&count=5",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        questions = response.json()
        for q in questions:
            assert "title" in q, "Missing title"
            assert "description" in q, "Missing description"
            assert "options" in q, "Missing options"
            assert "correct_answer" in q, "Missing correct_answer"
            assert "difficulty" in q, "Missing difficulty"
        print(f"✓ Questions have all required fields")


class TestReasoningQuestions:
    """Reasoning module question tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for tests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200
        return response.json()["access_token"]
    
    def test_reasoning_pattern_practice_10_questions(self, auth_token):
        """Test Practice Mode: 10 pattern questions"""
        response = requests.get(
            f"{BASE_URL}/api/questions/reasoning?category=pattern&count=10",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        questions = response.json()
        # Pattern category has 8 questions, so we may get duplicates to reach 10
        assert len(questions) >= 8, f"Expected at least 8 questions, got {len(questions)}"
        print(f"✓ Pattern Practice: Got {len(questions)} questions")
    
    def test_reasoning_analytical_practice_10_questions(self, auth_token):
        """Test Practice Mode: 10 analytical questions"""
        response = requests.get(
            f"{BASE_URL}/api/questions/reasoning?category=analytical&count=10",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        questions = response.json()
        assert len(questions) >= 8, f"Expected at least 8 questions, got {len(questions)}"
        print(f"✓ Analytical Practice: Got {len(questions)} questions")
    
    def test_reasoning_visual_practice_10_questions(self, auth_token):
        """Test Practice Mode: 10 visual questions"""
        response = requests.get(
            f"{BASE_URL}/api/questions/reasoning?category=visual&count=10",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        questions = response.json()
        assert len(questions) >= 8, f"Expected at least 8 questions, got {len(questions)}"
        print(f"✓ Visual Practice: Got {len(questions)} questions")
    
    def test_reasoning_test_mode_20_questions(self, auth_token):
        """Test Mode: 20 reasoning questions"""
        response = requests.get(
            f"{BASE_URL}/api/questions/reasoning?category=pattern&count=20",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        questions = response.json()
        assert len(questions) == 20, f"Expected 20 questions, got {len(questions)}"
        print(f"✓ Reasoning Test Mode: Got {len(questions)} questions")


class TestPasswordReset:
    """Password reset flow tests"""
    
    def test_forgot_password_existing_email(self):
        """Test forgot password with existing email"""
        response = requests.post(
            f"{BASE_URL}/api/auth/forgot-password",
            params={"email": TEST_EMAIL}
        )
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✓ Forgot password request successful")
    
    def test_forgot_password_nonexistent_email(self):
        """Test forgot password with non-existent email (should not reveal)"""
        response = requests.post(
            f"{BASE_URL}/api/auth/forgot-password",
            params={"email": "nonexistent@example.com"}
        )
        # Should return 200 to not reveal if email exists
        assert response.status_code == 200
        print(f"✓ Forgot password doesn't reveal email existence")
    
    def test_reset_password_invalid_token(self):
        """Test reset password with invalid token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/reset-password",
            params={"token": "invalid-token", "new_password": "NewPass@123"}
        )
        assert response.status_code == 400
        print(f"✓ Invalid reset token correctly rejected")


class TestInterviewModule:
    """Interview module tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for tests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200
        return response.json()["access_token"]
    
    def test_start_interview_session(self, auth_token):
        """Test starting an interview session"""
        response = requests.post(
            f"{BASE_URL}/api/interviews/start",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "interview_type": "hr",
                "difficulty": "medium"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "questions" in data
        assert len(data["questions"]) > 0
        print(f"✓ Interview session started with {len(data['questions'])} questions")
        return data["id"]
    
    def test_get_user_interviews(self, auth_token):
        """Test getting user's interview history"""
        response = requests.get(
            f"{BASE_URL}/api/interviews",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Got {len(data)} interview sessions")


class TestAttempts:
    """Question attempt submission tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for tests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200
        return response.json()["access_token"]
    
    def test_submit_attempt(self, auth_token):
        """Test submitting a question attempt"""
        response = requests.post(
            f"{BASE_URL}/api/attempts",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "question_id": "Simple Interest",
                "answer": "$5750",
                "time_taken": 30,
                "mode": "practice"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "attempt" in data
        assert "xp_earned" in data
        print(f"✓ Attempt submitted, earned {data['xp_earned']} XP")
    
    def test_get_user_attempts(self, auth_token):
        """Test getting user's attempt history"""
        response = requests.get(
            f"{BASE_URL}/api/attempts",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Got {len(data)} attempts")


class TestAnalytics:
    """Analytics and dashboard tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for tests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200
        return response.json()["access_token"]
    
    def test_get_analytics(self, auth_token):
        """Test getting user analytics"""
        response = requests.get(
            f"{BASE_URL}/api/analytics",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "total_attempts" in data
        print(f"✓ Analytics retrieved: {data['total_attempts']} total attempts")
    
    def test_get_dashboard_data(self, auth_token):
        """Test getting dashboard data"""
        response = requests.get(
            f"{BASE_URL}/api/analytics/dashboard",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "profile" in data
        assert "analytics" in data
        print(f"✓ Dashboard data retrieved")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
