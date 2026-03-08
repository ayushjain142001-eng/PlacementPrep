import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { toast } from 'sonner';
import { Calendar as CalendarIcon, Clock, Brain, Target, Plus, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';

const RevisionModule = () => {
  const [revisionItems, setRevisionItems] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTopic, setNewTopic] = useState({ topic: '', category: '', notes: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevisionItems();
  }, []);

  const fetchRevisionItems = async () => {
    try {
      // Mock revision items
      const mockItems = [
        {
          id: '1',
          topic: 'Arrays & Strings',
          category: 'DSA',
          next_review: new Date(Date.now() + 86400000).toISOString(),
          review_count: 3,
          ease_factor: 2.5,
          notes: 'Focus on two-pointer technique'
        },
        {
          id: '2',
          topic: 'React Hooks',
          category: 'Frontend',
          next_review: new Date(Date.now() + 172800000).toISOString(),
          review_count: 2,
          ease_factor: 2.3,
          notes: 'useEffect cleanup important'
        },
        {
          id: '3',
          topic: 'SQL Joins',
          category: 'Database',
          next_review: new Date(Date.now() - 3600000).toISOString(),
          review_count: 1,
          ease_factor: 2.0,
          notes: 'Practice complex queries'
        }
      ];
      setRevisionItems(mockItems);
    } catch (error) {
      toast.error('Failed to load revision items');
    } finally {
      setLoading(false);
    }
  };

  const addRevisionItem = async () => {
    if (!newTopic.topic || !newTopic.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    const item = {
      id: Date.now().toString(),
      ...newTopic,
      next_review: new Date(Date.now() + 86400000).toISOString(),
      review_count: 0,
      ease_factor: 2.5
    };

    setRevisionItems([...revisionItems, item]);
    setNewTopic({ topic: '', category: '', notes: '' });
    setShowAddForm(false);
    toast.success('Topic added to revision schedule!');
  };

  const markAsReviewed = async (itemId, performance) => {
    const item = revisionItems.find(i => i.id === itemId);
    if (!item) return;

    // Simple spaced repetition logic
    const intervals = [1, 3, 7, 14, 30]; // days
    const nextInterval = intervals[Math.min(item.review_count, intervals.length - 1)];
    
    const updatedItem = {
      ...item,
      review_count: item.review_count + 1,
      next_review: new Date(Date.now() + nextInterval * 86400000).toISOString()
    };

    setRevisionItems(revisionItems.map(i => i.id === itemId ? updatedItem : i));
    toast.success(`Next review scheduled in ${nextInterval} day(s)!`);
  };

  const isOverdue = (nextReview) => {
    return new Date(nextReview) < new Date();
  };

  const isDueToday = (nextReview) => {
    const today = new Date().setHours(0, 0, 0, 0);
    const reviewDate = new Date(nextReview).setHours(0, 0, 0, 0);
    return reviewDate === today;
  };

  const getDaysUntil = (nextReview) => {
    const days = Math.ceil((new Date(nextReview) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const overdueItems = revisionItems.filter(item => isOverdue(item.next_review));
  const todayItems = revisionItems.filter(item => isDueToday(item.next_review));
  const upcomingItems = revisionItems.filter(item => !isOverdue(item.next_review) && !isDueToday(item.next_review));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8" data-testid="revision-module">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Revision Planner</h1>
          <p className="text-slate-400">Spaced repetition for better retention</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="btn-glow">
          <Plus className="w-5 h-5 mr-2" />
          Add Topic
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-6 rounded-2xl"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Overdue</span>
            <Clock className="w-5 h-5 text-red-500" />
          </div>
          <div className="text-4xl font-bold text-red-400">{overdueItems.length}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass p-6 rounded-2xl"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Due Today</span>
            <Target className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="text-4xl font-bold text-yellow-400">{todayItems.length}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass p-6 rounded-2xl"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Total Topics</span>
            <Brain className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="text-4xl font-bold text-indigo-400">{revisionItems.length}</div>
        </motion.div>
      </div>

      {/* Add Topic Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-6 rounded-2xl space-y-4"
        >
          <h3 className="text-xl font-bold">Add New Topic</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Topic name"
              value={newTopic.topic}
              onChange={(e) => setNewTopic({ ...newTopic, topic: e.target.value })}
              className="bg-slate-900/50 border-slate-800"
            />
            <Input
              placeholder="Category (e.g., DSA, Frontend)"
              value={newTopic.category}
              onChange={(e) => setNewTopic({ ...newTopic, category: e.target.value })}
              className="bg-slate-900/50 border-slate-800"
            />
          </div>
          <Textarea
            placeholder="Notes (optional)"
            value={newTopic.notes}
            onChange={(e) => setNewTopic({ ...newTopic, notes: e.target.value })}
            className="bg-slate-900/50 border-slate-800"
            rows={3}
          />
          <div className="flex gap-3">
            <Button onClick={addRevisionItem} className="btn-glow">Add Topic</Button>
            <Button onClick={() => setShowAddForm(false)} variant="outline">Cancel</Button>
          </div>
        </motion.div>
      )}

      {/* Overdue Items */}
      {overdueItems.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-red-400">⚠️ Overdue for Review</h2>
          {overdueItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass p-6 rounded-2xl border-2 border-red-500/30"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{item.topic}</h3>
                    <span className="px-3 py-1 bg-slate-700 rounded-full text-xs">{item.category}</span>
                  </div>
                  {item.notes && <p className="text-slate-400 text-sm mb-3">{item.notes}</p>}
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span>Reviews: {item.review_count}</span>
                    <span>•</span>
                    <span className="text-red-400">Overdue by {Math.abs(getDaysUntil(item.next_review))} days</span>
                  </div>
                </div>
                <Button onClick={() => markAsReviewed(item.id, 3)} size="sm" className="btn-glow">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark Reviewed
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Today's Items */}
      {todayItems.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-yellow-400">📅 Due Today</h2>
          {todayItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass p-6 rounded-2xl border-2 border-yellow-500/30"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{item.topic}</h3>
                    <span className="px-3 py-1 bg-slate-700 rounded-full text-xs">{item.category}</span>
                  </div>
                  {item.notes && <p className="text-slate-400 text-sm mb-3">{item.notes}</p>}
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span>Reviews: {item.review_count}</span>
                  </div>
                </div>
                <Button onClick={() => markAsReviewed(item.id, 3)} size="sm" className="btn-glow">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark Reviewed
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Upcoming Items */}
      {upcomingItems.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">🗓️ Upcoming Reviews</h2>
          {upcomingItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass p-6 rounded-2xl"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{item.topic}</h3>
                    <span className="px-3 py-1 bg-slate-700 rounded-full text-xs">{item.category}</span>
                  </div>
                  {item.notes && <p className="text-slate-400 text-sm mb-3">{item.notes}</p>}
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span>Reviews: {item.review_count}</span>
                    <span>•</span>
                    <span>Next review in {getDaysUntil(item.next_review)} days</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {revisionItems.length === 0 && (
        <div className="glass p-12 rounded-2xl text-center">
          <CalendarIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">No topics yet</h3>
          <p className="text-slate-400 mb-6">Start adding topics to create your revision schedule</p>
          <Button onClick={() => setShowAddForm(true)} className="btn-glow">
            <Plus className="w-5 h-5 mr-2" />
            Add Your First Topic
          </Button>
        </div>
      )}
    </div>
  );
};

export default RevisionModule;
