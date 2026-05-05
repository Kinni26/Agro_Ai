import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/common/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import DiagnosePage from './pages/DiagnosePage';
import WeatherPage from './pages/WeatherPage';
import CropsPage from './pages/CropsPage';
import MarketPage from './pages/MarketPage';
import ChatPage from './pages/ChatPage';
import SchemesPage from './pages/SchemesPage';
import CommunityPage from './pages/CommunityPage';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="loading-screen">
      <div className="loader-plant">Loading...</div>
      <p>KisaanAI Loading...</p>
    </div>
  );
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          style: { background: '#1a2e1a', color: '#a8e063', border: '1px solid #4ade80' }
        }} />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<DashboardPage />} />
            <Route path="diagnose" element={<DiagnosePage />} />
            <Route path="weather" element={<WeatherPage />} />
            <Route path="crops" element={<CropsPage />} />
            <Route path="market" element={<MarketPage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="schemes" element={<SchemesPage />} />
            <Route path="community" element={<CommunityPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
