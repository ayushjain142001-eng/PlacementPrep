import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Sparkles, Clock, Brain, Lock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

const ResumeModule = () => {
  const navigate = useNavigate();

  const features = [
    { icon: Brain, title: 'AI-Powered Analysis', description: 'Deep semantic analysis of your resume content using advanced NLP.' },
    { icon: Sparkles, title: 'Tailored Suggestions', description: 'Get specific, actionable improvements based on your target role.' },
    { icon: FileText, title: 'ATS Compatibility', description: 'Check if your resume passes Applicant Tracking Systems.' },
    { icon: Lock, title: 'Privacy First', description: 'Your resume never leaves our secure servers — fully local processing.' },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto" data-testid="resume-coming-soon">
      <div className="text-center space-y-3">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/30"
        >
          <FileText className="w-10 h-10 text-white" />
        </motion.div>
        <h1 className="text-4xl font-bold">Resume Analysis</h1>
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-500 text-sm font-medium border border-amber-500/30">
          <Clock className="w-4 h-4" />
          Coming Soon
        </span>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
          We&apos;re crafting a genuinely useful resume analyser — one that gives you real, accurate
          feedback instead of generic templated suggestions. It will be available soon.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass rounded-2xl p-6 border border-border opacity-80"
              data-testid={`resume-feature-${i}`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.description}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="text-center pt-4">
        <p className="text-sm text-muted-foreground mb-4">
          In the meantime, sharpen your interview answers and coding skills:
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Button onClick={() => navigate('/interview')} variant="outline" data-testid="goto-interview-btn">
            Practice Interview
          </Button>
          <Button onClick={() => navigate('/coding')} className="btn-glow" data-testid="goto-coding-btn">
            Solve Coding Problems
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResumeModule;
