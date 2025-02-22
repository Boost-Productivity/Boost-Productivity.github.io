import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import HomePage from './components/HomePage';
import AccountPage from './components/AccountPage';
import DangerZone from './components/DangerZone';
import AdminDashboard from './components/AdminDashboard';
import VideoTest from './components/VideoTest';
import CameraFeed from './components/CameraFeed';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/:nodeType" element={<HomePage />} /> {/* This will catch all node type routes */}
        <Route path="/account" element={<AccountPage />} />
        <Route path="/settings/advanced" element={<DangerZone />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/video-test" element={<VideoTest />} />
        <Route path="/camera" element={<CameraFeed />} />
      </Routes>
    </Router>
  );
}

export default App;
