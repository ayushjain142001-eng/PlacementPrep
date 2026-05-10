import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { toast } from 'sonner';
import { MessageSquare, Mic, Square, Play, Pause, Trophy } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Progress } from '../components/ui/progress';

const CommunicationModule = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answer, setAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(time => time + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const fetchQuestions = async () => {
    try {
      const response = await api.get('/questions/communication?count=5');
      setQuestions(response.data);
    } catch (error) {
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    toast.info('Recording started. Speak your answer clearly.');
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    toast.success('Recording stopped. Your answer has been captured.');
  };

  const handleSubmit = async () => {
    if (!answer.trim()) {
      toast.error('Please provide your answer');
      return;
    }

    setSubmitting(true);
    const question = questions[currentQuestion];

    try {
      const response = await api.post('/communication/analyze', {
        question_id: question.title,
        text: answer,
        duration: recordingTime,
        mode: recordingTime > 0 ? 'audio' : 'text',
      });

      const { analysis: result, xp_earned } = response.data;
      setAnalysis(result);

      toast.success(`+${xp_earned} XP earned!`);
    } catch (error) {
      const msg = error?.response?.data?.detail || 'Analysis failed. Please try again.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setAnswer('');
      setRecordingTime(0);
      setAnalysis(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="max-w-5xl mx-auto space-y-6" data-testid="communication-module-container">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Communication Practice</h1>
          <p className="text-muted-foreground">
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </div>
        <Progress value={(currentQuestion / questions.length) * 100} className="w-32" />
      </div>

      {/* Question Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 rounded-2xl space-y-6"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${
              question.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
              question.difficulty === 'medium' ? 'bg-violet-500/20 text-violet-500' :
              'bg-red-500/20 text-red-400'
            }`}>
              {question.difficulty}
            </span>
            <h2 className="text-2xl font-bold mb-3">{question.title}</h2>
            <p className="text-foreground text-lg">{question.description}</p>
          </div>
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Recording Controls */}
        <div className="bg-card/50 p-6 rounded-xl space-y-4">
          <div className="flex items-center justify-center gap-4">
            {!isRecording ? (
              <Button
                onClick={handleStartRecording}
                size="lg"
                className="btn-glow"
                data-testid="start-recording-btn"
              >
                <Mic className="w-5 h-5 mr-2" />
                Start Recording
              </Button>
            ) : (
              <Button
                onClick={handleStopRecording}
                size="lg"
                variant="destructive"
                data-testid="stop-recording-btn"
              >
                <Square className="w-5 h-5 mr-2" />
                Stop Recording
              </Button>
            )}
          </div>

          {isRecording && (
            <div className="text-center">
              <div className="text-4xl font-bold text-red-500 font-mono">
                {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
              </div>
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground">Recording...</span>
              </div>
            </div>
          )}
        </div>

        {/* Text Answer */}
        <div className="space-y-3">
          <label className="block font-semibold">Your Answer (Text):</label>
          <Textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type or speak your answer here..."
            rows={6}
            className="bg-card/50 border-border focus:border-indigo-500 resize-none"
            data-testid="answer-textarea"
          />
          <p className="text-sm text-muted-foreground">
            {answer.split(' ').filter(w => w).length} words
          </p>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={submitting || !answer.trim()}
          className="w-full btn-glow"
          data-testid="submit-answer-btn"
        >
          {submitting ? 'Analyzing...' : 'Submit Answer'}
        </Button>
      </motion.div>

      {/* Analysis Results */}
      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8 rounded-2xl space-y-6"
        >
          <h3 className="text-2xl font-bold flex items-center gap-3">
            <Trophy className="w-6 h-6 text-violet-500" />
            Communication Analysis
          </h3>

          {/* Confidence Score */}
          <div className="bg-card/50 p-6 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold">Confidence Score</span>
              <span className="text-2xl font-bold gradient-text">
                {analysis.confidence_score}/100
              </span>
            </div>
            <Progress value={analysis.confidence_score} className="h-3" />
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card/50 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Word Count</div>
              <div className="text-2xl font-bold">{analysis.word_count}</div>
            </div>
            <div className="bg-card/50 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Filler Words</div>
              <div className="text-2xl font-bold text-orange-400">{analysis.filler_count}</div>
            </div>
            <div className="bg-card/50 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Avg Sentence Length</div>
              <div className="text-2xl font-bold">{analysis.avg_sentence_length}</div>
            </div>
          </div>

          {/* Feedback */}
          {analysis.feedback?.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold">Feedback & Suggestions:</h4>
              {analysis.feedback.map((fb, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-indigo-500/10 p-4 rounded-lg border border-indigo-500/30">
                  <span className="text-indigo-400 mt-0.5">💡</span>
                  <span className="text-foreground">{fb}</span>
                </div>
              ))}
            </div>
          )}

          {currentQuestion < questions.length - 1 && (
            <Button onClick={handleNextQuestion} className="w-full btn-glow" data-testid="next-question-btn">
              Next Question
            </Button>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default CommunicationModule;
