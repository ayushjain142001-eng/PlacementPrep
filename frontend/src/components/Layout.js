import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Brain, Puzzle, MessageSquare, Code, Video,
  FileText, Calendar, User, Settings, LogOut, Menu,
  X, Sun, Moon, Trophy, Zap, BookOpen, Users
} from 'lucide-react';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, profile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Aptitude', path: '/aptitude', icon: Brain },
    { name: 'Reasoning', path: '/reasoning', icon: Puzzle },
    { name: 'Communication', path: '/communication', icon: MessageSquare },
    { name: 'Coding', path: '/coding', icon: Code },
    { name: 'Interview', path: '/interview', icon: Video },
    { name: 'Resume', path: '/resume', icon: FileText },
    { name: 'Revision', path: '/revision', icon: Calendar },
  ];
  
  const extraNav = [
    { name: 'Guide', path: '/guide', icon: BookOpen },
    { name: 'Study Groups', path: '/study-groups', icon: Users },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl ${theme === 'dark' ? 'opacity-10' : 'opacity-5'} animate-blob`} />
        <div className={`absolute top-0 -right-4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl ${theme === 'dark' ? 'opacity-10' : 'opacity-5'} animate-blob animation-delay-2000`} />
        <div className={`absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl ${theme === 'dark' ? 'opacity-10' : 'opacity-5'} animate-blob animation-delay-4000`} />
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || window.innerWidth >= 1024) && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="fixed inset-y-0 left-0 z-50 w-72 bg-card/95 backdrop-blur-xl border-r border-border overflow-y-auto transition-colors duration-300"
          >
            <div className="p-6 space-y-6">
              {/* Logo */}
              <div className="flex items-center justify-between">
                <Link to="/dashboard" className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold gradient-text">PlacementPrep</h1>
                    <p className="text-xs text-slate-400">Career Coach</p>
                  </div>
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden p-2 hover:bg-accent rounded-lg transition-colors"
                  data-testid="close-sidebar-btn"
                >
                  <X className="w-5 h-5 text-foreground" />
                </button>
              </div>

              {/* User Profile Card */}
              <div className="glass p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {profile?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate text-foreground">{profile?.name || 'User'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Trophy className="w-3 h-3 text-amber-500" />
                      <span className="text-xs text-muted-foreground">Level {profile?.level || 1}</span>
                      <span className="text-xs text-indigo-400">{profile?.xp || 0} XP</span>
                    </div>
                  </div>
                </div>
                {/* XP Progress Bar */}
                <div className="mt-3">
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                      style={{ width: `${((profile?.xp || 0) % 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      data-testid={`nav-${item.name.toLowerCase()}`}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        active
                          ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                          : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Extra Navigation */}
              <div className="border-t border-border pt-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider px-4 mb-3">Community</p>
                <nav className="space-y-1">
                  {extraNav.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        data-testid={`nav-${item.name.toLowerCase().replace(' ', '-')}`}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          active
                            ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                            : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Bottom Actions */}
              <div className="pt-6 border-t border-border space-y-2">
                <Link
                  to="/profile"
                  data-testid="nav-profile"
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive('/profile')
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                      : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">Profile</span>
                </Link>
                
                <button
                  onClick={toggleTheme}
                  data-testid="theme-toggle-btn"
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-accent text-muted-foreground hover:text-foreground"
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  <span className="font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
                
                <button
                  onClick={logout}
                  data-testid="logout-btn"
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-red-500/10 text-red-400 hover:text-red-300"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-xl border-b border-border transition-colors duration-300">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-accent rounded-lg transition-colors"
              data-testid="open-sidebar-btn"
            >
              <Menu className="w-6 h-6 text-foreground" />
            </button>
            
            <div className="flex-1 lg:flex-none">
              <h2 className="text-xl font-bold font-heading text-foreground">
                {navigation.find(item => item.path === location.pathname)?.name || 'PlacementPrep'}
              </h2>
            </div>

            <div className="flex items-center gap-4">
              {profile?.streak_days > 0 && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-orange-500/10 border border-orange-500/30 rounded-full">
                  <span className="text-xl">🔥</span>
                  <span className="text-sm font-semibold text-orange-400">{profile.streak_days} day streak</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
