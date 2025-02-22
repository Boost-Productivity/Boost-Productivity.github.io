import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import HomePage from './components/HomePage';
import AccountPage from './components/AccountPage';
import DangerZone from './components/DangerZone';
import AdminDashboard from './components/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/fields/:fieldId" element={<HomePage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/settings/advanced" element={<DangerZone />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
