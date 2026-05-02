from typing import Dict, Any, List
from datetime import datetime, timezone
import random

class QuestionBank:
    """Expanded question bank with sufficient questions for all modules"""
    
    # Expanded Aptitude Questions - Now with 30+ questions per category
    APTITUDE_QUESTIONS = [
        # Quantitative - 15 questions
        {"category": "quantitative", "title": "Simple Interest", "description": "If $5000 is invested at 5% simple interest per annum, what will be the total amount after 3 years?", "difficulty": "easy", "options": ["$5500", "$5750", "$5250", "$6000"], "correct_answer": "$5750", "points": 10, "time_limit": 60},
        {"category": "quantitative", "title": "Percentage Calculation", "description": "What is 15% of 240?", "difficulty": "easy", "options": ["30", "36", "40", "45"], "correct_answer": "36", "points": 10, "time_limit": 45},
        {"category": "quantitative", "title": "Profit and Loss", "description": "A shopkeeper bought an item for $80 and sold it for $100. What is the profit percentage?", "difficulty": "easy", "options": ["20%", "25%", "30%", "15%"], "correct_answer": "25%", "points": 10, "time_limit": 60},
        {"category": "quantitative", "title": "Time and Work", "description": "A can complete a work in 12 days and B can complete it in 18 days. How many days will they take together?", "difficulty": "medium", "options": ["7.2 days", "8 days", "9 days", "10 days"], "correct_answer": "7.2 days", "points": 15, "time_limit": 90},
        {"category": "quantitative", "title": "Speed Distance Time", "description": "A train travels 120 km in 2 hours. What is its speed in km/h?", "difficulty": "medium", "options": ["50 km/h", "60 km/h", "70 km/h", "80 km/h"], "correct_answer": "60 km/h", "points": 15, "time_limit": 60},
        {"category": "quantitative", "title": "Ratio and Proportion", "description": "The ratio of boys to girls in a class is 3:2. If there are 15 boys, how many girls are there?", "difficulty": "medium", "options": ["8", "10", "12", "15"], "correct_answer": "10", "points": 15, "time_limit": 75},
        {"category": "quantitative", "title": "Compound Interest", "description": "What is the compound interest on $1000 at 10% per annum for 2 years?", "difficulty": "medium", "options": ["$200", "$210", "$220", "$250"], "correct_answer": "$210", "points": 15, "time_limit": 90},
        {"category": "quantitative", "title": "Average", "description": "The average of 5 numbers is 20. If one number is excluded, the average becomes 15. What is the excluded number?", "difficulty": "medium", "options": ["25", "30", "35", "40"], "correct_answer": "40", "points": 15, "time_limit": 75},
        {"category": "quantitative", "title": "Age Problem", "description": "John is 5 years older than Mary. 10 years ago, John was twice as old as Mary. How old is Mary now?", "difficulty": "hard", "options": ["15", "20", "25", "30"], "correct_answer": "25", "points": 20, "time_limit": 120},
        {"category": "quantitative", "title": "Mixture Problem", "description": "In what ratio should water be mixed with milk costing $50/liter to get a mixture worth $40/liter?", "difficulty": "hard", "options": ["1:4", "1:5", "2:3", "1:3"], "correct_answer": "1:4", "points": 20, "time_limit": 120},
        {"category": "quantitative", "title": "Boats and Streams", "description": "A boat travels 30 km upstream in 5 hours and 30 km downstream in 3 hours. What is the speed of the stream?", "difficulty": "hard", "options": ["1 km/h", "2 km/h", "3 km/h", "4 km/h"], "correct_answer": "2 km/h", "points": 20, "time_limit": 150},
        {"category": "quantitative", "title": "Pipes and Cisterns", "description": "Pipe A fills a tank in 6 hours; Pipe B empties it in 9 hours. If both are opened together, in how many hours is the tank filled?", "difficulty": "hard", "options": ["12 hours", "15 hours", "18 hours", "20 hours"], "correct_answer": "18 hours", "points": 20, "time_limit": 150},
        {"category": "quantitative", "title": "Number System", "description": "If x + 1/x = 5, what is the value of x² + 1/x²?", "difficulty": "hard", "options": ["21", "23", "25", "27"], "correct_answer": "23", "points": 20, "time_limit": 120},
        {"category": "quantitative", "title": "Alligation", "description": "In what ratio must rice at $9/kg be mixed with rice at $7/kg so that the mixture is $8/kg?", "difficulty": "hard", "options": ["1:1", "1:2", "2:1", "2:3"], "correct_answer": "1:1", "points": 20, "time_limit": 120},
        {"category": "quantitative", "title": "Area Calculation", "description": "A rectangular field is 20m long and 15m wide. What is its area?", "difficulty": "easy", "options": ["200 sq m", "250 sq m", "300 sq m", "350 sq m"], "correct_answer": "300 sq m", "points": 10, "time_limit": 45},
        {"category": "quantitative", "title": "Discount", "description": "A shirt marked at $500 is sold at a discount of 20%. What is the selling price?", "difficulty": "easy", "options": ["$300", "$350", "$400", "$450"], "correct_answer": "$400", "points": 10, "time_limit": 60},
        {"category": "quantitative", "title": "Time Calculation", "description": "If a clock shows 3:15, what is the angle between hour and minute hands?", "difficulty": "medium", "options": ["0°", "7.5°", "15°", "22.5°"], "correct_answer": "7.5°", "points": 15, "time_limit": 90},
        {"category": "quantitative", "title": "Probability", "description": "What is the probability of getting a sum of 7 when two dice are rolled?", "difficulty": "medium", "options": ["1/6", "1/4", "1/3", "1/2"], "correct_answer": "1/6", "points": 15, "time_limit": 75},
        {"category": "quantitative", "title": "Permutation", "description": "In how many ways can 4 people sit in a row?", "difficulty": "easy", "options": ["12", "16", "20", "24"], "correct_answer": "24", "points": 10, "time_limit": 60},
        
        # Logical - 15 questions
        {"category": "logical", "title": "Number Series 1", "description": "What comes next: 2, 6, 12, 20, 30, ?", "difficulty": "easy", "options": ["40", "42", "45", "38"], "correct_answer": "42", "points": 10, "time_limit": 60},
        {"category": "logical", "title": "Number Series 2", "description": "What comes next: 5, 10, 20, 40, ?", "difficulty": "easy", "options": ["60", "70", "80", "90"], "correct_answer": "80", "points": 10, "time_limit": 60},
        {"category": "logical", "title": "Number Series 3", "description": "What comes next: 1, 4, 9, 16, 25, ?", "difficulty": "easy", "options": ["30", "32", "36", "40"], "correct_answer": "36", "points": 10, "time_limit": 60},
        {"category": "logical", "title": "Number Series 4", "description": "What comes next: 2, 3, 5, 7, 11, ?", "difficulty": "medium", "options": ["12", "13", "15", "17"], "correct_answer": "13", "points": 15, "time_limit": 75},
        {"category": "logical", "title": "Odd One Out", "description": "Which one is different: Apple, Mango, Banana, Carrot", "difficulty": "easy", "options": ["Apple", "Mango", "Banana", "Carrot"], "correct_answer": "Carrot", "points": 10, "time_limit": 45},
        {"category": "logical", "title": "Blood Relations", "description": "If A is the brother of B, B is the sister of C, and C is the father of D, how is A related to D?", "difficulty": "medium", "options": ["Uncle", "Brother", "Father", "Cousin"], "correct_answer": "Uncle", "points": 15, "time_limit": 90},
        {"category": "logical", "title": "Direction Sense", "description": "A walks 10m North, then 5m East, then 10m South. How far is he from starting point?", "difficulty": "medium", "options": ["5m", "10m", "15m", "25m"], "correct_answer": "5m", "points": 15, "time_limit": 90},
        {"category": "logical", "title": "Coding-Decoding", "description": "If CAT is coded as 3120, what is DOG coded as?", "difficulty": "medium", "options": ["4157", "4167", "4177", "4187"], "correct_answer": "4157", "points": 15, "time_limit": 90},
        {"category": "logical", "title": "Analogy", "description": "Book is to Author as Painting is to ?", "difficulty": "easy", "options": ["Artist", "Canvas", "Color", "Brush"], "correct_answer": "Artist", "points": 10, "time_limit": 45},
        {"category": "logical", "title": "Syllogism", "description": "All roses are flowers. Some flowers are red. Therefore:", "difficulty": "medium", "options": ["All roses are red", "Some roses are red", "No roses are red", "Cannot determine"], "correct_answer": "Cannot determine", "points": 15, "time_limit": 90},
        {"category": "logical", "title": "Calendar", "description": "If January 1, 2020 was Wednesday, what day was January 1, 2021?", "difficulty": "medium", "options": ["Thursday", "Friday", "Saturday", "Sunday"], "correct_answer": "Friday", "points": 15, "time_limit": 75},
        {"category": "logical", "title": "Ranking", "description": "In a class of 40 students, Ravi is 7th from top. What is his rank from bottom?", "difficulty": "easy", "options": ["33", "34", "35", "36"], "correct_answer": "34", "points": 10, "time_limit": 60},
        {"category": "logical", "title": "Number Analogy", "description": "25:625 :: 15:?", "difficulty": "medium", "options": ["125", "225", "325", "425"], "correct_answer": "225", "points": 15, "time_limit": 75},
        {"category": "logical", "title": "Letter Series", "description": "What comes next: ACE, BDF, CEG, ?", "difficulty": "medium", "options": ["DFH", "DGI", "EGI", "EFH"], "correct_answer": "DFH", "points": 15, "time_limit": 75},
        {"category": "logical", "title": "Venn Diagram", "description": "In a group of 50 people, 30 like tea, 25 like coffee, and 10 like both. How many like neither?", "difficulty": "hard", "options": ["5", "10", "15", "20"], "correct_answer": "5", "points": 20, "time_limit": 120},
        {"category": "logical", "title": "Cube Puzzle", "description": "A cube of side 4 cm is painted and cut into 1 cm cubes. How many small cubes have exactly 2 faces painted?", "difficulty": "hard", "options": ["12", "16", "24", "32"], "correct_answer": "24", "points": 20, "time_limit": 120},
        {"category": "logical", "title": "Complex Coding", "description": "If MONKEY is coded as XDMJOL, then TIGER is coded as?", "difficulty": "hard", "options": ["QDFHS", "UJHFS", "QHFDS", "SDFHQ"], "correct_answer": "QDFHS", "points": 20, "time_limit": 150},
        {"category": "logical", "title": "Circular Arrangement", "description": "8 people sit around a circular table. If A sits opposite B, and C sits 3 seats to A's right, how many seats are between C and B?", "difficulty": "hard", "options": ["1", "2", "3", "4"], "correct_answer": "1", "points": 20, "time_limit": 150},
        {"category": "logical", "title": "Advanced Syllogism", "description": "All cats are mammals. No mammals are birds. Some birds fly. Which conclusion must be true?", "difficulty": "hard", "options": ["No cats are birds", "Some cats fly", "All birds are cats", "Some mammals fly"], "correct_answer": "No cats are birds", "points": 20, "time_limit": 120},
        {"category": "logical", "title": "Clock Problem", "description": "At what time between 4 and 5 o'clock will the hands of a clock be at right angles?", "difficulty": "hard", "options": ["4:05 5/11", "4:38 2/11", "Both A & B", "None"], "correct_answer": "Both A & B", "points": 20, "time_limit": 150},
        
        # Verbal - 15 questions
        {"category": "verbal", "title": "Synonym 1", "description": "Choose the word most similar to 'Happy'", "difficulty": "easy", "options": ["Joyful", "Sad", "Angry", "Tired"], "correct_answer": "Joyful", "points": 10, "time_limit": 45},
        {"category": "verbal", "title": "Antonym 1", "description": "Choose the opposite of 'Hot'", "difficulty": "easy", "options": ["Warm", "Cool", "Cold", "Freezing"], "correct_answer": "Cold", "points": 10, "time_limit": 45},
        {"category": "verbal", "title": "Synonym 2", "description": "Choose the word most similar to 'Ephemeral'", "difficulty": "hard", "options": ["Permanent", "Transient", "Eternal", "Solid"], "correct_answer": "Transient", "points": 20, "time_limit": 60},
        {"category": "verbal", "title": "Synonym 3", "description": "Choose the word most similar to 'Ubiquitous'", "difficulty": "hard", "options": ["Rare", "Omnipresent", "Hidden", "Unique"], "correct_answer": "Omnipresent", "points": 20, "time_limit": 60},
        {"category": "verbal", "title": "Antonym 3", "description": "Choose the opposite of 'Meticulous'", "difficulty": "hard", "options": ["Careful", "Careless", "Detailed", "Precise"], "correct_answer": "Careless", "points": 20, "time_limit": 60},
        {"category": "verbal", "title": "Advanced Idiom", "description": "What does 'Hobson's choice' mean?", "difficulty": "hard", "options": ["A difficult decision", "No real choice at all", "Best option", "Random selection"], "correct_answer": "No real choice at all", "points": 20, "time_limit": 75},
        {"category": "verbal", "title": "One Word Sub 2", "description": "Fear of closed spaces:", "difficulty": "hard", "options": ["Agoraphobia", "Claustrophobia", "Acrophobia", "Xenophobia"], "correct_answer": "Claustrophobia", "points": 20, "time_limit": 60},
        {"category": "verbal", "title": "Phrasal Verb", "description": "What does 'call off' mean?", "difficulty": "hard", "options": ["To announce loudly", "To cancel", "To postpone", "To remember"], "correct_answer": "To cancel", "points": 20, "time_limit": 60},
        {"category": "verbal", "title": "Antonym 2", "description": "Choose the opposite of 'Abundant'", "difficulty": "medium", "options": ["Plentiful", "Scarce", "Rich", "Full"], "correct_answer": "Scarce", "points": 15, "time_limit": 60},
        {"category": "verbal", "title": "Sentence Correction 1", "description": "Choose the correct sentence", "difficulty": "medium", "options": ["He don't like apples", "He doesn't like apples", "He doesn't likes apples", "He not like apples"], "correct_answer": "He doesn't like apples", "points": 15, "time_limit": 60},
        {"category": "verbal", "title": "Sentence Correction 2", "description": "Identify the error: 'Neither of the students have completed their homework'", "difficulty": "medium", "options": ["Neither", "have", "their", "No error"], "correct_answer": "have", "points": 15, "time_limit": 75},
        {"category": "verbal", "title": "Idiom", "description": "What does 'break the ice' mean?", "difficulty": "easy", "options": ["To start a conversation", "To stop working", "To break something", "To cool down"], "correct_answer": "To start a conversation", "points": 10, "time_limit": 45},
        {"category": "verbal", "title": "One Word Substitution", "description": "One who studies insects:", "difficulty": "medium", "options": ["Entomologist", "Zoologist", "Botanist", "Anthropologist"], "correct_answer": "Entomologist", "points": 15, "time_limit": 60},
        {"category": "verbal", "title": "Spelling", "description": "Choose the correctly spelled word:", "difficulty": "easy", "options": ["Accomodation", "Accommodation", "Acommodation", "Acomodation"], "correct_answer": "Accommodation", "points": 10, "time_limit": 45},
        {"category": "verbal", "title": "Fill in the Blank", "description": "He is addicted ___ smoking.", "difficulty": "easy", "options": ["to", "with", "from", "by"], "correct_answer": "to", "points": 10, "time_limit": 45},
        {"category": "verbal", "title": "Reading Comprehension", "description": "If 'The early bird catches the worm', what does it mean?", "difficulty": "medium", "options": ["Birds wake up early", "Success comes to those who prepare", "Worms are easy to catch", "Birds are fast"], "correct_answer": "Success comes to those who prepare", "points": 15, "time_limit": 75},
        {"category": "verbal", "title": "Analogy Verbal", "description": "Doctor : Hospital :: Teacher : ?", "difficulty": "easy", "options": ["School", "Student", "Book", "Class"], "correct_answer": "School", "points": 10, "time_limit": 45},
        {"category": "verbal", "title": "Sentence Rearrangement", "description": "Arrange: (A) is (B) the key (C) practice (D) to success", "difficulty": "medium", "options": ["CABD", "CBAD", "ABCD", "DCBA"], "correct_answer": "CABD", "points": 15, "time_limit": 90},
        {"category": "verbal", "title": "Active Passive", "description": "Convert to passive: 'She wrote a letter'", "difficulty": "medium", "options": ["A letter was written by her", "A letter is written by her", "A letter has written by her", "A letter written by her"], "correct_answer": "A letter was written by her", "points": 15, "time_limit": 75},
        {"category": "verbal", "title": "Para Jumble", "description": "Choose the correct order: (A) to learn (B) never too late (C) it is (D) new skills", "difficulty": "medium", "options": ["CBAD", "BCAD", "ABCD", "CBDA"], "correct_answer": "CBAD", "points": 15, "time_limit": 90}
    ]
    
    # Reasoning Questions - 25 questions
    REASONING_QUESTIONS = [
        {"category": "pattern", "title": "Pattern Recognition 1", "description": "Identify the pattern: Circle, Square, Triangle, Circle, Square, ?", "difficulty": "easy", "options": ["Triangle", "Circle", "Square", "Pentagon"], "correct_answer": "Triangle", "points": 10, "time_limit": 60},
        {"category": "pattern", "title": "Number Pattern 1", "description": "What comes next: 1, 4, 9, 16, 25, ?", "difficulty": "easy", "options": ["30", "32", "36", "40"], "correct_answer": "36", "points": 10, "time_limit": 60},
        {"category": "pattern", "title": "Letter Series", "description": "What comes next: A, C, E, G, ?", "difficulty": "easy", "options": ["H", "I", "J", "K"], "correct_answer": "I", "points": 10, "time_limit": 60},
        {"category": "pattern", "title": "Number Pattern 2", "description": "What comes next: 2, 4, 8, 16, ?", "difficulty": "easy", "options": ["24", "28", "32", "36"], "correct_answer": "32", "points": 10, "time_limit": 60},
        {"category": "pattern", "title": "Pattern 3", "description": "Complete: 3, 6, 12, 24, ?", "difficulty": "easy", "options": ["36", "42", "48", "54"], "correct_answer": "48", "points": 10, "time_limit": 60},
        {"category": "pattern", "title": "Pattern 4", "description": "What comes next: Z, Y, X, W, ?", "difficulty": "easy", "options": ["U", "V", "T", "S"], "correct_answer": "V", "points": 10, "time_limit": 60},
        {"category": "pattern", "title": "Pattern 5", "description": "Complete: 1, 1, 2, 3, 5, 8, ?", "difficulty": "medium", "options": ["11", "12", "13", "14"], "correct_answer": "13", "points": 15, "time_limit": 75},
        {"category": "pattern", "title": "Pattern 6", "description": "What comes next: 100, 81, 64, 49, ?", "difficulty": "medium", "options": ["30", "32", "36", "40"], "correct_answer": "36", "points": 15, "time_limit": 75},
        {"category": "pattern", "title": "Pattern 7", "description": "What comes next: 2, 6, 12, 20, 30, ?", "difficulty": "medium", "options": ["40", "42", "45", "48"], "correct_answer": "42", "points": 15, "time_limit": 75},
        {"category": "pattern", "title": "Pattern 8", "description": "Complete the pattern: 3, 8, 18, 38, 78, ?", "difficulty": "hard", "options": ["138", "148", "158", "168"], "correct_answer": "158", "points": 20, "time_limit": 120},
        {"category": "pattern", "title": "Pattern 9", "description": "What comes next: 7, 15, 31, 63, ?", "difficulty": "hard", "options": ["95", "111", "127", "143"], "correct_answer": "127", "points": 20, "time_limit": 120},
        {"category": "pattern", "title": "Pattern 10", "description": "What comes next: 1, 8, 27, 64, 125, ?", "difficulty": "hard", "options": ["180", "196", "216", "243"], "correct_answer": "216", "points": 20, "time_limit": 120},
        {"category": "pattern", "title": "Pattern 11", "description": "Next in series: AZ, BY, CX, DW, ?", "difficulty": "hard", "options": ["EV", "EU", "FV", "EW"], "correct_answer": "EV", "points": 20, "time_limit": 120},
        
        {"category": "analytical", "title": "Logic Puzzle 1", "description": "If all Bloops are Razzies and all Razzies are Lazzies, then all Bloops are definitely Lazzies. True or False?", "difficulty": "medium", "options": ["True", "False"], "correct_answer": "True", "points": 15, "time_limit": 90},
        {"category": "analytical", "title": "Seating Arrangement", "description": "Five people A, B, C, D, E sit in a row. A and B sit together, C sits at one end. Where does D sit?", "difficulty": "medium", "options": ["Next to C", "Between A and B", "At other end", "Cannot determine"], "correct_answer": "Cannot determine", "points": 15, "time_limit": 120},
        {"category": "analytical", "title": "Logic 2", "description": "If some cats are dogs and all dogs are animals, then:", "difficulty": "medium", "options": ["Some cats are animals", "All cats are animals", "No cats are animals", "Cannot say"], "correct_answer": "Some cats are animals", "points": 15, "time_limit": 90},
        {"category": "analytical", "title": "Puzzle 1", "description": "A is taller than B. C is shorter than B. Who is the tallest?", "difficulty": "easy", "options": ["A", "B", "C", "Cannot determine"], "correct_answer": "A", "points": 10, "time_limit": 60},
        {"category": "analytical", "title": "Logic 3", "description": "If P > Q and Q > R, then:", "difficulty": "easy", "options": ["P > R", "P < R", "P = R", "Cannot say"], "correct_answer": "P > R", "points": 10, "time_limit": 60},
        {"category": "analytical", "title": "Deduction", "description": "All students passed. John is a student. Therefore:", "difficulty": "easy", "options": ["John passed", "John failed", "Cannot say", "John is smart"], "correct_answer": "John passed", "points": 10, "time_limit": 60},
        {"category": "analytical", "title": "Logic 4", "description": "If today is Monday, what day will it be after 100 days?", "difficulty": "medium", "options": ["Monday", "Tuesday", "Wednesday", "Thursday"], "correct_answer": "Tuesday", "points": 15, "time_limit": 90},
        {"category": "analytical", "title": "Puzzle 2", "description": "In a family of 6, there are 2 parents and 4 children. If all children are boys, how many females?", "difficulty": "easy", "options": ["0", "1", "2", "3"], "correct_answer": "1", "points": 10, "time_limit": 60},
        {"category": "analytical", "title": "Complex Seating", "description": "A, B, C, D sit in a row. A is not at either end. C is to the right of A. B is to the left of A. Where is D?", "difficulty": "hard", "options": ["Left end", "Right end", "Between A and C", "Cannot determine"], "correct_answer": "Right end", "points": 20, "time_limit": 150},
        {"category": "analytical", "title": "Logic Deduction Hard", "description": "If 'All A are B' and 'Some B are C', which of the following must be true?", "difficulty": "hard", "options": ["Some A are C", "All A are C", "No A are C", "Cannot be determined"], "correct_answer": "Cannot be determined", "points": 20, "time_limit": 120},
        {"category": "analytical", "title": "Family Tree", "description": "P is the father of Q. Q is the sister of R. R is the son of S. How is S related to P?", "difficulty": "hard", "options": ["Wife", "Daughter", "Son", "Mother"], "correct_answer": "Wife", "points": 20, "time_limit": 120},
        {"category": "analytical", "title": "Complex Rank", "description": "In a class of 60, Raj ranks 15th from top and Amit is 10 ranks below Raj. What is Amit's rank from bottom?", "difficulty": "hard", "options": ["35", "36", "37", "38"], "correct_answer": "36", "points": 20, "time_limit": 120},
        
        {"category": "visual", "title": "Mirror Image", "description": "Which is the mirror image of 'SMART'?", "difficulty": "medium", "options": ["TRAMS", "TRAMS", "SMART", "TRAMS"], "correct_answer": "TRAMS", "points": 15, "time_limit": 75},
        {"category": "visual", "title": "Cube Counting", "description": "A cube is painted red on all faces and cut into 27 smaller cubes. How many have 2 red faces?", "difficulty": "hard", "options": ["8", "12", "6", "0"], "correct_answer": "12", "points": 20, "time_limit": 120},
        {"category": "visual", "title": "Shape Completion", "description": "Which shape completes the series: Circle, Triangle, Square, ?", "difficulty": "easy", "options": ["Pentagon", "Hexagon", "Circle", "Rectangle"], "correct_answer": "Pentagon", "points": 10, "time_limit": 60},
        {"category": "visual", "title": "Rotation", "description": "If a square is rotated 90° clockwise, it becomes:", "difficulty": "easy", "options": ["Same square", "Rectangle", "Circle", "Triangle"], "correct_answer": "Same square", "points": 10, "time_limit": 60},
        {"category": "visual", "title": "Paper Folding", "description": "A paper is folded and cut. When unfolded, how many holes?", "difficulty": "medium", "options": ["2", "4", "6", "8"], "correct_answer": "4", "points": 15, "time_limit": 90},
        {"category": "visual", "title": "Figure Matrix", "description": "In a 3x3 grid, if first row is Circle-Square-Triangle, second is Square-Triangle-Circle, third is:", "difficulty": "medium", "options": ["Triangle-Circle-Square", "Circle-Triangle-Square", "Square-Circle-Triangle", "Triangle-Square-Circle"], "correct_answer": "Triangle-Circle-Square", "points": 15, "time_limit": 90},
        {"category": "visual", "title": "Embedded Figure", "description": "Which shape is hidden in a complex figure?", "difficulty": "medium", "options": ["Triangle", "Square", "Circle", "All of above"], "correct_answer": "All of above", "points": 15, "time_limit": 90},
        {"category": "visual", "title": "Figure Counting", "description": "How many triangles in a Star of David?", "difficulty": "hard", "options": ["8", "10", "12", "14"], "correct_answer": "12", "points": 20, "time_limit": 120},
        {"category": "visual", "title": "Water Image", "description": "Water reflection of letter 'A' is:", "difficulty": "easy", "options": ["Same A", "Inverted A", "V", "Cannot determine"], "correct_answer": "Inverted A", "points": 10, "time_limit": 60}
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
        {"category": "hr", "title": "Tell me about yourself", "description": "Introduce yourself professionally, covering your background, skills, and career goals. (2-3 minutes)", "difficulty": "easy", "points": 20, "time_limit": 180},
        {"category": "behavioral", "title": "Describe a challenging project", "description": "Tell me about a challenging technical project you worked on. What was your role and how did you overcome obstacles?", "difficulty": "medium", "points": 25, "time_limit": 180},
        {"category": "hr", "title": "Why should we hire you?", "description": "Explain what makes you the best candidate for this position.", "difficulty": "medium", "points": 25, "time_limit": 150},
        {"category": "behavioral", "title": "Conflict resolution", "description": "Describe a time when you had a disagreement with a team member. How did you handle it?", "difficulty": "medium", "points": 25, "time_limit": 180}
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
    def get_questions_by_type(question_type: str, count: int = 10, difficulty: str = None, category: str = None) -> List[Dict[str, Any]]:
        """Get random non-repeating questions by type, category, and difficulty.

        Returns unique questions only. If the filtered pool has fewer questions
        than requested, returns all available unique questions (no duplicates).
        """
        questions_map = {
            "aptitude": QuestionBank.APTITUDE_QUESTIONS,
            "reasoning": QuestionBank.REASONING_QUESTIONS,
            "coding": QuestionBank.CODING_QUESTIONS,
            "communication": QuestionBank.COMMUNICATION_QUESTIONS
        }

        all_questions = questions_map.get(question_type, [])

        # Filter by category if specified
        if category:
            filtered = [q for q in all_questions if q.get('category') == category]
            if filtered:
                all_questions = filtered

        # Filter by difficulty if specified
        if difficulty:
            difficulty_filtered = [q for q in all_questions if q.get('difficulty') == difficulty]
            if difficulty_filtered:
                all_questions = difficulty_filtered

        if not all_questions:
            return []

        # Return up to `count` unique questions, shuffled
        sample_size = min(count, len(all_questions))
        return random.sample(all_questions, sample_size)
    
    @staticmethod
    def get_interview_questions(interview_type: str, count: int = 5) -> List[str]:
        """Get random interview questions by type"""
        questions = QuestionBank.INTERVIEW_SCENARIOS.get(
            interview_type, 
            QuestionBank.INTERVIEW_SCENARIOS["hr"]
        )
        
        # Return random sample without repetition
        return random.sample(questions, min(count, len(questions)))
