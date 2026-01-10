import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Synchronous imports - lightweight, frequently accessed pages
import Landing from './pages/Landing';
import LoginRegister from './pages/LoginRegister';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import MainLayout from './components/MainLayout';
import { PageTitleUpdater } from './components/PageTitleUpdater';
import { ProtectedRoute } from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy loaded pages - heavy or less frequently accessed
const Schedule = lazy(() => import('./pages/Schedule'));
const Notes = lazy(() => import('./pages/Notes'));
const Links = lazy(() => import('./pages/Links'));
const Habits = lazy(() => import('./pages/Habits'));
const Todos = lazy(() => import('./pages/Todos'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Article = lazy(() => import('./pages/Article'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Donate = lazy(() => import('./pages/Donate'));
const Settings = lazy(() => import('./pages/Settings'));
const Profile = lazy(() => import('./pages/Profile'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
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
              <Route path="/todos" element={<Todos />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/links" element={<Links />} />
              <Route path="/habits" element={<Habits />} />
            </Route>

            {/* Other protected routes (without sidebar) */}
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/donate" element={<ProtectedRoute><Donate /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            {/* Admin only route */}
            <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />

            {/* 404 Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
