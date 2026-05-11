import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { toast } from 'sonner';
import { Puzzle, Clock, CheckCircle, XCircle, Play, BarChart3, Target, ArrowLeft, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';

const categories = [
  {
    id: 'pattern',
    name: 'Pattern Recognition',
    description: 'Identify patterns in sequences and series',
    icon: '🔄',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'analytical',
    name: 'Analytical Reasoning',
    description: 'Solve logic puzzles and deductive problems',
    icon: '🧠',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'visual',
    name: 'Visual Reasoning',
    description: 'Spatial awareness and visual puzzles',
    icon: '👁️',
    color: 'from-green-500 to-emerald-500'
  }
];

const difficulties = [
  {
    id: 'easy',
    name: 'Easy',
    description: 'Foundation building • Perfect for beginners',
    icon: '🌱',
    color: 'from-emerald-500 to-green-500',
    borderColor: 'emerald-500'
  },
  {
    id: 'medium',
    name: 'Medium',
    description: 'Moderate challenge • Intermediate level',
    icon: '⚡',
    color: 'from-violet-500 to-purple-500',
    borderColor: 'violet-500'
  },
  {
    id: 'hard',
    name: 'Hard',
    description: 'Expert level • Competitive difficulty',
    icon: '🔥',
    color: 'from-red-500 to-orange-500',
    borderColor: 'red-500'
  }
];

const ReasoningModule = () => {
  const [view, setView] = useState('categories'); // categories, difficulty-select, mode-select, practice, test, results
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(90);
  const [isActive, setIsActive] = useState(false);
  const [results, setResults] = useState([]);
  const [mode, setMode] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      handleSubmit();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const fetchQuestions = async (category, testMode, difficulty) => {
    setLoading(true);
    try {
      const count = testMode === 'test' ? 20 : 10;
      const response = await api.get(
        `/questions/reasoning?category=${category}&difficulty=${difficulty}&count=${count}`
      );

      if (response.data && response.data.length > 0) {
        setQuestions(response.data);
        toast.success(`Loaded ${response.data.length} ${difficulty} questions`);
      } else {
        toast.error('No questions available for this combination');
        setView('difficulty-select');
      }
    } catch (error) {
      console.error('Failed to load questions:', error);
      toast.error('Failed to load questions');
      setView('difficulty-select');
    } finally {
      setLoading(false);
    }
  };

  const startPractice = (category) => {
    setSelectedCategory(category);
    setView('difficulty-select');
  };

  const selectDifficulty = (difficulty) => {
    setSelectedDifficulty(difficulty);
    setView('mode-select');
  };

  const startMode = async (selectedMode) => {
    setMode(selectedMode);
    setCurrentQuestion(0);
    setResults([]);
    setSelectedAnswer(null);
    await fetchQuestions(selectedCategory.id, selectedMode, selectedDifficulty.id);
    setView(selectedMode === 'practice' ? 'practice' : 'test');
    setIsActive(true);
    setTimeLeft(90);
  };

  const handleSubmit = async () => {
    setIsActive(false);
    const question = questions[currentQuestion];

    try {
      const response = await api.post('/attempts', {
        question_id: question.title,
        answer: selectedAnswer || '',
        time_taken: (question.time_limit || 90) - timeLeft,
        mode: mode
      });

      setResults(prev => [...prev, {
        question: question.title,
        correct: response.data.attempt.is_correct,
        score: response.data.attempt.score
      }]);

      if (response.data.xp_earned) {
        toast.success(`+${response.data.xp_earned} XP earned!`);
      }
    } catch (error) {
      const msg = error?.response?.data?.detail;
      toast.error(typeof msg === 'string' ? msg : 'Failed to submit answer');
      // Record locally so progress isn't lost
      const isCorrect = (question.correct_answer || '').trim().toLowerCase() === (selectedAnswer || '').trim().toLowerCase();
      setResults(prev => [...prev, {
        question: question.title,
        correct: isCorrect,
        score: isCorrect ? 100 : 0,
      }]);
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setTimeLeft(questions[currentQuestion + 1]?.time_limit || 90);
      setIsActive(true);
    } else {
      setView('results');
    }
  };

  const resetModule = () => {
    setView('categories');
    setSelectedCategory(null);
    setSelectedDifficulty(null);
    setQuestions([]);
    setCurrentQuestion(0);
    setResults([]);
    setMode(null);
  };

  // Categories View
  if (view === 'categories') {
    return (
      <div className="space-y-8" data-testid="reasoning-categories">
        <div>
          <h1 className="text-4xl font-bold mb-2">Reasoning Training</h1>
          <p className="text-muted-foreground">Sharpen your analytical and logical thinking</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category, idx) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => startPractice(category)}
              className="glass p-8 rounded-2xl cursor-pointer hover:border-indigo-500/50 transition-all hover-lift group"
              data-testid={`reasoning-category-${category.id}`}
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform`}>
                {category.icon}
              </div>
              <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
              <p className="text-muted-foreground mb-4">{category.description}</p>
              <Button className="w-full btn-glow">Start Training</Button>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // Difficulty Selection View - NEW!
  if (view === 'difficulty-select') {
    return (
      <div className="max-w-5xl mx-auto space-y-6" data-testid="reasoning-difficulty-select">
        <button
          onClick={() => setView('categories')}
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to categories
        </button>

        <div className="text-center mb-8">
          <div className={`w-20 h-20 bg-gradient-to-br ${selectedCategory.color} rounded-2xl flex items-center justify-center text-5xl mx-auto mb-4`}>
            {selectedCategory.icon}
          </div>
          <h1 className="text-4xl font-bold mb-2">{selectedCategory.name}</h1>
          <p className="text-muted-foreground mb-1">{selectedCategory.description}</p>
          <p className="text-sm text-indigo-400 flex items-center justify-center gap-2 mt-2">
            <TrendingUp className="w-4 h-4" />
            Choose your difficulty level
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {difficulties.map((difficulty, idx) => (
            <motion.div
              key={difficulty.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => selectDifficulty(difficulty)}
              className={`glass p-8 rounded-2xl cursor-pointer border-2 border-transparent hover:border-${difficulty.borderColor}/50 transition-all hover-lift text-center group`}
              data-testid={`reasoning-difficulty-${difficulty.id}`}
            >
              <div className={`w-20 h-20 bg-gradient-to-br ${difficulty.color} rounded-full flex items-center justify-center text-5xl mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                {difficulty.icon}
              </div>
              <h3 className="text-3xl font-bold mb-2">{difficulty.name}</h3>
              <p className="text-muted-foreground text-sm">{difficulty.description}</p>
              <div className="mt-6">
                <Button className="w-full btn-glow">
                  Select {difficulty.name}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // Mode Selection View
  if (view === 'mode-select') {
    return (
      <div className="max-w-4xl mx-auto space-y-6" data-testid="reasoning-mode-select">
        <button
          onClick={() => setView('difficulty-select')}
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to difficulty
        </button>

        <div className="text-center mb-8">
          <div className={`w-20 h-20 bg-gradient-to-br ${selectedCategory.color} rounded-2xl flex items-center justify-center text-5xl mx-auto mb-4`}>
            {selectedCategory.icon}
          </div>
          <h1 className="text-4xl font-bold mb-2">{selectedCategory.name}</h1>
          <div className="flex items-center justify-center gap-3 text-muted-foreground">
            <span>{selectedCategory.description}</span>
            <span>•</span>
            <span className={`font-semibold capitalize ${
              selectedDifficulty.id === 'easy' ? 'text-emerald-400' :
              selectedDifficulty.id === 'medium' ? 'text-violet-400' :
              'text-red-400'
            }`}>
              {selectedDifficulty.icon} {selectedDifficulty.name}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => startMode('practice')}
            className="glass p-8 rounded-2xl cursor-pointer hover:border-indigo-500/50 transition-all hover-lift text-center"
            data-testid="reasoning-mode-practice"
          >
            <Target className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Practice Mode</h3>
            <p className="text-muted-foreground mb-4">10 questions • Learn at your pace • Instant feedback</p>
            <Button className="btn-glow">
              <Play className="w-5 h-5 mr-2" />
              Start Practice
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => startMode('test')}
            className="glass p-8 rounded-2xl cursor-pointer hover:border-indigo-500/50 transition-all hover-lift text-center"
            data-testid="reasoning-mode-test"
          >
            <BarChart3 className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Test Mode</h3>
            <p className="text-muted-foreground mb-4">20 questions • Timed • Performance tracking</p>
            <Button className="btn-glow">
              <Play className="w-5 h-5 mr-2" />
              Start Test
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Results View
  if (view === 'results') {
    const avgScore = results.length > 0 ? results.reduce((acc, r) => acc + r.score, 0) / results.length : 0;
    const correctCount = results.filter(r => r.correct).length;

    return (
      <div className="max-w-4xl mx-auto" data-testid="reasoning-results">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-12 rounded-2xl text-center space-y-6"
        >
          <div className={`w-24 h-24 bg-gradient-to-br ${selectedCategory.color} rounded-full flex items-center justify-center mx-auto`}>
            {avgScore >= 70 ? (
              <CheckCircle className="w-12 h-12 text-white" />
            ) : (
              <Puzzle className="w-12 h-12 text-white" />
            )}
          </div>

          <h1 className="text-4xl font-bold">{mode === 'practice' ? 'Practice' : 'Test'} Completed!</h1>

          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <span className="capitalize">{selectedDifficulty.name}</span>
            <span>•</span>
            <span>{selectedCategory.name}</span>
          </div>

          <div className="text-7xl font-bold gradient-text">{Math.round(avgScore)}%</div>

          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="bg-card/50 p-4 rounded-xl border border-border">
              <div className="text-2xl font-bold">{correctCount}</div>
              <div className="text-sm text-muted-foreground">Correct</div>
            </div>
            <div className="bg-card/50 p-4 rounded-xl border border-border">
              <div className="text-2xl font-bold">{results.length - correctCount}</div>
              <div className="text-sm text-muted-foreground">Wrong</div>
            </div>
            <div className="bg-card/50 p-4 rounded-xl border border-border">
              <div className="text-2xl font-bold">{results.length}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
          </div>

          <div className="flex gap-4 justify-center flex-wrap">
            <Button onClick={resetModule} variant="outline">Back to Categories</Button>
            <Button onClick={() => setView('difficulty-select')} variant="outline">
              Try Different Difficulty
            </Button>
            <Button onClick={() => startMode(mode)} className="btn-glow">Try Again</Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Question View (Practice/Test)
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="text-muted-foreground">Loading {selectedDifficulty?.name} questions...</p>
      </div>
    );
  }

  if (questions.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <XCircle className="w-16 h-16 text-red-500" />
        <p className="text-foreground text-xl">No questions available</p>
        <Button onClick={() => setView('difficulty-select')} variant="outline">
          Go Back
        </Button>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="max-w-4xl mx-auto" data-testid="reasoning-question-container">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={resetModule} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-muted-foreground">
              {selectedCategory.name} • <span className="capitalize">{selectedDifficulty.name}</span> • {mode === 'practice' ? 'Practice' : 'Test'}
            </span>
          </div>
          <p className="text-muted-foreground">Question {currentQuestion + 1} of {questions.length}</p>
          <Progress value={(currentQuestion / questions.length) * 100} className="mt-2" />
        </div>
        <div className="flex items-center gap-2 glass px-4 py-2 rounded-full border border-border">
          <Clock className="w-5 h-5 text-orange-500" />
          <span className="font-mono font-semibold">{timeLeft}s</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="glass p-8 rounded-2xl space-y-6 border border-border"
        >
          <div>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              question?.difficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
              question?.difficulty === 'medium' ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' :
              'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {question?.difficulty}
            </span>
          </div>

          <h2 className="text-2xl font-bold">{question?.title}</h2>
          <p className="text-foreground text-lg">{question?.description}</p>

          <div className="space-y-3">
            {question?.options?.map((option, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedAnswer(option)}
                data-testid={`reasoning-option-${idx}`}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  selectedAnswer === option
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-border hover:border-indigo-500/50'
                }`}
              >
                <span className="font-semibold mr-3">{String.fromCharCode(65 + idx)}.</span>
                {option}
              </button>
            ))}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!selectedAnswer}
            className="w-full btn-glow"
            data-testid="reasoning-submit-btn"
          >
            {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish'}
          </Button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ReasoningModule;
