import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Trophy, Medal, Crown, Zap, TrendingUp } from 'lucide-react';

const LeaderboardPage = () => {
  const { profile } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await api.get('/gamification/leaderboard?limit=50');
      setLeaderboard(response.data);
    } catch (error) {
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-violet-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-foreground" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-600" />;
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const userRank = leaderboard.findIndex(entry => entry.user_id === profile?.user_id) + 1;

  return (
    <div className="max-w-6xl mx-auto space-y-8" data-testid="leaderboard-page">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4">🏆 Leaderboard</h1>
        <p className="text-muted-foreground text-lg">Top performers this month</p>
      </div>

      {/* User's Rank */}
      {userRank > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-6 rounded-2xl border-2 border-indigo-500/30"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold gradient-text">#{userRank}</div>
              <div>
                <div className="font-semibold">Your Rank</div>
                <div className="text-sm text-muted-foreground">{profile?.xp || 0} XP</div>
              </div>
            </div>
            <Trophy className="w-8 h-8 text-indigo-500" />
          </div>
        </motion.div>
      )}

      {/* Top 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {leaderboard.slice(0, 3).map((entry, idx) => {
          const rank = idx + 1;
          const isUser = entry.user_id === profile?.user_id;
          
          return (
            <motion.div
              key={entry.user_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`glass p-8 rounded-2xl text-center ${
                isUser ? 'border-2 border-indigo-500/50' : ''
              } ${rank === 1 ? 'md:scale-105' : ''}`}
            >
              <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-3xl font-bold">
                {entry.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              
              <div className="flex items-center justify-center gap-2 mb-2">
                {getRankIcon(rank)}
                <span className="text-2xl font-bold">#{rank}</span>
              </div>
              
              <h3 className="text-xl font-bold mb-1">{entry.name || 'Anonymous'}</h3>
              <div className="flex items-center justify-center gap-2 text-muted-foreground mb-3">
                <Zap className="w-4 h-4 text-violet-500" />
                <span className="font-semibold">{entry.xp} XP</span>
              </div>
              <div className="text-sm text-slate-500">Level {entry.level}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Rest of Leaderboard */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="bg-card/50 p-6 border-b border-border">
          <h3 className="text-2xl font-bold">All Rankings</h3>
        </div>
        
        <div className="divide-y divide-slate-800">
          {leaderboard.slice(3).map((entry, idx) => {
            const rank = idx + 4;
            const isUser = entry.user_id === profile?.user_id;
            
            return (
              <motion.div
                key={entry.user_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.02 }}
                className={`p-6 hover:bg-secondary/30 transition-colors ${
                  isUser ? 'bg-indigo-500/10' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-8 text-center font-bold text-muted-foreground">
                      #{rank}
                    </div>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold">
                      {entry.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="font-semibold">{entry.name || 'Anonymous'}</div>
                      <div className="text-sm text-muted-foreground">Level {entry.level}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-violet-500" />
                    <span className="font-semibold">{entry.xp} XP</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
