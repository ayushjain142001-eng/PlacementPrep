import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { toast } from 'sonner';
import { Brain, Clock, CheckCircle, XCircle, Play } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';

const AptitudeModule = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

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

  const fetchQuestions = async () => {
    try {
      const response = await api.get('/questions/aptitude?count=10');
      setQuestions(response.data);
    } catch (error) {
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const startTest = () => {
    setIsActive(true);
    setTimeLeft(questions[0]?.time_limit || 60);
  };

  const handleSubmit = async () => {
    setIsActive(false);
    const question = questions[currentQuestion];
    try {
      const response = await api.post('/attempts', {
        question_id: question.title,
        answer: selectedAnswer,
        time_taken: (question.time_limit || 60) - timeLeft,
        mode: 'practice'
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
        toast.success('Test completed!');
      }
    } catch (error) {
      toast.error('Failed to submit answer');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading questions...</div>;
  }

  if (!isActive && currentQuestion === 0) {
    return (
      <div className="max-w-4xl mx-auto" data-testid="aptitude-start">
        <div className="glass p-12 rounded-2xl text-center space-y-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold">Aptitude Test</h1>
          <p className="text-slate-400 text-lg">
            {questions.length} questions • Adaptive difficulty • Timed
          </p>
          <Button onClick={startTest} size="lg" className="btn-glow" data-testid="start-test-btn">
            <Play className="w-5 h-5 mr-2" />
            Start Test
          </Button>
        </div>
      </div>
    );
  }

  if (currentQuestion >= questions.length) {
    const avgScore = results.reduce((acc, r) => acc + r.score, 0) / results.length;
    return (
      <div className="max-w-4xl mx-auto" data-testid="test-results">
        <div className="glass p-12 rounded-2xl text-center space-y-6">
          <h1 className="text-4xl font-bold">Test Completed!</h1>
          <div className="text-6xl font-bold gradient-text">{Math.round(avgScore)}%</div>
          <p className="text-slate-400">
            {results.filter(r => r.correct).length} / {results.length} correct
          </p>
          <Button onClick={() => window.location.reload()} className="btn-glow" data-testid="retry-btn">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="max-w-4xl mx-auto" data-testid="question-container">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-slate-400">Question {currentQuestion + 1} of {questions.length}</p>
          <Progress value={(currentQuestion / questions.length) * 100} className="mt-2" />
        </div>
        <div className="flex items-center gap-2 glass px-4 py-2 rounded-full">
          <Clock className="w-5 h-5 text-orange-500" />
          <span className="font-mono font-semibold">{timeLeft}s</span>
        </div>
      </div>

      <motion.div
        key={currentQuestion}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 rounded-2xl space-y-6"
      >
        <div>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
            question.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
            question.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {question.difficulty}
          </span>
        </div>

        <h2 className="text-2xl font-bold">{question.title}</h2>
        <p className="text-slate-300 text-lg">{question.description}</p>

        <div className="space-y-3">
          {question.options?.map((option, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedAnswer(option)}
              data-testid={`option-${idx}`}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                selectedAnswer === option
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <span className="font-medium">{String.fromCharCode(65 + idx)}.</span> {option}
            </button>
          ))}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!selectedAnswer}
          className="w-full btn-glow"
          data-testid="submit-answer-btn"
        >
          Submit Answer
        </Button>
      </motion.div>
    </div>
  );
};

export default AptitudeModule;
