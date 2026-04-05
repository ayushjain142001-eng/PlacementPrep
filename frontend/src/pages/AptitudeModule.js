import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { toast } from 'sonner';
import { Brain, Clock, CheckCircle, XCircle, Play, BarChart3, Target, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';

const categories = [
  {
    id: 'quantitative',
    name: 'Quantitative Aptitude',
    description: 'Numbers, arithmetic, algebra, and data interpretation',
    icon: '🔢',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'logical',
    name: 'Logical Reasoning',
    description: 'Patterns, sequences, and analytical thinking',
    icon: '🧩',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'verbal',
    name: 'Verbal Ability',
    description: 'Grammar, vocabulary, and comprehension',
    icon: '📚',
    color: 'from-green-500 to-emerald-500'
  }
];

const AptitudeModule = () => {
  const [view, setView] = useState('categories'); // categories, mode-select, practice, test, results
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [results, setResults] = useState([]);
  const [mode, setMode] = useState(null); // practice or test
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

  const fetchQuestions = async (category, testMode) => {
    setLoading(true);
    try {
      const count = testMode === 'test' ? 20 : 10;
      const response = await api.get(`/questions/aptitude?category=${category}&count=${count}`);
      setQuestions(response.data);
    } catch (error) {
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const startPractice = (category) => {
    setSelectedCategory(category);
    setView('mode-select');
  };

  const startMode = async (selectedMode) => {
    setMode(selectedMode);
    setCurrentQuestion(0);
    setResults([]);
    setSelectedAnswer(null);
    await fetchQuestions(selectedCategory.id, selectedMode);
    setView(selectedMode === 'practice' ? 'practice' : 'test');
    setIsActive(true);
    setTimeLeft(60);
  };

  const handleSubmit = async () => {
    setIsActive(false);
    const question = questions[currentQuestion];
    
    try {
      const response = await api.post('/attempts', {
        question_id: question.title,
        answer: selectedAnswer || '',
        time_taken: (question.time_limit || 60) - timeLeft,
        mode: mode
      });
      
      setResults([...results, {
        question: question.title,
        correct: response.data.attempt.is_correct,
        score: response.data.attempt.score
      }]);

      toast.success(`+${response.data.xp_earned} XP earned!`);
      
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setTimeLeft(questions[currentQuestion + 1]?.time_limit || 60);
        setIsActive(true);
      } else {
        setView('results');
      }
    } catch (error) {
      toast.error('Failed to submit answer');
      // Move to next question anyway
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setTimeLeft(questions[currentQuestion + 1]?.time_limit || 60);
        setIsActive(true);
      } else {
        setView('results');
      }
    }
  };

  const resetModule = () => {
    setView('categories');
    setSelectedCategory(null);
    setQuestions([]);
    setCurrentQuestion(0);
    setResults([]);
    setMode(null);
  };

  // Categories View
  if (view === 'categories') {
    return (
      <div className="space-y-8" data-testid="aptitude-categories">
        <div>
          <h1 className="text-4xl font-bold mb-2">Aptitude Training</h1>
          <p className="text-muted-foreground">Choose a category to start practicing</p>
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
              data-testid={`category-${category.id}`}
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform`}>
                {category.icon}
              </div>
              <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
              <p className="text-muted-foreground mb-4">{category.description}</p>
              <Button className="w-full btn-glow">
                Start Training
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // Mode Selection View
  if (view === 'mode-select') {
    return (
      <div className="max-w-4xl mx-auto space-y-6" data-testid="mode-select">
        <button
          onClick={() => setView('categories')}
          className="flex items-center text-muted-foreground hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to categories
        </button>

        <div className="text-center mb-8">
          <div className={`w-20 h-20 bg-gradient-to-br ${selectedCategory.color} rounded-2xl flex items-center justify-center text-5xl mx-auto mb-4`}>
            {selectedCategory.icon}
          </div>
          <h1 className="text-4xl font-bold mb-2">{selectedCategory.name}</h1>
          <p className="text-muted-foreground">{selectedCategory.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => startMode('practice')}
            className="glass p-8 rounded-2xl cursor-pointer hover:border-indigo-500/50 transition-all hover-lift text-center"
            data-testid="mode-practice"
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
            data-testid="mode-test"
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
    const avgScore = results.length > 0 
      ? results.reduce((acc, r) => acc + r.score, 0) / results.length 
      : 0;
    const correctCount = results.filter(r => r.correct).length;

    return (
      <div className="max-w-4xl mx-auto" data-testid="test-results">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-12 rounded-2xl text-center space-y-6"
        >
          <div className={`w-24 h-24 bg-gradient-to-br ${selectedCategory.color} rounded-full flex items-center justify-center mx-auto`}>
            {avgScore >= 70 ? (
              <CheckCircle className="w-12 h-12 text-white" />
            ) : (
              <Target className="w-12 h-12 text-white" />
            )}
          </div>
          
          <h1 className="text-4xl font-bold">{mode === 'practice' ? 'Practice' : 'Test'} Completed!</h1>
          
          <div className="text-7xl font-bold gradient-text">{Math.round(avgScore)}%</div>
          
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="bg-card/50 p-4 rounded-xl">
              <div className="text-2xl font-bold">{correctCount}</div>
              <div className="text-sm text-muted-foreground">Correct</div>
            </div>
            <div className="bg-card/50 p-4 rounded-xl">
              <div className="text-2xl font-bold">{results.length - correctCount}</div>
              <div className="text-sm text-muted-foreground">Wrong</div>
            </div>
            <div className="bg-card/50 p-4 rounded-xl">
              <div className="text-2xl font-bold">{results.length}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Button onClick={resetModule} variant="outline" data-testid="back-categories-btn">
              Back to Categories
            </Button>
            <Button onClick={() => startMode(mode)} className="btn-glow" data-testid="retry-btn">
              Try Again
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Question View (Practice/Test)
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="max-w-4xl mx-auto" data-testid="question-container">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={resetModule}
              className="text-muted-foreground hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-muted-foreground">
              {selectedCategory.name} • {mode === 'practice' ? 'Practice' : 'Test'} Mode
            </span>
          </div>
          <p className="text-muted-foreground">Question {currentQuestion + 1} of {questions.length}</p>
          <Progress value={(currentQuestion / questions.length) * 100} className="mt-2" />
        </div>
        <div className="flex items-center gap-2 glass px-4 py-2 rounded-full">
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
          className="glass p-8 rounded-2xl space-y-6"
        >
          <div>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              question?.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
              question?.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
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
                data-testid={`option-${idx}`}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  selectedAnswer === option
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-border hover:border-slate-700'
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
            data-testid="submit-answer-btn"
          >
            {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish'}
          </Button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AptitudeModule;
