from typing import Dict, Any, List
from datetime import datetime, timezone
import random

class QuestionBank:
    """Mock question bank with sample questions for all modules"""
    
    APTITUDE_QUESTIONS = [
        {
            "category": "quantitative",
            "title": "Simple Interest Problem",
            "description": "If $5000 is invested at 5% simple interest per annum, what will be the total amount after 3 years?",
            "difficulty": "easy",
            "options": ["$5500", "$5750", "$5250", "$6000"],
            "correct_answer": "$5750",
            "points": 10,
            "time_limit": 60
        },
        {
            "category": "logical",
            "title": "Number Series",
            "description": "What comes next in the series: 2, 6, 12, 20, 30, ?",
            "difficulty": "medium",
            "options": ["40", "42", "45", "38"],
            "correct_answer": "42",
            "points": 15,
            "time_limit": 90
        },
        {
            "category": "verbal",
            "title": "Synonym",
            "description": "Choose the word most similar to 'Ephemeral'",
            "difficulty": "hard",
            "options": ["Permanent", "Transient", "Eternal", "Solid"],
            "correct_answer": "Transient",
            "points": 20,
            "time_limit": 45
        }
    ]
    
    REASONING_QUESTIONS = [
        {
            "category": "pattern",
            "title": "Shape Pattern",
            "description": "Identify the pattern: Circle, Square, Triangle, Circle, Square, ?",
            "difficulty": "easy",
            "options": ["Triangle", "Circle", "Square", "Pentagon"],
            "correct_answer": "Triangle",
            "points": 10,
            "time_limit": 60
        },
        {
            "category": "analytical",
            "title": "Logic Puzzle",
            "description": "If all Bloops are Razzies and all Razzies are Lazzies, then all Bloops are definitely Lazzies. True or False?",
            "difficulty": "medium",
            "options": ["True", "False"],
            "correct_answer": "True",
            "points": 15,
            "time_limit": 90
        }
    ]
    
    CODING_QUESTIONS = [
        {
            "category": "arrays",
            "title": "Two Sum Problem",
            "description": "Given an array of integers nums and an integer target, return indices of two numbers that add up to target.\n\nExample:\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\n\nWrite a function: def twoSum(nums, target)",
            "difficulty": "easy",
            "test_cases": [
                {"input": {"nums": [2, 7, 11, 15], "target": 9}, "output": [0, 1]},
                {"input": {"nums": [3, 2, 4], "target": 6}, "output": [1, 2]}
            ],
            "points": 20,
            "time_limit": 300
        },
        {
            "category": "strings",
            "title": "Palindrome Check",
            "description": "Write a function to check if a given string is a palindrome (reads same forwards and backwards).\n\nExample:\nInput: 'racecar'\nOutput: True\n\nWrite a function: def isPalindrome(s)",
            "difficulty": "easy",
            "test_cases": [
                {"input": {"s": "racecar"}, "output": True},
                {"input": {"s": "hello"}, "output": False}
            ],
            "points": 15,
            "time_limit": 240
        }
    ]
    
    COMMUNICATION_QUESTIONS = [
        {
            "category": "hr",
            "title": "Tell me about yourself",
            "description": "Introduce yourself professionally, covering your background, skills, and career goals.",
            "difficulty": "easy",
            "points": 20,
            "time_limit": 120
        },
        {
            "category": "behavioral",
            "title": "Describe a challenging project",
            "description": "Tell me about a challenging technical project you worked on. What was your role and how did you overcome obstacles?",
            "difficulty": "medium",
            "points": 25,
            "time_limit": 180
        }
    ]
    
    INTERVIEW_SCENARIOS = {
        "hr": [
            "Tell me about yourself.",
            "Why do you want to work for our company?",
            "What are your strengths and weaknesses?",
            "Where do you see yourself in 5 years?",
            "Why should we hire you?"
        ],
        "technical": [
            "Explain the difference between an array and a linked list.",
            "What is the time complexity of binary search?",
            "Explain how RESTful APIs work.",
            "What are the SOLID principles?",
            "Describe your experience with databases."
        ],
        "behavioral": [
            "Tell me about a time you faced a conflict in your team.",
            "Describe a situation where you had to meet a tight deadline.",
            "How do you handle constructive criticism?",
            "Tell me about a project you're most proud of."
        ]
    }
    
    @staticmethod
    def get_questions_by_type(question_type: str, count: int = 10, difficulty: str = None) -> List[Dict[str, Any]]:
        """Get random questions by type"""
        questions_map = {
            "aptitude": QuestionBank.APTITUDE_QUESTIONS,
            "reasoning": QuestionBank.REASONING_QUESTIONS,
            "coding": QuestionBank.CODING_QUESTIONS,
            "communication": QuestionBank.COMMUNICATION_QUESTIONS
        }
        
        questions = questions_map.get(question_type, [])
        
        if difficulty:
            questions = [q for q in questions if q.get('difficulty') == difficulty]
        
        # If we need more questions, duplicate and shuffle
        while len(questions) < count:
            questions.extend(questions_map.get(question_type, []))
        
        selected = random.sample(questions, min(count, len(questions)))
        return selected
    
    @staticmethod
    def get_interview_questions(interview_type: str, count: int = 5) -> List[str]:
        """Get interview questions by type"""
        questions = QuestionBank.INTERVIEW_SCENARIOS.get(interview_type, QuestionBank.INTERVIEW_SCENARIOS["hr"])
        return random.sample(questions, min(count, len(questions)))
