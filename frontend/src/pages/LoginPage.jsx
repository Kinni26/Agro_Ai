import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm] = useState({ phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.phone, form.password);
      toast.success('Welcome! Login successful!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">🌿</div>
          <div className="auth-logo-title">KisaanAI</div>
          <div className="auth-logo-subtitle">Kisaan ka AI Sathi - Smart Farming Platform</div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Mobile Number</label>
            <input className="form-input" type="tel" placeholder="10-digit mobile number"
              value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
              required maxLength={10} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="Enter password"
              value={form.password} onChange={e => setForm({...form, password: e.target.value})}
              required />
          </div>
          <button className="btn btn-primary btn-lg" type="submit" disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
            {loading ? <span className="spinner">...</span> : 'Login'}
          </button>
        </form>
        <div className="divider" />
        <div style={{ background: 'rgba(74,222,128,0.05)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 12, color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--green-400)' }}>Demo Account:</strong><br />
          Phone: <code style={{ color: 'var(--earth-300)' }}>9876543210</code> | Password: <code style={{ color: 'var(--earth-300)' }}>demo123</code>
        </div>
        <div className="auth-footer">
          New account? <Link to="/register" className="auth-link">Register here</Link>
        </div>
      </div>
    </div>
  );
}
