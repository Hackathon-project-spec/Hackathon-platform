import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Providers
import { AuthProvider, useAuth } from './context/AuthContext';
import { EventProvider } from './context/EventContext';
import { NotificationProvider } from './context/NotificationContext';

// Layout components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Toast from './components/common/Toast';
import BackendStatusBanner from './components/common/BackendStatusBanner';
import DemoAccountBar from './components/demo/DemoAccountBar';
import { DEMO_MODE } from './api/auth';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import GalleryPage from './pages/GalleryPage';
import TeamsPage from './pages/TeamsPage';
import ProjectSubmitPage from './pages/ProjectSubmitPage';
import JudgingPage from './pages/JudgingPage';
import LeaderboardPage from './pages/LeaderboardPage';
import OrganizerPage from './pages/OrganizerPage';

/**
 * Route guard – redirects to /login when no user is available.
 * Unauthenticated visitors are sent to /login (no default user is seeded).
 */
function ProtectedRoute({ children, requiredRoles }) {
  const { user, role } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && requiredRoles.length > 0) {
    const hasAccess = requiredRoles.includes(role);
    if (!hasAccess) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}

/**
 * Main layout shell wrapping authenticated pages with Navbar + Footer.
 */
function AppLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

/**
 * Inner router – must be inside AuthProvider to use the useAuth hook.
 */
function AppRoutes() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <>
      {/* Toast notification layer */}
      <Toast />

      {/* Backend health status banner */}
      {!isLoginPage && <BackendStatusBanner />}

      {/* Demo account quick-switch bar */}
      {!isLoginPage && DEMO_MODE && <DemoAccountBar />}

      <Routes>
        {/* Public landing page */}
        <Route
          path="/"
          element={
            <AppLayout>
              <LandingPage />
            </AppLayout>
          }
        />

        {/* Login page – standalone (no navbar/footer) */}
        <Route path="/login" element={<LoginPage />} />

        {/* Gallery – public */}
        <Route
          path="/gallery"
          element={
            <AppLayout>
              <GalleryPage />
            </AppLayout>
          }
        />

        {/* Teams – requires authentication */}
        <Route
          path="/teams"
          element={
            <ProtectedRoute>
              <AppLayout>
                <TeamsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Project submission – requires PARTICIPANT */}
        <Route
          path="/submit"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ProjectSubmitPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Judging – requires JUDGE or ORGANIZER/ADMIN */}
        <Route
          path="/judging"
          element={
            <ProtectedRoute>
              <AppLayout>
                <JudgingPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Leaderboard – public view */}
        <Route
          path="/leaderboard"
          element={
            <AppLayout>
              <LeaderboardPage />
            </AppLayout>
          }
        />

        {/* Organizer panel – requires ORGANIZER or ADMIN role */}
        <Route
          path="/organizer"
          element={
            <ProtectedRoute requiredRoles={['ORGANIZER', 'ADMIN']}>
              <AppLayout>
                <OrganizerPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

/**
 * Root App component — wraps everything in the correct provider order.
 * AuthProvider → EventProvider → NotificationProvider
 */
export default function App() {
  return (
    <AuthProvider>
      <EventProvider>
        <NotificationProvider>
          <AppRoutes />
        </NotificationProvider>
      </EventProvider>
    </AuthProvider>
  );
}