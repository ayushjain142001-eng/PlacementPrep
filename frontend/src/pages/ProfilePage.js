import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { User, Target, Calendar, Zap, Trophy, Edit2, Save, X, Upload, FileText } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Progress } from '../components/ui/progress';
import api from '../utils/api';

const ProfilePage = () => {
  const { profile, updateProfile, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
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
        preferred_tech_stack: formData.preferred_tech_stack.split(',').map(t => t.trim()).filter(Boolean),
        daily_hours: parseInt(formData.daily_hours)
      });
      
      await refreshUser();
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const endpoint = type === 'profile' ? '/upload/profile-picture' : '/upload/resume';
      const response = await api.post(endpoint, uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success(response.data.message);
      await refreshUser();
    } catch (error) {
      toast.error(error.response?.data?.detail || `Failed to upload ${type}`);
    } finally {
      setUploading(false);
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
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave} className="btn-glow" data-testid="save-profile-btn">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button onClick={() => setIsEditing(false)} variant="outline">
              <X className="w-4 h-4 mr-2" />
              Cancel
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
            {/* Profile Picture with Upload */}
            <div className="relative inline-block mb-4">
              {profile?.profile_picture ? (
                <img
                  src={profile.profile_picture}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-indigo-500/30"
                />
              ) : (
                <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-5xl font-bold border-4 border-indigo-500/30">
                  {profile?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              
              {/* Upload Button Overlay */}
              <label className="absolute bottom-0 right-0 bg-indigo-500 hover:bg-indigo-600 rounded-full p-2 cursor-pointer transition-colors shadow-lg">
                <Upload className="w-4 h-4 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'profile')}
                  disabled={uploading}
                />
              </label>
            </div>
            
            <h2 className="text-2xl font-bold">{profile?.name || 'User'}</h2>
            <p className="text-muted-foreground">{profile?.target_role || 'Software Engineer'}</p>
          </div>

          {/* Stats */}
          <div className="space-y-4">
            <div className="bg-card/50 p-4 rounded-xl border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Level</span>
                <Trophy className="w-5 h-5 text-amber-500" />
              </div>
              <div className="text-3xl font-bold">{profile?.level || 1}</div>
            </div>

            <div className="bg-card/50 p-4 rounded-xl border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Total XP</span>
                <Zap className="w-5 h-5 text-indigo-500" />
              </div>
              <div className="text-3xl font-bold">{profile?.xp || 0}</div>
              <Progress value={levelProgress} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">{100 - levelProgress} XP to next level</p>
            </div>

            <div className="bg-card/50 p-4 rounded-xl border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Streak</span>
                <span className="text-2xl">🔥</span>
              </div>
              <div className="text-3xl font-bold">{profile?.streak_days || 0} days</div>
            </div>

            <div className="bg-card/50 p-4 rounded-xl border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Hire Readiness</span>
                <Target className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="text-3xl font-bold">{profile?.hire_readiness_score || 0}%</div>
            </div>
          </div>

          {/* Resume Upload */}
          <div className="pt-4 border-t border-border">
            <label className="block text-sm font-medium mb-3">Resume</label>
            {profile?.resume_url ? (
              <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-xl mb-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <FileText className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm truncate">{profile.resume_filename || 'resume.pdf'}</span>
                </div>
                <a 
                  href={profile.resume_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-xs text-indigo-400 hover:text-indigo-300 ml-2 flex-shrink-0"
                >
                  View
                </a>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mb-3">No resume uploaded</p>
            )}
            
            <label className="block">
              <Button variant="outline" className="w-full" disabled={uploading} asChild>
                <span className="cursor-pointer flex items-center justify-center">
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? 'Uploading...' : (profile?.resume_url ? 'Update Resume' : 'Upload Resume')}
                </span>
              </Button>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => handleFileUpload(e, 'resume')}
                disabled={uploading}
              />
            </label>
            <p className="text-xs text-muted-foreground mt-2">PDF, DOC, or DOCX (max 10MB)</p>
          </div>
        </motion.div>

        {/* Profile Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 glass p-8 rounded-2xl space-y-6"
        >
          <h3 className="text-2xl font-bold mb-6">Career Goals & Preferences</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              {isEditing ? (
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your name"
                />
              ) : (
                <p className="text-foreground">{profile?.name || 'Not set'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Target Role</label>
              {isEditing ? (
                <Input
                  value={formData.target_role}
                  onChange={(e) => setFormData({ ...formData, target_role: e.target.value })}
                  placeholder="e.g., Software Engineer"
                />
              ) : (
                <p className="text-foreground">{profile?.target_role || 'Not set'}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Target Companies</label>
              {isEditing ? (
                <Input
                  value={formData.target_companies}
                  onChange={(e) => setFormData({ ...formData, target_companies: e.target.value })}
                  placeholder="Google, Microsoft, Amazon (comma-separated)"
                />
              ) : (
                <p className="text-foreground">{profile?.target_companies?.join(', ') || 'Not set'}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Preferred Tech Stack</label>
              {isEditing ? (
                <Input
                  value={formData.preferred_tech_stack}
                  onChange={(e) => setFormData({ ...formData, preferred_tech_stack: e.target.value })}
                  placeholder="React, Node.js, Python (comma-separated)"
                />
              ) : (
                <p className="text-foreground">{profile?.preferred_tech_stack?.join(', ') || 'Not set'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Daily Practice Hours</label>
              {isEditing ? (
                <Input
                  type="number"
                  min="1"
                  max="12"
                  value={formData.daily_hours}
                  onChange={(e) => setFormData({ ...formData, daily_hours: e.target.value })}
                />
              ) : (
                <p className="text-foreground">{profile?.daily_hours || 2} hours/day</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Target Timeline</label>
              {isEditing ? (
                <select
                  value={formData.target_timeline}
                  onChange={(e) => setFormData({ ...formData, target_timeline: e.target.value })}
                  className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="1-3 months">1-3 months</option>
                  <option value="3-6 months">3-6 months</option>
                  <option value="6-12 months">6-12 months</option>
                  <option value="1+ year">1+ year</option>
                </select>
              ) : (
                <p className="text-foreground">{profile?.target_timeline || '3-6 months'}</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
