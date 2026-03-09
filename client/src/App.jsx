import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import MainLayout from '@/layouts/MainLayout';
import CommandPalette from '@/components/CommandPalette';
import TrailerModal from '@/components/TrailerModal';
import AuthRefresh from '@/components/AuthRefresh';
import ProtectedRoute from '@/routes/ProtectedRoute';

import Home from '@/pages/Home';
import MovieDetail from '@/pages/MovieDetail';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Favorites from '@/pages/Favorites';
import History from '@/pages/History';
import Discover from '@/pages/Discover';
import AdminDashboard from '@/pages/AdminDashboard';
import Profile from '@/pages/Profile';
import Shorts from '@/pages/Shorts';

export default function App() {
  return (
    <>
      <AuthRefresh />
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="movie/:id" element={<MovieDetail />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="discover" element={<Discover />} />
          <Route path="shorts" element={<Shorts />} />
          <Route
            path="favorites"
            element={
              <ProtectedRoute>
                <Favorites />
              </ProtectedRoute>
            }
          />
          <Route
            path="history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      <CommandPalette />
      <TrailerModal />
    </>
  );
}
