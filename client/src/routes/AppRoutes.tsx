import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import { PublicLayout } from '../layouts/PublicLayout.js';
import { AppLayout } from '../layouts/AppLayout.js';

// Public Pages
import { LandingPage } from '../pages/LandingPage.js';
import { LoginPage } from '../pages/auth/LoginPage.js';
import { RegisterPage } from '../pages/auth/RegisterPage.js';

// Protected Pages
import { DashboardPage } from '../pages/DashboardPage.js';
import { ResumeListPage } from '../pages/resumes/ResumeListPage.js';
import { ResumeUploadPage } from '../pages/resumes/ResumeUploadPage.js';
import { ResumeDetailPage } from '../pages/resumes/ResumeDetailPage.js';
import { ResumeAnalysisPage } from '../pages/resumes/ResumeAnalysisPage.js';
import { ResumeEditorPage } from '../pages/resumes/ResumeEditorPage.js';
import { ResumeVersionsPage } from '../pages/resumes/ResumeVersionsPage.js';
import { JobMatchPage } from '../pages/jobs/JobMatchPage.js';
import { JobDetailPage } from '../pages/jobs/JobDetailPage.js';
import { InterviewPrepPage } from '../pages/interview/InterviewPrepPage.js';
import { HistoryPage } from '../pages/history/HistoryPage.js';
import { ProfilePage } from '../pages/profile/ProfilePage.js';
import { SettingsPage } from '../pages/settings/SettingsPage.js';
import { ATSScoringPage } from '../pages/ATSScoringPage.js';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-950"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Landing & Auth Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Protected SaaS App Routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/resumes" element={<ResumeListPage />} />
        <Route path="/resumes/upload" element={<ResumeUploadPage />} />
        <Route path="/resumes/new/editor" element={<ResumeEditorPage />} />
        <Route path="/resumes/:id" element={<ResumeDetailPage />} />
        <Route path="/resumes/:id/analysis" element={<ResumeAnalysisPage />} />
        <Route path="/resumes/:id/editor" element={<ResumeEditorPage />} />
        <Route path="/resumes/:id/versions" element={<ResumeVersionsPage />} />
        <Route path="/job-match" element={<JobMatchPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="/interview-prep" element={<InterviewPrepPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/ats-scoring" element={<ATSScoringPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
