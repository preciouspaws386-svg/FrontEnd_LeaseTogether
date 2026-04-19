import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

import AccessCodePage from './pages/auth/AccessCodePage';
import LoginPage from './pages/auth/LoginPage';
import SignUpPage from './pages/auth/SignUpPage';

import BrowsePage from './pages/app/BrowsePage';
import NotificationsPage from './pages/app/NotificationsPage';
import MyMeetUpsPage from './pages/app/MyMeetUpsPage';
import ProfilePage from './pages/app/ProfilePage';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminApartments from './pages/admin/AdminApartments';
import AdminUsers from './pages/admin/AdminUsers';
import AdminMeetUps from './pages/admin/AdminMeetUps';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/browse" replace />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: '#191E2C', color: '#F0EDE8', border: '1px solid rgba(255,255,255,0.09)' },
            }}
          />
          <Routes>
            {/* Access code must come first */}
            <Route path="/" element={<AccessCodePage />} />
            <Route path="/access-code" element={<AccessCodePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />

          <Route
            path="/browse"
            element={
              <ProtectedRoute>
                <BrowsePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/meetups"
            element={
              <ProtectedRoute>
                <MyMeetUpsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/apartments"
            element={
              <ProtectedRoute adminOnly>
                <AdminApartments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute adminOnly>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/meetups"
            element={
              <ProtectedRoute adminOnly>
                <AdminMeetUps />
              </ProtectedRoute>
            }
          />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}

