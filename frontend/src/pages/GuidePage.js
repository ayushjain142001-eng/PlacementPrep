import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Target, Brain, Code, Video, CheckCircle, Lightbulb } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';

const GuidePage = () => {
  const steps = [
    {
      icon: Target,
      title: 'Set Your Goals',
      description: 'Complete the onboarding to set your target role, companies, and timeline.',
      action: 'Update Profile',
      link: '/profile'
    },
    {
      icon: Brain,
      title: 'Master Aptitude & Reasoning',
      description: 'Practice quantitative, logical, and verbal questions daily. Aim for 80%+ accuracy.',
      action: 'Start Aptitude',
      link: '/aptitude'
    },
    {
      icon: Code,
      title: 'Solve DSA Problems',
      description: 'Focus on arrays, strings, trees, and graphs. Practice with our Monaco editor.',
      action: 'Start Coding',
      link: '/coding'
    },
    {
      icon: Video,
      title: 'Practice Mock Interviews',
      description: 'Do at least 2-3 mock interviews per week. Review your performance and improve.',
      action: 'Start Interview',
      link: '/interview'
    }
  ];

  const tips = [
    'Maintain a daily streak for consistent progress',
    'Focus on weak areas identified in analytics',
    'Review topics using spaced repetition',
    'Join study groups for peer learning',
    'Track your hire readiness score weekly'
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12" data-testid="guide-page">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <BookOpen className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-5xl font-bold mb-4">Success Guide</h1>
        <p className="text-xl text-foreground max-w-2xl mx-auto">
          Your complete roadmap to crack technical interviews and land your dream job
        </p>
      </motion.div>

      {/* Steps */}
      <div className="space-y-6">
        <h2 className="text-3xl font-bold">4-Step Preparation Strategy</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass p-8 rounded-2xl hover:border-indigo-500/50 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl font-bold gradient-text">{idx + 1}</span>
                      <h3 className="text-xl font-bold">{step.title}</h3>
                    </div>
                    <p className="text-muted-foreground mb-4">{step.description}</p>
                    <Link to={step.link}>
                      <Button size="sm" className="btn-glow">{step.action}</Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Tips */}
      <div className="glass p-8 rounded-2xl">
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
          <Lightbulb className="w-8 h-8 text-violet-500" />
          Pro Tips
        </h2>
        <div className="space-y-3">
          {tips.map((tip, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-start gap-3 bg-card/50 p-4 rounded-lg"
            >
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-foreground">{tip}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Sample Schedule */}
      <div className="glass p-8 rounded-2xl">
        <h2 className="text-3xl font-bold mb-6">Sample Weekly Schedule</h2>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
            <div key={day} className="bg-card/50 p-4 rounded-lg">
              <div className="font-bold mb-2">{day}</div>
              <div className="text-sm text-muted-foreground space-y-1">
                {idx < 5 ? (
                  <>
                    <div>DSA: 2hr</div>
                    <div>Aptitude: 1hr</div>
                  </>
                ) : (
                  <>
                    <div>Mock Test</div>
                    <div>Review</div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GuidePage;
