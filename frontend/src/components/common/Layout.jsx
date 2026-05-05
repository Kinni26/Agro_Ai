import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { path: '/', icon: '🏠', label: 'डैशबोर्ड', labelEn: 'Dashboard' },
  { path: '/chat', icon: '🤖', label: 'AI सहायक', labelEn: 'AI Assistant', badge: 'AI' },
  { path: '/diagnose', icon: '🔬', label: 'रोग निदान', labelEn: 'Diagnose Disease' },
  { path: '/weather', icon: '🌤', label: 'मौसम', labelEn: 'Weather' },
  { path: '/crops', icon: '🌾', label: 'मेरी फसल', labelEn: 'My Crops' },
  { path: '/market', icon: '📊', label: 'बाजार भाव', labelEn: 'Market Prices' },
  { path: '/schemes', icon: '🏛', label: 'सरकारी योजना', labelEn: 'Govt Schemes' },
  { path: '/community', icon: '👥', label: 'समुदाय', labelEn: 'Community' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:99 }} />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <span className="logo-icon">🌿</span>
          <div>
            <div className="logo-text">KisaanAI</div>
            <div className="logo-sub">किसान का डिजिटल साथी</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card" onClick={handleLogout} title="Logout">
            <div className="user-avatar">👨‍🌾</div>
            <div>
              <div className="user-name">{user?.name || 'किसान भाई'}</div>
              <div className="user-role">{user?.location?.state || 'लॉगआउट करें'} · Logout</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ display: 'none', background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: 22, cursor: 'pointer' }}
              className="menu-toggle"
            >☰</button>
          </div>
          <div className="top-bar-actions">
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              🌱 नमस्ते, {user?.name?.split(' ')[0] || 'किसान'}!
            </span>
          </div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}