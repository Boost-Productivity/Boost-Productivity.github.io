import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { ReactFlowProvider } from '@xyflow/react';
import { useAuth } from './contexts/AuthContext';
import AccountPage from './components/AccountPage';
import MainFlow from './components/MainFlow';
import DangerZone from './components/DangerZone';
import AdminDashboard from './components/AdminDashboard';
import VideoTest from './components/VideoTest';
import CameraFeed from './components/CameraFeed';

function App() {
  return (
    <Router>
      <ReactFlowProvider>
        <Routes>
          <Route path="/" element={<MainFlow />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/settings/advanced" element={<DangerZone />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/video-test" element={<VideoTest />} />
          <Route path="/camera" element={<CameraFeed />} />
        </Routes>
      </ReactFlowProvider>
    </Router>
  );
}

export default App;
