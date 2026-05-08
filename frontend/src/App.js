import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from './components/ui/sonner';
import './App.css';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import OnboardingFlow from './pages/OnboardingFlow';
import Dashboard from './pages/Dashboard';
import AptitudeModule from './pages/AptitudeModule';
import ReasoningModule from './pages/ReasoningModule';
import CommunicationModule from './pages/CommunicationModule';
import CodingModule from './pages/CodingModule';
import InterviewModule from './pages/InterviewModule';
import ResumeModule from './pages/ResumeModule';
import RevisionModule from './pages/RevisionModule';
import ProfilePage from './pages/ProfilePage';
import AdminPanel from './pages/AdminPanel';
import LeaderboardPage from './pages/LeaderboardPage';
import GuidePage from './pages/GuidePage';
import StudyGroupsPage from './pages/StudyGroupsPage';
import DeveloperPage from './pages/DeveloperPage';
import Layout from './components/Layout';
import Chatbot from './components/Chatbot';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center transition-colors duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <SignupPage />} />
      <Route path="/forgot-password" element={user ? <Navigate to="/dashboard" /> : <ForgotPasswordPage />} />
      <Route path="/reset-password" element={user ? <Navigate to="/dashboard" /> : <ResetPasswordPage />} />
      
      <Route path="/onboarding" element={
        <ProtectedRoute>
          <OnboardingFlow />
        </ProtectedRoute>
      } />
      
      <Route element={<Layout />}>
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/aptitude" element={
          <ProtectedRoute>
            <AptitudeModule />
          </ProtectedRoute>
        } />
        
        <Route path="/reasoning" element={
          <ProtectedRoute>
            <ReasoningModule />
          </ProtectedRoute>
        } />
        
        <Route path="/communication" element={
          <ProtectedRoute>
            <CommunicationModule />
          </ProtectedRoute>
        } />
        
        <Route path="/coding" element={
          <ProtectedRoute>
            <CodingModule />
          </ProtectedRoute>
        } />
        
        <Route path="/interview" element={
          <ProtectedRoute>
            <InterviewModule />
          </ProtectedRoute>
        } />
        
        <Route path="/resume" element={
          <ProtectedRoute>
            <ResumeModule />
          </ProtectedRoute>
        } />
        
        <Route path="/revision" element={
          <ProtectedRoute>
            <RevisionModule />
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminPanel />
          </ProtectedRoute>
        } />
        
        <Route path="/leaderboard" element={
          <ProtectedRoute>
            <LeaderboardPage />
          </ProtectedRoute>
        } />
        
        <Route path="/guide" element={
          <ProtectedRoute>
            <GuidePage />
          </ProtectedRoute>
        } />
        
        <Route path="/study-groups" element={
          <ProtectedRoute>
            <StudyGroupsPage />
          </ProtectedRoute>
        } />

        <Route path="/developer" element={
          <ProtectedRoute>
            <DeveloperPage />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Chatbot />
          <Toaster position="bottom-right" richColors />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
