import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { toast } from 'sonner';
import { Video, Send, Trophy, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';

const InterviewModule = () => {
  const [interviewType, setInterviewType] = useState('hr');
  const [difficulty, setDifficulty] = useState('medium');
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const startInterview = async () => {
    setLoading(true);
    try {
      const response = await api.post('/interviews/start', {
        interview_type: interviewType,
        difficulty: difficulty
      });
      
      setSession(response.data);
      const firstQuestion = response.data.questions[0]?.question || 'Hello! Let\'s begin your interview.';
      setMessages([{
        role: 'interviewer',
        content: firstQuestion,
        timestamp: new Date()
      }]);
      
      toast.success('Interview started!');
    } catch (error) {
      console.error('Interview start error:', error);
      toast.error(error.response?.data?.detail || 'Failed to start interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!currentInput.trim() || !session) return;

    const userMessage = {
      role: 'user',
      content: currentInput,
      timestamp: new Date()
    };
    
    setMessages([...messages, userMessage]);
    const userResponse = currentInput;
    setCurrentInput('');

    try {
      await api.post(`/interviews/${session.id}/respond`, {
        question_index: currentQuestionIndex,
        response: userResponse
      });

      if (currentQuestionIndex < session.questions.length - 1) {
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        
        const interviewerMessage = {
          role: 'interviewer',
          content: session.questions[nextIndex].question,
          timestamp: new Date()
        };
        
        setTimeout(() => {
          setMessages(prev => [...prev, interviewerMessage]);
        }, 1000);
      } else {
        const response = await api.post(`/interviews/${session.id}/complete`);
        
        const completionMessage = {
          role: 'system',
          content: `Interview completed! Your overall score: ${Math.round(response.data.overall_score)}%. You earned ${response.data.xp_earned} XP!`,
          timestamp: new Date()
        };
        
        setTimeout(() => {
          setMessages(prev => [...prev, completionMessage]);
        }, 1000);
        
        toast.success(`Interview completed! Score: ${Math.round(response.data.overall_score)}%`);
      }
    } catch (error) {
      console.error('Response error:', error);
      toast.error(error?.response?.data?.detail || 'Failed to submit response. Please try again.');
    }
  };

  const resetInterview = () => {
    setSession(null);
    setMessages([]);
    setCurrentQuestionIndex(0);
    setCurrentInput('');
  };

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto" data-testid="interview-start">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-12 rounded-2xl space-y-8"
        >
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Video className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Mock Interview</h1>
            <p className="text-muted-foreground text-lg">Practice with AI-powered interview simulation</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block font-semibold mb-3">Interview Type</label>
              <div className="grid grid-cols-3 gap-3">
                {['hr', 'technical', 'behavioral'].map(type => (
                  <button
                    key={type}
                    onClick={() => setInterviewType(type)}
                    data-testid={`interview-type-${type}`}
                    className={`p-4 rounded-xl border-2 transition-all capitalize ${
                      interviewType === type
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-border hover:border-slate-700'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-3">Difficulty</label>
              <div className="grid grid-cols-3 gap-3">
                {['easy', 'medium', 'hard'].map(level => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    data-testid={`difficulty-${level}`}
                    className={`p-4 rounded-xl border-2 transition-all capitalize ${
                      difficulty === level
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-border hover:border-slate-700'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button
            onClick={startInterview}
            disabled={loading}
            size="lg"
            className="w-full btn-glow"
            data-testid="start-interview-btn"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                <span>Starting...</span>
              </div>
            ) : (
              'Start Interview'
            )}
          </Button>
        </motion.div>
      </div>
    );
  }

  const isComplete = currentQuestionIndex >= session.questions.length;

  return (
    <div className="max-w-5xl mx-auto" data-testid="interview-chat">
      <button
        onClick={resetInterview}
        className="flex items-center text-muted-foreground hover:text-white transition-colors mb-4"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to setup
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl overflow-hidden"
      >
        <div className="bg-card/50 p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold capitalize">{interviewType} Interview</h2>
              <p className="text-muted-foreground">Question {Math.min(currentQuestionIndex + 1, session.questions.length)} of {session.questions.length}</p>
            </div>
            {!isComplete && (
              <div className="flex items-center gap-2 glass px-4 py-2 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Live</span>
              </div>
            )}
          </div>
        </div>

        <ScrollArea className="h-[500px] p-6">
          <div className="space-y-4">
            <AnimatePresence>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl ${
                      msg.role === 'interviewer'
                        ? 'bg-card/50 border border-border'
                        : msg.role === 'system'
                        ? 'bg-green-500/10 border border-green-500/30 text-center w-full max-w-full'
                        : 'bg-indigo-500/20 border border-indigo-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold capitalize">
                        {msg.role === 'interviewer' ? '🎯 Interviewer' : msg.role === 'system' ? '✨ System' : '👤 You'}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-slate-200">{msg.content}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>

        {!isComplete && (
          <div className="bg-card/50 p-6 border-t border-border">
            <div className="flex gap-3">
              <Input
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your answer..."
                className="flex-1 bg-card border-border"
                data-testid="interview-input"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!currentInput.trim()}
                className="btn-glow"
                data-testid="send-message-btn"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}

        {isComplete && (
          <div className="bg-card/50 p-6 border-t border-border text-center">
            <Button onClick={resetInterview} className="btn-glow">
              Start New Interview
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default InterviewModule;
