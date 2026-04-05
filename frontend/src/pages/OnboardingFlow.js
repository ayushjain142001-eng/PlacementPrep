import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { toast } from 'sonner';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const OnboardingFlow = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  
  const [formData, setFormData] = useState({
    targetRole: '',
    targetCompanies: '',
    techStack: '',
    dailyHours: 2,
    timeline: '3-6 months'
  });

  const handleNext = async () => {
    if (step < 4) {
      setStep(step + 1);
      await api.post('/onboarding/step', { step, ...formData });
    } else {
      await handleComplete();
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      await api.post('/onboarding/complete');
      await refreshUser();
      toast.success('Onboarding completed! Welcome to PlacementPrep 🎉');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={`w-1/4 h-2 mx-1 rounded-full transition-all ${
                s <= step ? 'bg-indigo-500' : 'bg-slate-800'
              }`} />
            ))}
          </div>
          <p className="text-center text-slate-400">Step {step} of 4</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass p-8 rounded-2xl"
          >
            {step === 1 && (
              <div className="space-y-6" data-testid="onboarding-step-1">
                <h2 className="text-3xl font-bold">Career Goals</h2>
                <p className="text-slate-400">Tell us about your target role and companies</p>
                <Input
                  placeholder="Target Role (e.g., Software Engineer)"
                  value={formData.targetRole}
                  onChange={(e) => setFormData({...formData, targetRole: e.target.value})}
                  className="bg-slate-900/50 border-slate-800"
                />
                <Input
                  placeholder="Target Companies (comma separated)"
                  value={formData.targetCompanies}
                  onChange={(e) => setFormData({...formData, targetCompanies: e.target.value})}
                  className="bg-slate-900/50 border-slate-800"
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6" data-testid="onboarding-step-2">
                <h2 className="text-3xl font-bold">Tech Stack</h2>
                <p className="text-slate-400">What technologies do you want to focus on?</p>
                <Input
                  placeholder="Technologies (e.g., React, Python, Java)"
                  value={formData.techStack}
                  onChange={(e) => setFormData({...formData, techStack: e.target.value})}
                  className="bg-slate-900/50 border-slate-800"
                />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6" data-testid="onboarding-step-3">
                <h2 className="text-3xl font-bold">Availability</h2>
                <p className="text-slate-400">How much time can you dedicate daily?</p>
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-slate-300">Daily Hours: {formData.dailyHours}</span>
                    <input
                      type="range"
                      min="1"
                      max="8"
                      value={formData.dailyHours}
                      onChange={(e) => setFormData({...formData, dailyHours: parseInt(e.target.value)})}
                      className="w-full mt-2"
                    />
                  </label>
                  <select
                    value={formData.timeline}
                    onChange={(e) => setFormData({...formData, timeline: e.target.value})}
                    className="w-full p-3 bg-slate-900/50 border border-slate-800 rounded-lg text-white"
                  >
                    <option value="1-3 months">1-3 months</option>
                    <option value="3-6 months">3-6 months</option>
                    <option value="6-12 months">6-12 months</option>
                  </select>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 text-center" data-testid="onboarding-step-4">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold">All Set!</h2>
                <p className="text-slate-400">
                  We've created a personalized roadmap for you. Let's start your journey!
                </p>
              </div>
            )}

            <div className="flex items-center justify-between mt-8">
              <Button
                variant="ghost"
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1}
                data-testid="onboarding-prev-btn"
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Previous
              </Button>
              <Button
                onClick={handleNext}
                disabled={loading}
                className="btn-glow"
                data-testid="onboarding-next-btn"
              >
                {step === 4 ? (loading ? 'Completing...' : 'Get Started') : 'Next'}
                {step < 4 && <ChevronRight className="w-5 h-5 ml-2" />}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OnboardingFlow;
