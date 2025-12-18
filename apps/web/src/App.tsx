import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Schedule from './pages/Schedule';
import Notes from './pages/Notes';
import Links from './pages/Links';
import Habits from './pages/Habits';

import Landing from './pages/Landing';

import Donate from './pages/Donate';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import { PageTitleUpdater } from './components/PageTitleUpdater';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <PageTitleUpdater />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* Protected routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
        <Route path="/notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
        <Route path="/links" element={<ProtectedRoute><Links /></ProtectedRoute>} />
        <Route path="/habits" element={<ProtectedRoute><Habits /></ProtectedRoute>} />
        <Route path="/donate" element={<ProtectedRoute><Donate /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* Admin only route */}
        <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

