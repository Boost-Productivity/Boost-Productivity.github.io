import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { ReactFlowProvider } from '@xyflow/react';
import { useAuth } from './contexts/AuthContext';
import AccountPage from './components/AccountPage';
import MainFlow from './components/MainFlow';
import DangerZone from './components/DangerZone';
import AdminDashboard from './components/AdminDashboard';

function App() {
  return (
    <Router>
      <ReactFlowProvider>
        <Routes>
          <Route path="/" element={<MainFlow />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/settings/advanced" element={<DangerZone />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </ReactFlowProvider>
    </Router>
  );
}

export default App;
