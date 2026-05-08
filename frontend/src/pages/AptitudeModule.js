import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { toast } from 'sonner';
import {
  Brain, Clock, CheckCircle, XCircle, Play, BarChart3, Target,
  ArrowLeft, TrendingUp, Search, ChevronRight, Sparkles,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Input } from '../components/ui/input';

const DIFFICULTIES = [
  { id: 'easy', name: 'Easy', description: 'Foundation building', icon: '🌱', color: 'from-emerald-500 to-green-500' },
  { id: 'medium', name: 'Medium', description: 'Moderate challenge', icon: '⚡', color: 'from-violet-500 to-purple-500' },
  { id: 'hard', name: 'Hard', description: 'Placement-grade', icon: '🔥', color: 'from-red-500 to-orange-500' },
];

const Step = ({ items, label, current }) => (
  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap" data-testid="breadcrumb">
    {items.map((it, i) => (
      <React.Fragment key={i}>
        {i > 0 && <ChevronRight className="w-4 h-4 opacity-50" />}
        <button
          onClick={it.onClick}
          className={`hover:text-foreground transition-colors ${i === items.length - 1 ? 'text-foreground font-semibold' : ''}`}
          disabled={!it.onClick}
        >
          {it.label}
        </button>
      </React.Fragment>
    ))}
  </div>
);

const AptitudeModule = () => {
  const [view, setView] = useState('categories'); // categories|topics|subtopic|difficulty|mode|test|results
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [mode, setMode] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [questions, setQuestions] = useState([]);
  const [seenIds, setSeenIds] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load categories on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/catalog/aptitude');
        setCategories(res.data.categories || []);
      } catch (e) {
        toast.error('Failed to load categories');
      }
    })();
  }, []);

  // Timer
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      handleSubmit();
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, timeLeft]);

  const filteredTopics = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return topics;
    return topics.filter(t => t.name.toLowerCase().includes(q));
  }, [topics, searchQuery]);

  const loadTopics = async (category) => {
    setSelectedCategory(category);
    setSearchQuery('');
    try {
      const res = await api.get(`/catalog/aptitude/${category.id}/topics`);
      setTopics(res.data.topics || []);
      setView('topics');
    } catch (e) {
      toast.error('Failed to load topics');
    }
  };

  const pickTopic = (topic) => {
    setSelectedTopic(topic);
    if (topic.subtopics && topic.subtopics.length > 0) {
      setView('subtopic');
    } else {
      setView('difficulty');
    }
  };

  const pickSubtopic = (sub) => {
    setSelectedSubtopic(sub);
    setView('difficulty');
  };

  const pickDifficulty = (d) => {
    setSelectedDifficulty(d);
    setView('mode');
  };

  const startMode = async (m) => {
    setMode(m);
    setCurrentQuestion(0);
    setResults([]);
    setSelectedAnswer(null);
    setLoading(true);
    setView('test');
    try {
      const count = m === 'test' ? 15 : 10;
      const res = await api.post('/questions/topic', {
        module: 'aptitude',
        category: selectedCategory.id,
        topic: selectedTopic.id,
        subtopic: selectedSubtopic || null,
        difficulty: selectedDifficulty.id,
        count,
        seen_ids: seenIds,
        allow_generation: true,
      });
      const qs = res.data.questions || [];
      if (qs.length === 0) {
        toast.error('No questions generated. Try a different topic.');
        setView('difficulty');
        return;
      }
      setQuestions(qs);
      setSeenIds(prev => [...prev, ...qs.map(q => q.id)]);
      setTimeLeft(qs[0].time_limit || 60);
      setIsActive(true);
      toast.success(`Loaded ${qs.length} questions`);
    } catch (e) {
      toast.error('Failed to load questions');
      setView('difficulty');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setIsActive(false);
    const question = questions[currentQuestion];
    try {
      const res = await api.post('/attempts', {
        question_id: question.id,
        answer: selectedAnswer || '',
        time_taken: (question.time_limit || 60) - timeLeft,
        mode,
      });
      setResults(prev => [...prev, {
        question: question.title,
        correct: res.data.attempt.is_correct,
        score: res.data.attempt.score,
      }]);
      toast.success(`+${res.data.xp_earned} XP earned!`);
    } catch {
      toast.error('Failed to record attempt');
      setResults(prev => [...prev, { question: question.title, correct: false, score: 0 }]);
    }
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setTimeLeft(questions[currentQuestion + 1]?.time_limit || 60);
      setIsActive(true);
    } else {
      setView('results');
    }
  };

  const reset = (toView = 'categories') => {
    setView(toView);
    if (toView === 'categories') {
      setSelectedCategory(null); setSelectedTopic(null);
      setSelectedSubtopic(null); setSelectedDifficulty(null);
      setMode(null); setSearchQuery(''); setSeenIds([]);
    }
    setQuestions([]); setCurrentQuestion(0);
    setResults([]); setSelectedAnswer(null); setIsActive(false);
  };

  // ----- VIEWS -----

  if (view === 'categories') {
    return (
      <div className="space-y-8" data-testid="aptitude-categories">
        <div>
          <h1 className="text-4xl font-bold mb-2">Aptitude Training</h1>
          <p className="text-muted-foreground">Choose a category to explore {categories.reduce((a, c) => a + (c.topic_count || 0), 0)} topics</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => loadTopics(c)}
              className="glass p-8 rounded-2xl cursor-pointer border border-transparent hover:border-indigo-500/50 transition-all hover-lift group"
              data-testid={`category-${c.id}`}
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${c.color} rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">{c.name}</h3>
              <p className="text-muted-foreground text-sm mb-3">{c.description}</p>
              <div className="text-sm font-semibold text-indigo-400">
                {c.topic_count} topics →
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (view === 'topics') {
    return (
      <div className="space-y-6" data-testid="aptitude-topics">
        <Step
          items={[
            { label: 'Categories', onClick: () => reset('categories') },
            { label: selectedCategory.name },
          ]}
        />
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">{selectedCategory.name}</h1>
            <p className="text-muted-foreground">Pick a topic to start practicing</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search topics…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="topic-search"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTopics.map((t, i) => (
            <motion.button
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.3) }}
              onClick={() => pickTopic(t)}
              className="glass p-5 rounded-xl text-left border border-transparent hover:border-indigo-500/50 transition-all hover-lift group"
              data-testid={`topic-${t.id}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-base mb-1 group-hover:text-indigo-400 transition-colors">
                    {t.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {t.subtopics?.length || 0} subtopics
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </div>
            </motion.button>
          ))}
        </div>
        {filteredTopics.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No topics matching "{searchQuery}"
          </div>
        )}
      </div>
    );
  }

  if (view === 'subtopic') {
    return (
      <div className="space-y-6" data-testid="aptitude-subtopic">
        <Step items={[
          { label: 'Categories', onClick: () => reset('categories') },
          { label: selectedCategory.name, onClick: () => setView('topics') },
          { label: selectedTopic.name },
        ]} />
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">{selectedTopic.name}</h1>
          <p className="text-muted-foreground">Pick a focused subtopic — or skip to practice the entire topic.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {selectedTopic.subtopics.map((sub, i) => (
            <motion.button
              key={sub}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => pickSubtopic(sub)}
              className="glass p-5 rounded-xl text-left border border-transparent hover:border-indigo-500/50 transition-all hover-lift"
              data-testid={`subtopic-${i}`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="font-medium">{sub}</span>
              </div>
            </motion.button>
          ))}
        </div>
        <div className="text-center">
          <Button variant="outline" onClick={() => { setSelectedSubtopic(null); setView('difficulty'); }} data-testid="skip-subtopic">
            Skip — practice all subtopics
          </Button>
        </div>
      </div>
    );
  }

  if (view === 'difficulty') {
    return (
      <div className="space-y-6" data-testid="aptitude-difficulty">
        <Step items={[
          { label: 'Categories', onClick: () => reset('categories') },
          { label: selectedCategory.name, onClick: () => setView('topics') },
          { label: selectedTopic.name, onClick: () => setView(selectedTopic.subtopics?.length ? 'subtopic' : 'topics') },
          ...(selectedSubtopic ? [{ label: selectedSubtopic }] : []),
          { label: 'Difficulty' },
        ]} />
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold mb-2">Choose Difficulty</h1>
          <p className="text-muted-foreground flex items-center justify-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            Difficulty calibrates question complexity
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {DIFFICULTIES.map((d, i) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => pickDifficulty(d)}
              className="glass p-8 rounded-2xl cursor-pointer border-2 border-transparent hover:border-indigo-500/50 transition-all hover-lift text-center group"
              data-testid={`difficulty-${d.id}`}
            >
              <div className={`w-20 h-20 bg-gradient-to-br ${d.color} rounded-full flex items-center justify-center text-4xl mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                {d.icon}
              </div>
              <h3 className="text-2xl font-bold mb-1">{d.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{d.description}</p>
              <Button className="w-full btn-glow">Select {d.name}</Button>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (view === 'mode') {
    return (
      <div className="space-y-6" data-testid="aptitude-mode">
        <Step items={[
          { label: 'Categories', onClick: () => reset('categories') },
          { label: selectedCategory.name, onClick: () => setView('topics') },
          { label: selectedTopic.name, onClick: () => setView('difficulty') },
          { label: `${selectedDifficulty.name}`, onClick: () => setView('difficulty') },
          { label: 'Mode' },
        ]} />
        <div className="text-center mb-2">
          <h1 className="text-3xl font-bold mb-2">{selectedTopic.name}</h1>
          <p className="text-muted-foreground capitalize">
            {selectedDifficulty.icon} {selectedDifficulty.name} • {selectedSubtopic || 'All subtopics'}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            onClick={() => startMode('practice')}
            className="glass p-8 rounded-2xl cursor-pointer hover:border-indigo-500/50 border border-transparent transition-all hover-lift text-center"
            data-testid="mode-practice"
          >
            <Target className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Practice</h3>
            <p className="text-muted-foreground mb-4">10 questions • Untimed feel • Instant feedback</p>
            <Button className="btn-glow"><Play className="w-5 h-5 mr-2" />Start Practice</Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            onClick={() => startMode('test')}
            className="glass p-8 rounded-2xl cursor-pointer hover:border-indigo-500/50 border border-transparent transition-all hover-lift text-center"
            data-testid="mode-test"
          >
            <BarChart3 className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Test</h3>
            <p className="text-muted-foreground mb-4">15 questions • Strict timer • Performance tracking</p>
            <Button className="btn-glow"><Play className="w-5 h-5 mr-2" />Start Test</Button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (view === 'results') {
    const avg = results.length ? results.reduce((a, r) => a + r.score, 0) / results.length : 0;
    const correct = results.filter(r => r.correct).length;
    return (
      <div className="max-w-3xl mx-auto" data-testid="aptitude-results">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="glass p-12 rounded-2xl text-center space-y-6 border border-border">
          <div className={`w-24 h-24 bg-gradient-to-br ${selectedCategory.color} rounded-full flex items-center justify-center mx-auto`}>
            {avg >= 70 ? <CheckCircle className="w-12 h-12 text-white" /> : <Target className="w-12 h-12 text-white" />}
          </div>
          <h1 className="text-4xl font-bold">{mode === 'practice' ? 'Practice' : 'Test'} Completed!</h1>
          <div className="text-muted-foreground">
            {selectedTopic.name} • <span className="capitalize">{selectedDifficulty.name}</span>
          </div>
          <div className="text-7xl font-bold gradient-text">{Math.round(avg)}%</div>
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="bg-card/50 p-4 rounded-xl border border-border">
              <div className="text-2xl font-bold">{correct}</div>
              <div className="text-xs text-muted-foreground">Correct</div>
            </div>
            <div className="bg-card/50 p-4 rounded-xl border border-border">
              <div className="text-2xl font-bold">{results.length - correct}</div>
              <div className="text-xs text-muted-foreground">Wrong</div>
            </div>
            <div className="bg-card/50 p-4 rounded-xl border border-border">
              <div className="text-2xl font-bold">{results.length}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button variant="outline" onClick={() => reset('categories')}>Categories</Button>
            <Button variant="outline" onClick={() => { reset('difficulty'); setView('difficulty'); }}>Try Different Difficulty</Button>
            <Button onClick={() => startMode(mode)} className="btn-glow">Try More Questions</Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // test/practice question view
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4" data-testid="aptitude-loading">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="text-muted-foreground">Generating {selectedDifficulty?.name} questions on {selectedTopic?.name}…</p>
        <p className="text-xs text-muted-foreground">First-time topics may take a few seconds (AI generation)</p>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <XCircle className="w-16 h-16 text-red-500" />
        <p className="text-foreground text-xl">No questions available</p>
        <Button onClick={() => setView('difficulty')} variant="outline">Go Back</Button>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="max-w-4xl mx-auto" data-testid="aptitude-question">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => reset('categories')} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-muted-foreground">
              {selectedTopic.name} • <span className="capitalize">{selectedDifficulty.name}</span> • {mode === 'practice' ? 'Practice' : 'Test'}
            </span>
          </div>
          <p className="text-muted-foreground text-sm">Question {currentQuestion + 1} of {questions.length}</p>
          <Progress value={(currentQuestion / questions.length) * 100} className="mt-2" />
        </div>
        <div className="flex items-center gap-2 glass px-4 py-2 rounded-full border border-border">
          <Clock className="w-5 h-5 text-orange-500" />
          <span className="font-mono font-semibold" data-testid="timer">{timeLeft}s</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
          className="glass p-8 rounded-2xl space-y-6 border border-border"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
              question.difficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
              question.difficulty === 'medium' ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' :
              'bg-red-500/20 text-red-400 border border-red-500/30'
            }`} data-testid="difficulty-badge">
              {question.difficulty}
            </span>
            {question.source === 'ai-generated' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Sparkles className="w-3 h-3" /> AI
              </span>
            )}
          </div>

          <h2 className="text-xl md:text-2xl font-bold">{question.title}</h2>
          <p className="text-foreground text-base md:text-lg whitespace-pre-line">{question.description}</p>

          <div className="space-y-3">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedAnswer(option)}
                data-testid={`option-${idx}`}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  selectedAnswer === option
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-border hover:border-indigo-500/50'
                }`}
              >
                <span className="font-semibold mr-3 text-indigo-400">{String.fromCharCode(65 + idx)}.</span>
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
