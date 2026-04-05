import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { toast } from 'sonner';
import { Puzzle, Clock, Play, BarChart3, Target, ArrowLeft } from 'lucide-react';
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

const ReasoningModule = () => {
  const [view, setView] = useState('categories');
  const [selectedCategory, setSelectedCategory] = useState(null);
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

  const fetchQuestions = async (category, testMode) => {
    setLoading(true);
    try {
      const response = await api.get(`/questions/reasoning?count=${testMode === 'test' ? 15 : 8}`);
      const filtered = response.data.filter(q => q.category === category);
      setQuestions(filtered.length > 0 ? filtered : response.data);
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
      
      setResults([...results, {
        question: question.title,
        correct: response.data.attempt.is_correct,
        score: response.data.attempt.score
      }]);

      toast.success(`+${response.data.xp_earned} XP earned!`);
      
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setTimeLeft(questions[currentQuestion + 1]?.time_limit || 90);
        setIsActive(true);
      } else {
        setView('results');
      }
    } catch (error) {
      toast.error('Failed to submit answer');
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setTimeLeft(questions[currentQuestion + 1]?.time_limit || 90);
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

  if (view === 'categories') {
    return (
      <div className="space-y-8" data-testid="reasoning-categories">
        <div>
          <h1 className="text-4xl font-bold mb-2">Reasoning Training</h1>
          <p className="text-slate-400">Sharpen your analytical and logical thinking</p>
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
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform`}>
                {category.icon}
              </div>
              <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
              <p className="text-slate-400 mb-4">{category.description}</p>
              <Button className="w-full btn-glow">Start Training</Button>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (view === 'mode-select') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <button onClick={() => setView('categories')} className="flex items-center text-slate-400 hover:text-white transition-colors mb-4">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to categories
        </button>

        <div className="text-center mb-8">
          <div className={`w-20 h-20 bg-gradient-to-br ${selectedCategory.color} rounded-2xl flex items-center justify-center text-5xl mx-auto mb-4`}>
            {selectedCategory.icon}
          </div>
          <h1 className="text-4xl font-bold mb-2">{selectedCategory.name}</h1>
          <p className="text-slate-400">{selectedCategory.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => startMode('practice')}
            className="glass p-8 rounded-2xl cursor-pointer hover:border-indigo-500/50 transition-all hover-lift text-center"
          >
            <Target className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Practice Mode</h3>
            <p className="text-slate-400 mb-4">8 questions • Learn at your pace • Instant feedback</p>
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
          >
            <BarChart3 className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Test Mode</h3>
            <p className="text-slate-400 mb-4">15 questions • Timed • Performance tracking</p>
            <Button className="btn-glow">
              <Play className="w-5 h-5 mr-2" />
              Start Test
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (view === 'results') {
    const avgScore = results.length > 0 ? results.reduce((acc, r) => acc + r.score, 0) / results.length : 0;
    const correctCount = results.filter(r => r.correct).length;

    return (
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-12 rounded-2xl text-center space-y-6"
        >
          <div className={`w-24 h-24 bg-gradient-to-br ${selectedCategory.color} rounded-full flex items-center justify-center mx-auto`}>
            <Puzzle className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-4xl font-bold">{mode === 'practice' ? 'Practice' : 'Test'} Completed!</h1>
          <div className="text-7xl font-bold gradient-text">{Math.round(avgScore)}%</div>
          
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="bg-slate-900/50 p-4 rounded-xl">
              <div className="text-2xl font-bold">{correctCount}</div>
              <div className="text-sm text-slate-400">Correct</div>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl">
              <div className="text-2xl font-bold">{results.length - correctCount}</div>
              <div className="text-sm text-slate-400">Wrong</div>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl">
              <div className="text-2xl font-bold">{results.length}</div>
              <div className="text-sm text-slate-400">Total</div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Button onClick={resetModule} variant="outline">Back to Categories</Button>
            <Button onClick={() => startMode(mode)} className="btn-glow">Try Again</Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={resetModule} className="text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-slate-400">{selectedCategory.name} • {mode === 'practice' ? 'Practice' : 'Test'} Mode</span>
          </div>
          <p className="text-slate-400">Question {currentQuestion + 1} of {questions.length}</p>
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
          <p className="text-slate-300 text-lg">{question?.description}</p>

          <div className="space-y-3">
            {question?.options?.map((option, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedAnswer(option)}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  selectedAnswer === option
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="font-semibold mr-3">{String.fromCharCode(65 + idx)}.</span>
                {option}
              </button>
            ))}
          </div>

          <Button onClick={handleSubmit} disabled={!selectedAnswer} className="w-full btn-glow">
            {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish'}
          </Button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ReasoningModule;
