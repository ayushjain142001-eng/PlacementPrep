import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { toast } from 'sonner';
import { Users, FileQuestion, BarChart3, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';

const AdminPanel = () => {
  const [view, setView] = useState('overview'); // overview, users, questions, analytics
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="admin-panel">
      <div>
        <h1 className="text-4xl font-bold mb-2">Admin Panel</h1>
        <p className="text-muted-foreground">Manage users, content, and analytics</p>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 overflow-x-auto">
        {['overview', 'users', 'questions', 'analytics'].map((tab) => (
          <button
            key={tab}
            onClick={() => setView(tab)}
            className={`px-6 py-3 rounded-xl capitalize transition-all ${
              view === tab
                ? 'bg-indigo-500 text-white'
                : 'glass border border-border hover:border-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview */}
      {view === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-6 rounded-2xl"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Total Users</span>
                <Users className="w-5 h-5 text-indigo-500" />
              </div>
              <div className="text-4xl font-bold">{stats?.total_users || 0}</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass p-6 rounded-2xl"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Total Attempts</span>
                <FileQuestion className="w-5 h-5 text-purple-500" />
              </div>
              <div className="text-4xl font-bold">{stats?.total_attempts || 0}</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass p-6 rounded-2xl"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Interviews</span>
                <BarChart3 className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-4xl font-bold">{stats?.total_interviews || 0}</div>
            </motion.div>
          </div>

          <div className="glass p-8 rounded-2xl">
            <h3 className="text-2xl font-bold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button onClick={() => setView('questions')} className="justify-start">
                <Plus className="w-5 h-5 mr-2" />
                Add New Question
              </Button>
              <Button onClick={() => setView('users')} variant="outline" className="justify-start">
                <Users className="w-5 h-5 mr-2" />
                Manage Users
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Users Management */}
      {view === 'users' && (
        <div className="glass p-8 rounded-2xl">
          <h3 className="text-2xl font-bold mb-6">User Management</h3>
          <p className="text-muted-foreground">User management features coming soon...</p>
        </div>
      )}

      {/* Questions Management */}
      {view === 'questions' && (
        <div className="glass p-8 rounded-2xl">
          <h3 className="text-2xl font-bold mb-6">Question Management</h3>
          <p className="text-muted-foreground">Question CRUD interface coming soon...</p>
        </div>
      )}

      {/* Analytics */}
      {view === 'analytics' && (
        <div className="glass p-8 rounded-2xl">
          <h3 className="text-2xl font-bold mb-6">Platform Analytics</h3>
          <p className="text-muted-foreground">Detailed analytics dashboard coming soon...</p>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
