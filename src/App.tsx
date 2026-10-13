import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './store/AppContext';

// Public pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';

// App shell and protected pages
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { LibraryPage } from './pages/LibraryPage';
import { SourceViewerPage } from './pages/SourceViewerPage';
import { TutorPage } from './pages/TutorPage';
import { QuizSetupPage } from './pages/QuizSetupPage';
import { DiagnosticQuizPage } from './pages/DiagnosticQuizPage';
import { QuizTakingPage } from './pages/QuizTakingPage';
import { QuizResultsPage } from './pages/QuizResultsPage';
import { ProgressPage } from './pages/ProgressPage';
import { CourseMapPage } from './pages/CourseMapPage';
import { RevisionPage } from './pages/RevisionPage';
import { SchedulePage } from './pages/SchedulePage';
import { EvaluationPage } from './pages/EvaluationPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected App Routes */}
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="library" element={<LibraryPage />} />
            <Route path="library/:sourceId" element={<SourceViewerPage />} />
            <Route path="tutor" element={<TutorPage />} />
            <Route path="quiz" element={<QuizSetupPage />} />
            <Route path="quiz/diagnostic" element={<DiagnosticQuizPage />} />
            <Route path="quiz/:quizId" element={<QuizTakingPage />} />
            <Route path="quiz/:quizId/results" element={<QuizResultsPage />} />
            <Route path="progress" element={<ProgressPage />} />
            <Route path="course-map" element={<CourseMapPage />} />
            <Route path="revision" element={<RevisionPage />} />
            <Route path="schedule" element={<SchedulePage />} />
            <Route path="evaluation" element={<EvaluationPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* 404 Catch-All */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
