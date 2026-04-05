import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { User, Mail, Target, Code, Calendar, Trophy, Zap, Save } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Progress } from '../components/ui/progress';

const ProfilePage = () => {
  const { profile, updateProfile, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    target_role: profile?.target_role || '',
    target_companies: profile?.target_companies?.join(', ') || '',
    preferred_tech_stack: profile?.preferred_tech_stack?.join(', ') || '',
    daily_hours: profile?.daily_hours || 2,
    target_timeline: profile?.target_timeline || '3-6 months'
  });

  const handleSave = async () => {
    try {
      await updateProfile({
        ...formData,
        target_companies: formData.target_companies.split(',').map(c => c.trim()).filter(Boolean),
        preferred_tech_stack: formData.preferred_tech_stack.split(',').map(t => t.trim()).filter(Boolean)
      });
      
      await refreshUser();
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const levelProgress = ((profile?.xp || 0) % 100);

  return (
    <div className="max-w-6xl mx-auto space-y-6" data-testid="profile-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Profile</h1>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} data-testid="edit-profile-btn">
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button onClick={handleSave} className="btn-glow" data-testid="save-profile-btn">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1 glass p-8 rounded-2xl space-y-6 h-fit"
        >
          <div className="text-center">
            <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-5xl font-bold mx-auto mb-4">
              {profile?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <h2 className="text-2xl font-bold">{profile?.name || 'User'}</h2>
          </div>

          <div className="space-y-4">
            <div className="bg-card/50 p-4 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Level</span>
                <Trophy className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="text-3xl font-bold">{profile?.level || 1}</div>
            </div>

            <div className="bg-card/50 p-4 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Total XP</span>
                <Zap className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="text-3xl font-bold">{profile?.xp || 0}</div>
              <Progress value={levelProgress} className="mt-2" />
              <p className="text-xs text-slate-500 mt-1">{100 - levelProgress} XP to next level</p>
            </div>

            <div className="bg-card/50 p-4 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Streak</span>
                <span className="text-2xl">🔥</span>
              </div>
              <div className="text-3xl font-bold">{profile?.streak_days || 0} days</div>
            </div>

            <div className="bg-card/50 p-4 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Hire Readiness</span>
                <Target className="w-5 h-5 text-indigo-500" />
              </div>
              <div className="text-3xl font-bold gradient-text">{Math.round(profile?.hire_readiness_score || 0)}%</div>
              <Progress value={profile?.hire_readiness_score || 0} className="mt-2" />
            </div>
          </div>
        </motion.div>

        {/* Profile Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Personal Info */}
          <div className="glass p-8 rounded-2xl space-y-6">
            <h3 className="text-2xl font-bold">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Full Name
                </label>
                {isEditing ? (
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="bg-card/50 border-border"
                  />
                ) : (
                  <p className="text-lg">{profile?.name || 'Not set'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </label>
                <p className="text-lg text-muted-foreground">{profile?.email || 'Not set'}</p>
              </div>
            </div>
          </div>

          {/* Career Goals */}
          <div className="glass p-8 rounded-2xl space-y-6">
            <h3 className="text-2xl font-bold">Career Goals</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <Target className="w-4 h-4 inline mr-2" />
                  Target Role
                </label>
                {isEditing ? (
                  <Input
                    value={formData.target_role}
                    onChange={(e) => setFormData({...formData, target_role: e.target.value})}
                    placeholder="e.g., Software Engineer"
                    className="bg-card/50 border-border"
                  />
                ) : (
                  <p className="text-lg">{profile?.target_role || 'Not set'}</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
