import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles, RefreshCw } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';

const STORAGE_KEY = 'chatbot.session_id';

const TypingDots = () => (
  <div className="flex items-center gap-1 px-4 py-3" data-testid="typing-indicator">
    {[0, 1, 2].map(i => (
      <motion.div
        key={i}
        className="w-2 h-2 rounded-full bg-indigo-400"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
      />
    ))}
  </div>
);

const Chatbot = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState(() => localStorage.getItem(STORAGE_KEY) || null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  const greeting = () => {
    const name = user?.name || user?.full_name || 'there';
    return `Hi ${name} 👋\nI'm Ayush's AI Assistant.\nI'm here to help you with aptitude, coding, reasoning, interviews, resume preparation, and any issues on the platform.`;
  };

  // Load history when chat opens
  useEffect(() => {
    if (!open) return;
    if (!sessionId) {
      // First open: show greeting only (no API call)
      setMessages([{ role: 'assistant', content: greeting(), id: 'greet', isGreeting: true }]);
      return;
    }
    (async () => {
      try {
        const res = await api.get(`/chatbot/history?session_id=${sessionId}`);
        const msgs = res.data.messages || [];
        if (msgs.length === 0) {
          setMessages([{ role: 'assistant', content: greeting(), id: 'greet', isGreeting: true }]);
        } else {
          setMessages(msgs);
        }
      } catch {
        setMessages([{ role: 'assistant', content: greeting(), id: 'greet', isGreeting: true }]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, sessionId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    setSending(true);
    const userMsg = { role: 'user', content: text, id: `u-${Date.now()}` };
    setMessages(prev => [...prev.filter(m => !m.isGreeting), userMsg]);

    try {
      const res = await api.post('/chatbot/message', { session_id: sessionId, message: text });
      const newSid = res.data.session_id;
      if (!sessionId && newSid) {
        setSessionId(newSid);
        localStorage.setItem(STORAGE_KEY, newSid);
      }
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply, id: res.data.message_id }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I couldn't reach the AI service. Please try again.",
        id: `err-${Date.now()}`,
      }]);
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const newSession = async () => {
    if (sessionId) {
      try { await api.delete(`/chatbot/session?session_id=${sessionId}`); } catch {}
    }
    localStorage.removeItem(STORAGE_KEY);
    setSessionId(null);
    setMessages([{ role: 'assistant', content: greeting(), id: 'greet', isGreeting: true }]);
  };

  if (!user) return null;

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-2xl hover:shadow-indigo-500/50 hover:scale-110 transition-all flex items-center justify-center group"
            data-testid="chatbot-toggle"
            aria-label="Open AI Assistant"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[92vw] max-w-md h-[600px] max-h-[80vh] glass rounded-2xl border border-border shadow-2xl flex flex-col overflow-hidden"
            data-testid="chatbot-panel"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Ayush's AI Assistant</h3>
                  <p className="text-xs text-emerald-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    Online · Powered by Gemini
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={newSession} title="New conversation" data-testid="chatbot-reset">
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpen(false)} data-testid="chatbot-close">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3" data-testid="chatbot-messages">
              {messages.map(m => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                    m.role === 'user'
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-br-md'
                      : 'bg-card border border-border rounded-bl-md'
                  }`}>
                    <div className="whitespace-pre-line break-words">{m.content}</div>
                  </div>
                </motion.div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="bg-card border border-border rounded-2xl rounded-bl-md">
                    <TypingDots />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border bg-card/50">
              <div className="flex items-center gap-2">
                <Input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Ask anything about placement prep…"
                  disabled={sending}
                  data-testid="chatbot-input"
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={sending || !input.trim()}
                  size="icon"
                  data-testid="chatbot-send"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                AI responses may need verification · Press Enter to send
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
