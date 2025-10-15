import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Chatbots from './pages/Chatbots';
import Train from './pages/Train';
import Settings from './pages/Settings';
import Billing from './pages/Billing';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import ConnectionTest from './pages/ConnectionTest';
import TestChat from './pages/TestChat';
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="chatbots" element={<Chatbots />} />
          <Route path="train" element={<Train />} />
          <Route path="test-chat" element={<TestChat />} />
          <Route path="settings" element={<Settings />} />
          <Route path="billing" element={<Billing />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="profile" element={<Profile />} />
          <Route path="test" element={<ConnectionTest />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
