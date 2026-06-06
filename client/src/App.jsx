import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';

import Layout from './components/Layout';

// =========================
// PAGES
// =========================

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';

import ReelsPage from './pages/ReelsPage';

import ExplorePage from './pages/ExplorePage';
import NotificationsPage from './pages/NotificationsPage';
import MessagesPage from './pages/MessagesPage';
import SavedPage from './pages/SavedPage';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/AdminPage';
import MobileBottomNav from './components/MobileBottomNav';

// =========================
// PROTECTED ROUTE
// =========================

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// =========================
// PUBLIC ROUTE
// =========================

const PublicRoute = ({ children }) => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

// =========================
// APP
// =========================

function App() {
  return (
    <BrowserRouter>

      <AuthProvider>

        <Routes>

          {/* ========================= */}
          {/* PUBLIC ROUTES */}
          {/* ========================= */}

          <Route
            path="/"
            element={
              <PublicRoute>
                <LandingPage />
              </PublicRoute>
            }
          />

          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          <Route
            path="/signup"
            element={
              <PublicRoute>
                <SignupPage />
              </PublicRoute>
            }
          />

          {/* ========================= */}
          {/* PROTECTED ROUTES */}
          {/* ========================= */}

          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >

            {/* HOME */}
            <Route
              path="/home"
              element={<HomePage />}
            />

            {/* REELS */}
            <Route
              path="/reels"
              element={<ReelsPage />}
            />

            {/* EXPLORE */}
            <Route
              path="/explore"
              element={<ExplorePage />}
            />

            {/* MESSAGES */}
            <Route
              path="/messages"
              element={<MessagesPage />}
            />

            {/* NOTIFICATIONS */}
            <Route
              path="/notifications"
              element={<NotificationsPage />}
            />

            {/* SAVED */}
            <Route
              path="/saved"
              element={<SavedPage />}
            />

            {/* SETTINGS */}
            <Route
              path="/settings"
              element={<SettingsPage />}
            />

            {/* PROFILE */}
            <Route
              path="/profile/:username"
              element={<ProfilePage />}
            />

            {/* EDIT PROFILE */}
            <Route
              path="/profile/edit"
              element={<EditProfilePage />}
            />

            {/* ADMIN */}
            <Route
              path="/admin"
              element={<AdminPage />}
            />

          </Route>

          {/* ========================= */}
          {/* FALLBACK */}
          {/* ========================= */}
          

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />

          

        </Routes>

      </AuthProvider>

    </BrowserRouter>
  );
}

export default App;