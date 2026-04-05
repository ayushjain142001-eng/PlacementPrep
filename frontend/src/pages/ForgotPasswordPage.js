import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Zap, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { validateEmail } from '../utils/validation';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }
    
    setLoading(true);
    
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Password reset instructions sent!');
    } catch (err) {
      toast.error('Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md glass p-12 rounded-2xl text-center space-y-6"
        >
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold">Check Your Email</h2>
          <p className="text-slate-300">
            We've sent a password reset link to <span className="text-indigo-400 font-semibold">{email}</span>
          </p>
          <p className="text-sm text-slate-400">
            Didn't receive the email? Check your spam folder or try again.
          </p>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000" />
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
            <p className="text-xs text-slate-400">Your Ultimate Placement Preparation Platform</p>
          </div>
        </Link>

        <div className="glass p-8 rounded-2xl border border-slate-800/50">
          <Link to="/login" className="inline-flex items-center text-sm text-slate-400 hover:text-slate-300 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to login
          </Link>
          
          <h2 className="text-3xl font-bold font-heading mb-2">Forgot Password?</h2>
          <p className="text-slate-400 mb-6">No worries! Enter your email and we'll send you reset instructions.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="you@example.com"
                  className={`pl-10 bg-slate-900/50 border-slate-800 focus:border-indigo-500 rounded-lg ${
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
