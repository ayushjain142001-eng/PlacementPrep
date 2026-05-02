"""
Test cases for Coding Module API endpoints
Tests: code submission, language validation, empty code handling, question fetching
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestCodingModule:
    """Coding Module endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test fixtures"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login to get token
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@example.com",
            "password": "Test@123"
        })
        if login_response.status_code == 200:
            token = login_response.json().get("access_token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
        else:
            pytest.skip("Authentication failed - skipping coding module tests")
    
    # ============ QUESTION FETCHING TESTS ============
    
    def test_get_coding_questions(self):
        """Test fetching coding questions"""
        response = self.session.get(f"{BASE_URL}/api/questions/coding?count=5")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        
        # Verify question structure
        question = data[0]
        assert "title" in question
        assert "description" in question
        assert "difficulty" in question
        assert "test_cases" in question
    
    def test_get_coding_questions_with_count(self):
        """Test fetching specific number of coding questions"""
        response = self.session.get(f"{BASE_URL}/api/questions/coding?count=3")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) <= 3
    
    # ============ CODE SUBMISSION TESTS ============
    
    def test_submit_code_python_success(self):
        """Test successful Python code submission"""
        response = self.session.post(f"{BASE_URL}/api/coding/submit", json={
            "question_id": "Two Sum",
            "code": "def solution():\n    return [0, 1]",
            "language": "python"
        })
        assert response.status_code == 200
        
        data = response.json()
        assert "score" in data
        assert "analysis" in data
        assert "xp_earned" in data
        assert isinstance(data["score"], (int, float))
        assert data["score"] >= 0 and data["score"] <= 100
    
    def test_submit_code_javascript_success(self):
        """Test successful JavaScript code submission"""
        response = self.session.post(f"{BASE_URL}/api/coding/submit", json={
            "question_id": "Two Sum",
            "code": "function solution() {\n  return [0, 1];\n}",
            "language": "javascript"
        })
        assert response.status_code == 200
        
        data = response.json()
        assert "score" in data
        assert "analysis" in data
    
    def test_submit_code_java_success(self):
        """Test successful Java code submission"""
        response = self.session.post(f"{BASE_URL}/api/coding/submit", json={
            "question_id": "Two Sum",
            "code": "public class Solution {\n    public int[] solution() {\n        return new int[]{0, 1};\n    }\n}",
            "language": "java"
        })
        assert response.status_code == 200
        
        data = response.json()
        assert "score" in data
    
    def test_submit_code_cpp_success(self):
        """Test successful C++ code submission"""
        response = self.session.post(f"{BASE_URL}/api/coding/submit", json={
            "question_id": "Two Sum",
            "code": "#include <vector>\nclass Solution {\npublic:\n    std::vector<int> solution() {\n        return {0, 1};\n    }\n};",
            "language": "cpp"
        })
        assert response.status_code == 200
        
        data = response.json()
        assert "score" in data
    
    # ============ VALIDATION TESTS ============
    
    def test_submit_empty_code_rejected(self):
        """Test that empty code is rejected"""
        response = self.session.post(f"{BASE_URL}/api/coding/submit", json={
            "question_id": "Two Sum",
            "code": "",
            "language": "python"
        })
        assert response.status_code == 400
        
        data = response.json()
        assert "detail" in data
        assert "empty" in data["detail"].lower()
    
    def test_submit_whitespace_code_rejected(self):
        """Test that whitespace-only code is rejected"""
        response = self.session.post(f"{BASE_URL}/api/coding/submit", json={
            "question_id": "Two Sum",
            "code": "   \n\t  ",
            "language": "python"
        })
        assert response.status_code == 400
        
        data = response.json()
        assert "detail" in data
    
    def test_submit_invalid_language_rejected(self):
        """Test that invalid language is rejected"""
        response = self.session.post(f"{BASE_URL}/api/coding/submit", json={
            "question_id": "Two Sum",
            "code": "print('hello')",
            "language": "ruby"
        })
        assert response.status_code == 400
        
        data = response.json()
        assert "detail" in data
        assert "Invalid language" in data["detail"]
    
    def test_submit_missing_question_id_rejected(self):
        """Test that missing question_id is rejected"""
        response = self.session.post(f"{BASE_URL}/api/coding/submit", json={
            "code": "print('hello')",
            "language": "python"
        })
        assert response.status_code == 400
        
        data = response.json()
        assert "detail" in data
    
    def test_submit_missing_language_rejected(self):
        """Test that missing language is rejected"""
        response = self.session.post(f"{BASE_URL}/api/coding/submit", json={
            "question_id": "Two Sum",
            "code": "print('hello')"
        })
        assert response.status_code == 400
        
        data = response.json()
        assert "detail" in data
    
    # ============ ANALYSIS RESPONSE TESTS ============
    
    def test_submit_code_analysis_structure(self):
        """Test that analysis response has correct structure"""
        response = self.session.post(f"{BASE_URL}/api/coding/submit", json={
            "question_id": "Two Sum",
            "code": "def solution():\n    # Complete solution\n    return [0, 1]",
            "language": "python"
        })
        assert response.status_code == 200
        
        data = response.json()
        analysis = data.get("analysis", {})
        
        # Verify analysis structure
        assert "correctness" in analysis or "passed_tests" in analysis
        assert "quality" in analysis
        assert "total_tests" in analysis
    
    def test_xp_earned_is_positive(self):
        """Test that XP earned is a positive number"""
        response = self.session.post(f"{BASE_URL}/api/coding/submit", json={
            "question_id": "Two Sum",
            "code": "def solution():\n    return [0, 1]",
            "language": "python"
        })
        assert response.status_code == 200
        
        data = response.json()
        assert data["xp_earned"] >= 0


class TestCodingModuleUnauthenticated:
    """Test coding module endpoints without authentication"""
    
    def test_submit_code_without_auth(self):
        """Test that code submission requires authentication"""
        response = requests.post(f"{BASE_URL}/api/coding/submit", json={
            "question_id": "Two Sum",
            "code": "print('hello')",
            "language": "python"
        })
        assert response.status_code in [401, 403]
    
    def test_get_questions_without_auth(self):
        """Test that getting questions requires authentication"""
        response = requests.get(f"{BASE_URL}/api/questions/coding?count=5")
        assert response.status_code in [401, 403]
