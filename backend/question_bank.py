from typing import Dict, Any, List
from datetime import datetime, timezone
import random

class QuestionBank:
    """Question bank with diverse questions for all modules"""
    
    # Expanded Aptitude Questions
    APTITUDE_QUESTIONS = [
        # Quantitative - Easy
        {
            "category": "quantitative",
            "title": "Simple Interest",
            "description": "If $5000 is invested at 5% simple interest per annum, what will be the total amount after 3 years?",
            "difficulty": "easy",
            "options": ["$5500", "$5750", "$5250", "$6000"],
            "correct_answer": "$5750",
            "points": 10,
            "time_limit": 60
        },
        {
            "category": "quantitative",
            "title": "Percentage Calculation",
            "description": "What is 15% of 240?",
            "difficulty": "easy",
            "options": ["30", "36", "40", "45"],
            "correct_answer": "36",
            "points": 10,
            "time_limit": 45
        },
        {
            "category": "quantitative",
            "title": "Profit and Loss",
            "description": "A shopkeeper bought an item for $80 and sold it for $100. What is the profit percentage?",
            "difficulty": "easy",
            "options": ["20%", "25%", "30%", "15%"],
            "correct_answer": "25%",
            "points": 10,
            "time_limit": 60
        },
        # Quantitative - Medium
        {
            "category": "quantitative",
            "title": "Time and Work",
            "description": "A can complete a work in 12 days and B can complete it in 18 days. How many days will they take together?",
            "difficulty": "medium",
            "options": ["7.2 days", "8 days", "9 days", "10 days"],
            "correct_answer": "7.2 days",
            "points": 15,
            "time_limit": 90
        },
        {
            "category": "quantitative",
            "title": "Speed Distance Time",
            "description": "A train travels 120 km in 2 hours. What is its speed in km/h?",
            "difficulty": "medium",
            "options": ["50 km/h", "60 km/h", "70 km/h", "80 km/h"],
            "correct_answer": "60 km/h",
            "points": 15,
            "time_limit": 60
        },
        {
            "category": "quantitative",
            "title": "Ratio and Proportion",
            "description": "The ratio of boys to girls in a class is 3:2. If there are 15 boys, how many girls are there?",
            "difficulty": "medium",
            "options": ["8", "10", "12", "15"],
            "correct_answer": "10",
            "points": 15,
            "time_limit": 75
        },
        # Logical - Easy
        {
            "category": "logical",
            "title": "Number Series 1",
            "description": "What comes next: 2, 6, 12, 20, 30, ?",
            "difficulty": "easy",
            "options": ["40", "42", "45", "38"],
            "correct_answer": "42",
            "points": 10,
            "time_limit": 60
        },
        {
            "category": "logical",
            "title": "Number Series 2",
            "description": "What comes next: 5, 10, 20, 40, ?",
            "difficulty": "easy",
            "options": ["60", "70", "80", "90"],
            "correct_answer": "80",
            "points": 10,
            "time_limit": 60
        },
        {
            "category": "logical",
            "title": "Odd One Out",
            "description": "Which one is different: Apple, Mango, Banana, Carrot",
            "difficulty": "easy",
            "options": ["Apple", "Mango", "Banana", "Carrot"],
            "correct_answer": "Carrot",
            "points": 10,
            "time_limit": 45
        },
        # Logical - Medium
        {
            "category": "logical",
            "title": "Blood Relations",
            "description": "If A is the brother of B, B is the sister of C, and C is the father of D, how is A related to D?",
            "difficulty": "medium",
            "options": ["Uncle", "Brother", "Father", "Cousin"],
            "correct_answer": "Uncle",
            "points": 15,
            "time_limit": 90
        },
        {
            "category": "logical",
            "title": "Direction Sense",
            "description": "A walks 10m North, then 5m East, then 10m South. How far is he from starting point?",
            "difficulty": "medium",
            "options": ["5m", "10m", "15m", "25m"],
            "correct_answer": "5m",
            "points": 15,
            "time_limit": 90
        },
        # Verbal - Easy
        {
            "category": "verbal",
            "title": "Synonym 1",
            "description": "Choose the word most similar to 'Happy'",
            "difficulty": "easy",
            "options": ["Joyful", "Sad", "Angry", "Tired"],
            "correct_answer": "Joyful",
            "points": 10,
            "time_limit": 45
        },
        {
            "category": "verbal",
            "title": "Antonym 1",
            "description": "Choose the opposite of 'Hot'",
            "difficulty": "easy",
            "options": ["Warm", "Cool", "Cold", "Freezing"],
            "correct_answer": "Cold",
            "points": 10,
            "time_limit": 45
        },
        {
            "category": "verbal",
            "title": "Synonym 2",
            "description": "Choose the word most similar to 'Ephemeral'",
            "difficulty": "hard",
            "options": ["Permanent", "Transient", "Eternal", "Solid"],
            "correct_answer": "Transient",
            "points": 20,
            "time_limit": 60
        },
        {
            "category": "verbal",
            "title": "Sentence Correction",
            "description": "Choose the correct sentence",
            "difficulty": "medium",
            "options": [
                "He don't like apples",
                "He doesn't like apples",
                "He doesn't likes apples",
                "He not like apples"
            ],
            "correct_answer": "He doesn't like apples",
            "points": 15,
            "time_limit": 60
        }
    ]
    
    # Reasoning Questions
    REASONING_QUESTIONS = [
        {
            "category": "pattern",
            "title": "Pattern Recognition 1",
            "description": "Identify the pattern: Circle, Square, Triangle, Circle, Square, ?",
            "difficulty": "easy",
            "options": ["Triangle", "Circle", "Square", "Pentagon"],
            "correct_answer": "Triangle",
            "points": 10,
            "time_limit": 60
        },
        {
            "category": "pattern",
            "title": "Number Pattern",
            "description": "What comes next: 1, 4, 9, 16, 25, ?",
            "difficulty": "easy",
            "options": ["30", "32", "36", "40"],
            "correct_answer": "36",
            "points": 10,
            "time_limit": 60
        },
        {
            "category": "pattern",
            "title": "Letter Series",
            "description": "What comes next: A, C, E, G, ?",
            "difficulty": "easy",
            "options": ["H", "I", "J", "K"],
            "correct_answer": "I",
            "points": 10,
            "time_limit": 60
        },
        {
            "category": "analytical",
            "title": "Logic Puzzle 1",
            "description": "If all Bloops are Razzies and all Razzies are Lazzies, then all Bloops are definitely Lazzies. True or False?",
            "difficulty": "medium",
            "options": ["True", "False"],
            "correct_answer": "True",
            "points": 15,
            "time_limit": 90
        },
        {
            "category": "analytical",
            "title": "Seating Arrangement",
            "description": "Five people A, B, C, D, E sit in a row. A and B sit together, C sits at one end. Where does D sit?",
            "difficulty": "medium",
            "options": ["Next to C", "Between A and B", "At other end", "Cannot determine"],
            "correct_answer": "Cannot determine",
            "points": 15,
            "time_limit": 120
        },
        {
            "category": "visual",
            "title": "Mirror Image",
            "description": "Which is the mirror image of 'SMART'?",
            "difficulty": "medium",
            "options": ["TRAMS", "TRАMS", "SMART", "TRAMS"],
            "correct_answer": "TRAMS",
            "points": 15,
            "time_limit": 75
        },
        {
            "category": "visual",
            "title": "Cube Counting",
            "description": "A cube is painted red on all faces and cut into 27 smaller cubes. How many have 2 red faces?",
            "difficulty": "hard",
            "options": ["8", "12", "6", "0"],
            "correct_answer": "12",
            "points": 20,
            "time_limit": 120
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
            "description": "Write a function to check if a given string is a palindrome.\n\nExample:\nInput: 'racecar'\nOutput: True\n\nWrite a function: def isPalindrome(s)",
            "difficulty": "easy",
            "test_cases": [
                {"input": {"s": "racecar"}, "output": True},
                {"input": {"s": "hello"}, "output": False}
            ],
            "points": 15,
            "time_limit": 240
        },
        {
            "category": "arrays",
            "title": "Find Maximum",
            "description": "Find the maximum element in an array.\n\nWrite a function: def findMax(arr)",
            "difficulty": "easy",
            "test_cases": [
                {"input": {"arr": [1, 5, 3, 9, 2]}, "output": 9},
                {"input": {"arr": [-1, -5, -3]}, "output": -1}
            ],
            "points": 15,
            "time_limit": 180
        }
    ]
    
    COMMUNICATION_QUESTIONS = [
        {
            "category": "hr",
            "title": "Tell me about yourself",
            "description": "Introduce yourself professionally, covering your background, skills, and career goals. (2-3 minutes)",
            "difficulty": "easy",
            "points": 20,
            "time_limit": 180
        },
        {
            "category": "behavioral",
            "title": "Describe a challenging project",
            "description": "Tell me about a challenging technical project you worked on. What was your role and how did you overcome obstacles?",
            "difficulty": "medium",
            "points": 25,
            "time_limit": 180
        },
        {
            "category": "hr",
            "title": "Why should we hire you?",
            "description": "Explain what makes you the best candidate for this position.",
            "difficulty": "medium",
            "points": 25,
            "time_limit": 150
        },
        {
            "category": "behavioral",
            "title": "Conflict resolution",
            "description": "Describe a time when you had a disagreement with a team member. How did you handle it?",
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
            "Why should we hire you?",
            "What is your greatest achievement?",
            "How do you handle stress and pressure?",
            "What motivates you?"
        ],
        "technical": [
            "Explain the difference between an array and a linked list.",
            "What is the time complexity of binary search?",
            "Explain how RESTful APIs work.",
            "What are the SOLID principles?",
            "Describe your experience with databases.",
            "What is polymorphism in OOP?",
            "Explain the difference between SQL and NoSQL.",
            "What is a closure in JavaScript?"
        ],
        "behavioral": [
            "Tell me about a time you faced a conflict in your team.",
            "Describe a situation where you had to meet a tight deadline.",
            "How do you handle constructive criticism?",
            "Tell me about a project you're most proud of.",
            "Describe a time when you had to learn something new quickly.",
            "How do you prioritize tasks when everything seems urgent?",
            "Tell me about a time you failed and what you learned.",
            "How do you handle working with difficult team members?"
        ]
    }
    
    @staticmethod
    def get_questions_by_type(question_type: str, count: int = 10, difficulty: str = None) -> List[Dict[str, Any]]:
        """Get random non-repeating questions by type"""
        questions_map = {
            "aptitude": QuestionBank.APTITUDE_QUESTIONS,
            "reasoning": QuestionBank.REASONING_QUESTIONS,
            "coding": QuestionBank.CODING_QUESTIONS,
            "communication": QuestionBank.COMMUNICATION_QUESTIONS
        }
        
        questions = questions_map.get(question_type, [])
        
        # Filter by difficulty if specified
        if difficulty:
            questions = [q for q in questions if q.get('difficulty') == difficulty]
        
        # If not enough questions, return all available
        if len(questions) <= count:
            return random.sample(questions, len(questions))
        
        # Return random sample without repetition
        return random.sample(questions, count)
    
    @staticmethod
    def get_interview_questions(interview_type: str, count: int = 5) -> List[str]:
        """Get random interview questions by type"""
        questions = QuestionBank.INTERVIEW_SCENARIOS.get(
            interview_type, 
            QuestionBank.INTERVIEW_SCENARIOS["hr"]
        )
        
        # Return random sample without repetition
        return random.sample(questions, min(count, len(questions)))
