import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Schedule from './pages/Schedule';
import Notes from './pages/Notes';
import Links from './pages/Links';
import Habits from './pages/Habits';

import Landing from './pages/Landing';

import Donate from './pages/Donate';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/links" element={<Links />} />
        <Route path="/habits" element={<Habits />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
