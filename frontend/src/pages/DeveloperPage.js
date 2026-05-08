import React from 'react';
import { motion } from 'framer-motion';
import {
  Github, Linkedin, Mail, Globe, Sparkles, Code2, Layers, Cpu,
  Palette, Database, Brain, Rocket, Heart,
} from 'lucide-react';
import { Button } from '../components/ui/button';

const SKILLS = [
  { name: 'React', icon: Code2 },
  { name: 'Next.js', icon: Rocket },
  { name: 'AI Integration', icon: Brain },
  { name: 'Node.js', icon: Cpu },
  { name: 'TypeScript', icon: Layers },
  { name: 'UI/UX Design', icon: Palette },
  { name: 'FastAPI', icon: Sparkles },
  { name: 'MongoDB', icon: Database },
];

const VISION = [
  {
    title: 'Built for Students',
    description: 'Crafted to help engineering students crack placements without paying for expensive coaching.',
    icon: Heart,
  },
  {
    title: 'AI-Powered Coaching',
    description: 'Personalised practice via Gemini-driven question generation, conversational doubt-clearing, and dynamic feedback.',
    icon: Brain,
  },
  {
    title: 'End-to-End Ecosystem',
    description: 'Aptitude, reasoning, coding, communication, mock interviews, resume insights — all under one roof.',
    icon: Layers,
  },
  {
    title: 'Production-Grade',
    description: 'Built with scalable architecture, real-time updates, and modular components so it grows with the user.',
    icon: Rocket,
  },
];

const Avatar = () => (
  <motion.div
    initial={{ scale: 0.85, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.5, type: 'spring' }}
    className="relative w-44 h-44 md:w-56 md:h-56 mx-auto"
    data-testid="developer-avatar"
  >
    {/* Animated gradient ring */}
    <motion.div
      className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-1"
      animate={{ rotate: [0, 360] }}
      transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
    >
      <div className="w-full h-full rounded-full bg-background" />
    </motion.div>
    {/* Inner monogram */}
    <div className="absolute inset-2 rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-2xl">
      <span className="text-6xl md:text-7xl font-extrabold text-white tracking-tighter font-display">
        AJ
      </span>
    </div>
    {/* Floating sparkles */}
    <motion.div
      className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/40 border-4 border-background"
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 2.4, repeat: Infinity }}
    >
      <Sparkles className="w-5 h-5 text-white" />
    </motion.div>
  </motion.div>
);

const SocialButton = ({ icon: Icon, label, href, testId }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className="group"
    data-testid={testId}
  >
    <Button variant="outline" className="gap-2 border-indigo-500/30 hover:border-indigo-500/80 hover:bg-indigo-500/10">
      <Icon className="w-4 h-4 group-hover:text-indigo-400 transition-colors" />
      {label}
    </Button>
  </a>
);

const DeveloperPage = () => {
  return (
    <div className="space-y-12 pb-20" data-testid="developer-page">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl border border-border glass p-8 md:p-16">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none" />
        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <Avatar />
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-medium border border-indigo-500/20">
                <Sparkles className="w-3 h-3" /> Creator & Developer
              </span>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Ayush Jain
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Building AI-powered solutions for smarter placement preparation.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <SocialButton icon={Linkedin} label="LinkedIn" href="https://linkedin.com" testId="social-linkedin" />
                <SocialButton icon={Github} label="GitHub" href="https://github.com" testId="social-github" />
                <SocialButton icon={Mail} label="Email" href="mailto:hello@example.com" testId="social-email" />
                <SocialButton icon={Globe} label="Portfolio" href="https://example.com" testId="social-portfolio" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="md:col-span-2 glass rounded-2xl p-8 border border-border"
        >
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Heart className="w-6 h-6 text-pink-500" />
            About
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              I'm Ayush — a full-stack engineer obsessed with building tools that empower students.
              PlacementPrep started as a side-project to consolidate everything I wished I had during
              my own campus placement journey: structured practice, instant doubt-clearing, and a friendly
              AI mentor that's available 24/7.
            </p>
            <p>
              The goal is simple: make placement preparation accessible, intelligent, and genuinely
              enjoyable. No more juggling 10 different apps for aptitude, coding, and interview prep.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-6 border border-border space-y-4"
        >
          <h3 className="font-semibold text-lg">Tech Stack</h3>
          <div className="grid grid-cols-2 gap-3">
            {SKILLS.map((s, i) => (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card/50 border border-border hover:border-indigo-500/50 transition-colors"
                data-testid={`skill-${s.name.toLowerCase().replace(/\W+/g, '-')}`}
              >
                <s.icon className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-medium">{s.name}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* VISION */}
      <section>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-bold mb-6 text-center"
        >
          Platform Vision
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {VISION.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass rounded-2xl p-6 border border-border hover:border-indigo-500/40 transition-all hover-lift"
              data-testid={`vision-${i}`}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                <v.icon className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="font-semibold mb-2">{v.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CONTRIBUTION */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-8 md:p-12 border border-border text-center max-w-3xl mx-auto"
        >
          <Sparkles className="w-10 h-10 text-indigo-400 mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Contribute & Connect</h2>
          <p className="text-muted-foreground mb-6">
            PlacementPrep is built with love and open to feedback. If you have ideas, find bugs,
            or want to collaborate, please reach out — every contribution shapes the platform.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <SocialButton icon={Mail} label="Send Feedback" href="mailto:hello@example.com" testId="contact-feedback" />
            <SocialButton icon={Github} label="Star on GitHub" href="https://github.com" testId="contact-github" />
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default DeveloperPage;
