"""Topic / Subtopic catalog for Aptitude, Reasoning, and Verbal modules.

Used to drive the Category → Topic → Subtopic → Difficulty navigation flow.
Each topic has a stable id (slug) that maps to seed questions and Gemini-
generated questions.
"""
from typing import Dict, List, Any

CATEGORIES: Dict[str, Dict[str, Any]] = {
    "quantitative": {
        "id": "quantitative",
        "name": "Quantitative Aptitude",
        "description": "Numbers, arithmetic, algebra, geometry, and data interpretation",
        "icon": "calculator",
        "color": "from-blue-500 to-cyan-500",
        "topics": [
            {"id": "percentage", "name": "Percentage", "subtopics": ["Basic Percentages", "Percentage Change", "Successive Percentage"]},
            {"id": "profit-loss", "name": "Profit & Loss", "subtopics": ["Profit %", "Loss %", "Discount", "MP & SP"]},
            {"id": "simple-interest", "name": "Simple Interest", "subtopics": ["Principal & Rate", "Time-based SI"]},
            {"id": "compound-interest", "name": "Compound Interest", "subtopics": ["Annual CI", "Half-yearly CI", "Quarterly CI"]},
            {"id": "ratio-proportion", "name": "Ratio & Proportion", "subtopics": ["Simple Ratio", "Compound Ratio", "Proportion"]},
            {"id": "average", "name": "Average", "subtopics": ["Simple Average", "Weighted Average", "Average Speed"]},
            {"id": "partnership", "name": "Partnership", "subtopics": ["Simple Partnership", "Compound Partnership"]},
            {"id": "time-work", "name": "Time & Work", "subtopics": ["Single Worker", "Multiple Workers", "Efficiency"]},
            {"id": "pipes-cisterns", "name": "Pipes & Cisterns", "subtopics": ["Inlet Pipes", "Outlet Pipes", "Combined"]},
            {"id": "speed-distance", "name": "Time, Speed & Distance", "subtopics": ["Basic TSD", "Relative Speed", "Trains"]},
            {"id": "boats-streams", "name": "Boats & Streams", "subtopics": ["Upstream/Downstream", "Speed of Stream"]},
            {"id": "probability", "name": "Probability", "subtopics": ["Basic Events", "Conditional", "Independent Events"]},
            {"id": "permutation-combination", "name": "Permutation & Combination", "subtopics": ["nPr Basics", "nCr Basics", "Arrangements"]},
            {"id": "number-system", "name": "Number System", "subtopics": ["Divisibility", "Remainders", "Prime Numbers"]},
            {"id": "hcf-lcm", "name": "HCF & LCM", "subtopics": ["HCF Methods", "LCM Methods", "Word Problems"]},
            {"id": "simplification", "name": "Simplification", "subtopics": ["BODMAS", "Approximation"]},
            {"id": "ap", "name": "Arithmetic Progression", "subtopics": ["nth Term", "Sum of n Terms"]},
            {"id": "geometry", "name": "Geometry", "subtopics": ["Triangles", "Circles", "Polygons"]},
            {"id": "area-perimeter", "name": "Area & Perimeter", "subtopics": ["Rectangles", "Circles", "Triangles"]},
            {"id": "mensuration", "name": "Mensuration", "subtopics": ["2D Shapes", "3D Shapes", "Volume"]},
            {"id": "algebra", "name": "Algebra", "subtopics": ["Linear Equations", "Quadratic Equations", "Polynomials"]},
            {"id": "data-interpretation", "name": "Data Interpretation", "subtopics": ["Tables", "Bar Charts", "Pie Charts"]},
            {"id": "mixture-allegation", "name": "Mixture & Allegation", "subtopics": ["Simple Mixture", "Allegation Rule"]},
            {"id": "ages", "name": "Problems on Ages", "subtopics": ["Present Age", "Future/Past Age", "Ratio of Ages"]},
            {"id": "decimal-fractions", "name": "Decimal & Fractions", "subtopics": ["Conversion", "Operations"]},
            {"id": "surds-indices", "name": "Surds & Indices", "subtopics": ["Laws of Indices", "Surds Simplification"]},
            {"id": "logarithms", "name": "Logarithms", "subtopics": ["Basic Log Laws", "Change of Base"]},
        ],
    },
    "logical": {
        "id": "logical",
        "name": "Logical Reasoning",
        "description": "Patterns, deductive reasoning, and analytical puzzles",
        "icon": "puzzle",
        "color": "from-purple-500 to-pink-500",
        "topics": [
            {"id": "blood-relations", "name": "Blood Relations", "subtopics": ["Family Tree", "Generation Logic"]},
            {"id": "seating-arrangement", "name": "Seating Arrangement", "subtopics": ["Linear", "Circular", "Square Table"]},
            {"id": "direction-sense", "name": "Direction Sense", "subtopics": ["Cardinal Directions", "Distance Calculation"]},
            {"id": "coding-decoding", "name": "Coding-Decoding", "subtopics": ["Letter Coding", "Number Coding", "Symbol Coding"]},
            {"id": "statement-conclusion", "name": "Statement & Conclusion", "subtopics": ["Single Statement", "Multiple Statements"]},
            {"id": "syllogism", "name": "Syllogism", "subtopics": ["All-Some", "No Statements", "Possibility Cases"]},
            {"id": "puzzles", "name": "Puzzle Solving", "subtopics": ["Floor Puzzles", "Day-Based", "Comparison"]},
            {"id": "calendar", "name": "Calendar", "subtopics": ["Day Calculation", "Leap Year", "Odd Days"]},
            {"id": "clock", "name": "Clock", "subtopics": ["Angle Between Hands", "Time Reflection"]},
            {"id": "series", "name": "Series Completion", "subtopics": ["Number Series", "Letter Series", "Mixed Series"]},
            {"id": "analogy", "name": "Analogy", "subtopics": ["Word Analogy", "Number Analogy", "Letter Analogy"]},
            {"id": "classification", "name": "Classification", "subtopics": ["Odd One Out - Words", "Odd One Out - Numbers"]},
            {"id": "cause-effect", "name": "Cause & Effect", "subtopics": ["Event Analysis"]},
            {"id": "ranking", "name": "Ranking", "subtopics": ["Linear Ranking", "Combined Ranking"]},
            {"id": "order-arrangement", "name": "Order & Arrangement", "subtopics": ["Sequencing", "Ordering"]},
        ],
    },
    "verbal": {
        "id": "verbal",
        "name": "Verbal Ability",
        "description": "English grammar, vocabulary, and comprehension",
        "icon": "book",
        "color": "from-green-500 to-emerald-500",
        "topics": [
            {"id": "reading-comprehension", "name": "Reading Comprehension", "subtopics": ["Inference", "Main Idea", "Vocabulary in Context"]},
            {"id": "synonyms", "name": "Synonyms", "subtopics": ["Common Words", "Advanced Vocabulary"]},
            {"id": "antonyms", "name": "Antonyms", "subtopics": ["Common Words", "Advanced Vocabulary"]},
            {"id": "sentence-correction", "name": "Sentence Correction", "subtopics": ["Subject-Verb Agreement", "Tenses", "Modifiers"]},
            {"id": "para-jumbles", "name": "Para Jumbles", "subtopics": ["4-sentence", "5-sentence"]},
            {"id": "fill-blanks", "name": "Fill in the Blanks", "subtopics": ["Single Blank", "Double Blank"]},
            {"id": "vocabulary", "name": "Vocabulary", "subtopics": ["Idioms", "Phrases", "Word Usage"]},
            {"id": "error-detection", "name": "Error Detection", "subtopics": ["Grammar Errors", "Spelling"]},
            {"id": "active-passive", "name": "Active/Passive Voice", "subtopics": ["Conversion", "Identification"]},
            {"id": "direct-indirect", "name": "Direct/Indirect Speech", "subtopics": ["Statements", "Questions", "Commands"]},
        ],
    },
}

# Reasoning is a sub-set of logical for the Reasoning module page (kept for parity)
REASONING_CATEGORIES: Dict[str, Dict[str, Any]] = {
    "pattern": {
        "id": "pattern",
        "name": "Pattern Recognition",
        "description": "Identify patterns in sequences and series",
        "icon": "refresh",
        "color": "from-blue-500 to-cyan-500",
        "topics": [
            {"id": "number-series", "name": "Number Series", "subtopics": ["Arithmetic", "Geometric", "Mixed"]},
            {"id": "letter-series", "name": "Letter Series", "subtopics": ["Single Step", "Multi Step"]},
            {"id": "shape-pattern", "name": "Shape Pattern", "subtopics": ["Rotational", "Reflective"]},
        ],
    },
    "analytical": {
        "id": "analytical",
        "name": "Analytical Reasoning",
        "description": "Deduction puzzles and logic problems",
        "icon": "brain",
        "color": "from-purple-500 to-pink-500",
        "topics": [
            {"id": "syllogism", "name": "Syllogism", "subtopics": ["Standard", "Possibility"]},
            {"id": "puzzles", "name": "Puzzles", "subtopics": ["Linear", "Floor", "Day-based"]},
            {"id": "logical-deduction", "name": "Logical Deduction", "subtopics": ["If-Then", "Cause-Effect"]},
        ],
    },
    "visual": {
        "id": "visual",
        "name": "Visual Reasoning",
        "description": "Spatial awareness and visual puzzles",
        "icon": "eye",
        "color": "from-green-500 to-emerald-500",
        "topics": [
            {"id": "mirror-water", "name": "Mirror & Water Image", "subtopics": ["Letters", "Numbers"]},
            {"id": "cube-counting", "name": "Cube Counting", "subtopics": ["Painted Cubes", "Volume"]},
            {"id": "embedded-figures", "name": "Embedded Figures", "subtopics": ["Find Shape"]},
        ],
    },
}


def get_category(category_id: str) -> Dict[str, Any]:
    return CATEGORIES.get(category_id) or REASONING_CATEGORIES.get(category_id)


def get_topic(category_id: str, topic_id: str) -> Dict[str, Any]:
    cat = get_category(category_id)
    if not cat:
        return None
    for t in cat.get("topics", []):
        if t["id"] == topic_id:
            return t
    return None


def list_categories(module: str = "aptitude") -> List[Dict[str, Any]]:
    """Return categories as a list, with topic count appended."""
    source = CATEGORIES if module == "aptitude" else REASONING_CATEGORIES
    out = []
    for cat in source.values():
        c = {k: v for k, v in cat.items() if k != "topics"}
        c["topic_count"] = len(cat.get("topics", []))
        out.append(c)
    return out


def list_topics(category_id: str) -> List[Dict[str, Any]]:
    cat = get_category(category_id)
    return cat.get("topics", []) if cat else []
