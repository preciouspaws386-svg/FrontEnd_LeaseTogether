import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

import AccessCodePage from './pages/auth/AccessCodePage';
import LoginPage from './pages/auth/LoginPage';
import SignUpPage from './pages/auth/SignUpPageNew';

import BrowsePage from './pages/app/BrowsePage';
import NotificationsPage from './pages/app/NotificationsPage';
import MyMeetUpsPage from './pages/app/MyMeetUpsPage';
import ProfilePage from './pages/app/ProfilePage';
import StudentHousingPage from './pages/app/StudentHousingPage';
import SelectSchoolPage from './pages/app/SelectSchoolPage';
import LandlordCreateListingPage from './pages/landlord/LandlordCreateListingPage';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminApartments from './pages/admin/AdminApartments';
import AdminAccessCodes from './pages/admin/AdminAccessCodes';
import AdminUsers from './pages/admin/AdminUsers';
import AdminMeetUps from './pages/admin/AdminMeetUps';
import AdminSchools from './pages/admin/AdminSchools';
import AdminListings from './pages/admin/AdminListings';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!adminOnly && !user.school && location.pathname !== '/select-school') {
    return <Navigate to="/select-school" replace />;
  }
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
            <Route path="/landlord/create-listing" element={<LandlordCreateListingPage />} />

          <Route
            path="/browse"
            element={
              <ProtectedRoute>
                <BrowsePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/select-school"
            element={
              <ProtectedRoute>
                <SelectSchoolPage />
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
            path="/listings"
            element={
              <ProtectedRoute>
                <StudentHousingPage />
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
            path="/admin/access-codes"
            element={
              <ProtectedRoute adminOnly>
                <AdminAccessCodes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/schools"
            element={
              <ProtectedRoute adminOnly>
                <AdminSchools />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/listings"
            element={
              <ProtectedRoute adminOnly>
                <AdminListings />
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

