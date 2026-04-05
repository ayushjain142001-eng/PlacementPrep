import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { Zap, Brain, Code, Target, TrendingUp, Users, ArrowRight, CheckCircle, Star } from 'lucide-react';
import { Button } from '../components/ui/button';

const LandingPage = () => {
  const { theme } = useTheme();
  
  const features = [
    {
      icon: Brain,
      title: 'Aptitude & Reasoning',
      description: 'Master quantitative, logical, and verbal skills with adaptive tests'
    },
    {
      icon: Code,
      title: 'Coding Practice',
      description: 'Solve DSA problems with Monaco editor and instant feedback'
    },
    {
      icon: Target,
      title: 'Mock Interviews',
      description: 'Practice HR, technical, and behavioral interviews in real-time'
    },
    {
      icon: TrendingUp,
      title: 'AI-Powered Analytics',
      description: 'Track your progress with detailed performance insights'
    },
    {
      icon: Users,
      title: 'Personalized Roadmap',
      description: 'Get custom study plans based on your goals and performance'
    },
    {
      icon: Star,
      title: 'Gamified Learning',
      description: 'Stay motivated with XP, badges, streaks, and leaderboards'
    }
  ];

  const stats = [
    { value: '10K+', label: 'Questions' },
    { value: '50+', label: 'Companies' },
    { value: '95%', label: 'Success Rate' },
    { value: '24/7', label: 'Practice' }
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden transition-colors duration-300">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl ${theme === 'dark' ? 'opacity-10' : 'opacity-5'} animate-blob`} />
        <div className={`absolute top-0 -right-4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl ${theme === 'dark' ? 'opacity-10' : 'opacity-5'} animate-blob animation-delay-2000`} />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 bg-background/50 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text font-heading">PlacementPrep</h1>
              <p className="text-xs text-muted-foreground">Your Ultimate Placement Preparation Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" className="rounded-full" data-testid="nav-login-btn">
                Login
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="btn-glow rounded-full" data-testid="nav-signup-btn">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-sm text-indigo-400">
            <Zap className="w-4 h-4" />
            <span>AI-Powered Placement Preparation</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-heading tracking-tight">
            <span className="gradient-text">Ace Your Dream Job</span>
            <br />
            <span className="text-slate-200">With AI Coaching</span>
          </h1>
          
          <p className="text-lg md:text-xl text-foreground max-w-3xl mx-auto leading-relaxed">
            Master aptitude, coding, communication, and interviews with personalized AI guidance.
            Built for engineering students and developers preparing for top tech companies.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" className="btn-glow rounded-full px-8 text-lg" data-testid="hero-get-started-btn">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                className="glass p-6 rounded-2xl"
              >
                <div className="text-3xl md:text-4xl font-bold gradient-text">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-heading mb-4">Everything You Need to Succeed</h2>
          <p className="text-lg text-foreground max-w-2xl mx-auto">Comprehensive preparation tools designed for placement success</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="group glass p-6 rounded-2xl hover:border-indigo-500/50 transition-all hover-lift"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 mb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass p-12 rounded-3xl text-center space-y-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/30"
        >
          <h2 className="text-4xl md:text-5xl font-bold font-heading">Ready to Get Hired?</h2>
          <p className="text-lg text-foreground max-w-2xl mx-auto">Join thousands of students who landed their dream jobs with PlacementPrep</p>
          <Link to="/signup">
            <Button size="lg" className="btn-glow rounded-full px-8 text-lg" data-testid="cta-get-started-btn">
              Start Your Journey
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-background/80 backdrop-blur-xl border-t border-border/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <p>&copy; 2026 PlacementPrep. Built with ❤️ for aspiring engineers.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
