import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { Link } from 'react-router-dom';
import {
  Target, TrendingUp, Flame, Trophy, Brain, Code, MessageSquare,
  Video, CheckCircle, Clock, Award, Zap, ChevronRight
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { toast } from 'sonner';

const Dashboard = () => {
  const { profile, refreshUser } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    handleDailyCheckin();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/analytics/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDailyCheckin = async () => {
    try {
      const response = await api.post('/gamification/checkin');
      if (response.data.xp_earned) {
        toast.success(`+${response.data.xp_earned} XP! ${response.data.streak} day streak 🔥`);
        refreshUser();
      }
    } catch (error) {
      // Already checked in
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const hireReadiness = dashboardData?.analytics?.hire_readiness_score || 0;
  const recommendations = dashboardData?.recommendations || [];
  const dailyPerformance = dashboardData?.daily_performance || [];

  // Use real performance data or fall back to mock
  const performanceData = dailyPerformance.length > 0 
    ? dailyPerformance.map((day, idx) => ({
        name: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx] || day.date.split('-')[2],
        score: day.score
      }))
    : [
        { name: 'Mon', score: 0 },
        { name: 'Tue', score: 0 },
        { name: 'Wed', score: 0 },
        { name: 'Thu', score: 0 },
        { name: 'Fri', score: 0 },
        { name: 'Sat', score: 0 },
        { name: 'Sun', score: 0 }
      ];

  // Calculate skill data from analytics
  const analyticsData = dashboardData?.analytics;
  const skillData = analyticsData?.test_performance?.map(perf => ({
    skill: perf.category.charAt(0).toUpperCase() + perf.category.slice(1),
    value: Math.round(perf.score)
  })) || [
    { skill: 'Coding', value: 0 },
    { skill: 'Aptitude', value: 0 },
    { skill: 'Communication', value: 0 },
    { skill: 'Reasoning', value: 0 }
  ];

  const modules = [
    { name: 'Aptitude', path: '/aptitude', icon: Brain, color: 'from-blue-500 to-cyan-500' },
    { name: 'Reasoning', path: '/reasoning', icon: Target, color: 'from-purple-500 to-pink-500' },
    { name: 'Communication', path: '/communication', icon: MessageSquare, color: 'from-green-500 to-emerald-500' },
    { name: 'Coding', path: '/coding', icon: Code, color: 'from-orange-500 to-red-500' },
    { name: 'Interview', path: '/interview', icon: Video, color: 'from-indigo-500 to-purple-500' },
    { name: 'Revision', path: '/revision', icon: Clock, color: 'from-yellow-500 to-orange-500' }
  ];

  return (
    <div className="space-y-8" data-testid="dashboard-container">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold font-heading mb-2">
            Welcome back, <span className="gradient-text">{profile?.name}!</span>
          </h1>
          <p className="text-muted-foreground">Let's continue building your career</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="glass px-6 py-3 rounded-full flex items-center gap-3">
            <Zap className="w-5 h-5 text-yellow-500" />
            <span className="font-semibold">{profile?.xp || 0} XP</span>
          </div>
          <div className="glass px-6 py-3 rounded-full flex items-center gap-3">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="font-semibold">Level {profile?.level || 1}</span>
          </div>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        {/* Hire Readiness - Large Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-8 lg:row-span-2 glass p-8 rounded-2xl border border-border/50 relative overflow-hidden"
          data-testid="hire-readiness-card"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full filter blur-3xl opacity-10" />
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Hire Readiness Score</h2>
                <p className="text-muted-foreground">Your overall preparation level</p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <Target className="w-8 h-8 text-white" />
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-end gap-2 mb-2">
                <span className="text-6xl font-bold gradient-text">{Math.round(hireReadiness)}</span>
                <span className="text-2xl text-muted-foreground mb-2">/100</span>
              </div>
              <Progress value={hireReadiness} className="h-3" />
            </div>

            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px'
                  }}
                />
                <Area type="monotone" dataKey="score" stroke="#6366f1" fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Streak Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-4 glass p-6 rounded-2xl border border-border/50"
          data-testid="streak-card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Daily Streak</h3>
            <Flame className="w-6 h-6 text-orange-500 streak-flame" />
          </div>
          <div className="text-4xl font-bold mb-2">{profile?.streak_days || 0} days</div>
          <p className="text-sm text-muted-foreground">Keep practicing daily!</p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-4 glass p-6 rounded-2xl border border-border/50"
          data-testid="attempts-card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Total Attempts</h3>
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
          <div className="text-4xl font-bold mb-2">{dashboardData?.analytics?.total_attempts || 0}</div>
          <p className="text-sm text-muted-foreground">Questions solved</p>
        </motion.div>

        {/* Skill Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-8 glass p-6 rounded-2xl border border-border/50"
          data-testid="skill-distribution-card"
        >
          <h3 className="font-semibold mb-6">Skill Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={skillData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
              <XAxis dataKey="skill" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Practice Modules */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Practice Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, idx) => {
            const Icon = module.icon;
            return (
              <motion.div
                key={module.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link to={module.path} data-testid={`module-${module.name.toLowerCase()}`}>
                  <div className="glass p-6 rounded-2xl border border-border/50 hover:border-indigo-500/50 transition-all hover-lift group">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{module.name}</h3>
                    <p className="text-muted-foreground text-sm mb-4">Continue practicing</p>
                    <div className="flex items-center text-indigo-400 text-sm font-medium">
                      Start <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Recommended for You</h2>
          <div className="space-y-4">
            {recommendations.slice(0, 3).map((rec, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass p-6 rounded-xl border border-border/50 flex items-start gap-4"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  rec.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                  rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  <Award className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{rec.title}</h4>
                  <p className="text-sm text-muted-foreground">{rec.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
