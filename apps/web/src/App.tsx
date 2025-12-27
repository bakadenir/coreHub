import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import LoginRegister from './pages/LoginRegister';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Schedule from './pages/Schedule';
import Notes from './pages/Notes';
import Links from './pages/Links';
import Habits from './pages/Habits';
import Article from './pages/Article';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';

import Landing from './pages/Landing';

import Donate from './pages/Donate';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import MainLayout from './components/MainLayout';
import { PageTitleUpdater } from './components/PageTitleUpdater';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <PageTitleUpdater />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<LoginRegister />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/note/:slug" element={<Article />} />

        {/* Main protected routes with shared layout */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/home" element={<Home />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/links" element={<Links />} />
          <Route path="/habits" element={<Habits />} />
        </Route>

        {/* Other protected routes */}
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
