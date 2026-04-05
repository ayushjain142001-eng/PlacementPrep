import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'sonner';
import { Zap, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { validateEmail } from '../utils/validation';
import api from '../utils/api';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devResetLink, setDevResetLink] = useState('');
  const { theme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await api.post('/auth/forgot-password', { email });
      setSent(true);
      // Store dev reset link if provided
      if (response.data.dev_reset_link) {
        setDevResetLink(response.data.dev_reset_link);
      }
      toast.success('Password reset instructions sent!');
    } catch (err) {
      toast.error('Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 transition-colors duration-300">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md glass p-12 rounded-2xl text-center space-y-6"
        >
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold">Check Your Email</h2>
          <p className="text-foreground">
            We've sent a password reset link to <span className="text-indigo-400 font-semibold">{email}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Didn't receive the email? Check your spam folder or try again.
          </p>
          
          {/* Development only: Show reset link directly */}
          {devResetLink && (
            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-sm text-yellow-500 font-semibold mb-2">
                🔧 Development Mode
              </p>
              <p className="text-xs text-foreground mb-3">
                No email service configured. Use this link to reset your password:
              </p>
              <Link 
                to={devResetLink}
                className="text-sm text-indigo-400 hover:text-indigo-300 underline break-all"
              >
                {window.location.origin}{devResetLink}
              </Link>
            </div>
          )}
          
          <Link to="/login">
            <Button className="w-full btn-glow">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 transition-colors duration-300">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl ${theme === 'dark' ? 'opacity-10' : 'opacity-5'} animate-blob`} />
        <div className={`absolute top-0 -right-4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl ${theme === 'dark' ? 'opacity-10' : 'opacity-5'} animate-blob animation-delay-2000`} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <Link to="/" className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text font-heading">PlacementPrep</h1>
            <p className="text-xs text-muted-foreground">Your Ultimate Placement Preparation Platform</p>
          </div>
        </Link>

        <div className="glass p-8 rounded-2xl border border-border/50">
          <Link to="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to login
          </Link>
          
          <h2 className="text-3xl font-bold font-heading mb-2">Forgot Password?</h2>
          <p className="text-muted-foreground mb-6">No worries! Enter your email and we'll send you reset instructions.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="you@example.com"
                  className={`pl-10 bg-card/50 border-border focus:border-indigo-500 rounded-lg ${
                    error ? 'border-red-500' : ''
                  }`}
                />
              </div>
              {error && (
                <p className="text-red-400 text-sm mt-1">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full btn-glow rounded-lg"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  <span>Sending...</span>
                </div>
              ) : (
                'Send Reset Link'
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
