import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STATES = ['Madhya Pradesh','Uttar Pradesh','Maharashtra','Rajasthan','Punjab','Haryana','Gujarat','Bihar','Karnataka','Andhra Pradesh','Tamil Nadu','Telangana','West Bengal','Odisha','Chhattisgarh'];
const SOIL_TYPES = ['Black (काली)', 'Red (लाल)', 'Alluvial (जलोढ़)', 'Sandy (बलुई)', 'Loamy (दोमट)', 'Clay (चिकनी)'];
const CROPS = ['Wheat (गेहूं)', 'Rice (धान)', 'Maize (मक्का)', 'Soybean (सोयाबीन)', 'Cotton (कपास)', 'Sugarcane (गन्ना)', 'Mustard (सरसों)', 'Chickpea (चना)'];

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', phone: '', password: '',
    location: { state: '', district: '', village: '' },
    farmDetails: { landSize: '', soilType: '', primaryCrops: [], irrigationType: '' },
    language: 'hindi'
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const toggleCrop = (crop) => {
    const crops = form.farmDetails.primaryCrops;
    const updated = crops.includes(crop) ? crops.filter(c => c !== crop) : [...crops, crop];
    setForm({...form, farmDetails: {...form.farmDetails, primaryCrops: updated}});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('खाता बन गया! स्वागत है 🌾');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-card" style={{ maxWidth: 520 }}>
        <div className="auth-logo">
          <div className="auth-logo-icon">🌱</div>
          <div className="auth-logo-title">किसान पंजीकरण</div>
          <div className="auth-logo-subtitle">Step {step} of 3 — अपना प्रोफाइल बनाएं</div>
        </div>

        {/* Progress */}
        <div className="progress-bar" style={{ marginBottom: 24 }}>
          <div className="progress-fill" style={{ width: `${(step/3)*100}%` }} />
        </div>

        <form onSubmit={step === 3 ? handleSubmit : e => { e.preventDefault(); setStep(s => s+1); }}>
          {step === 1 && (
            <>
              <div className="form-group">
                <label className="form-label">👤 पूरा नाम</label>
                <input className="form-input" placeholder="Ram Kumar Sharma" required
                  value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">📱 मोबाइल नंबर</label>
                <input className="form-input" type="tel" placeholder="9876543210" required maxLength={10}
                  value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">🔒 पासवर्ड</label>
                <input className="form-input" type="password" placeholder="Min 6 characters" required minLength={6}
                  value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="form-group">
                <label className="form-label">🗺 राज्य</label>
                <select className="form-select" required
                  value={form.location.state} onChange={e => setForm({...form, location: {...form.location, state: e.target.value}})}>
                  <option value="">राज्य चुनें</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">🏘 जिला</label>
                <input className="form-input" placeholder="जिले का नाम" required
                  value={form.location.district} onChange={e => setForm({...form, location: {...form.location, district: e.target.value}})} />
              </div>
              <div className="form-group">
                <label className="form-label">🏡 गांव</label>
                <input className="form-input" placeholder="गांव का नाम"
                  value={form.location.village} onChange={e => setForm({...form, location: {...form.location, village: e.target.value}})} />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="grid-2" style={{ marginBottom: 16 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">🌱 जमीन (एकड़)</label>
                  <input className="form-input" type="number" placeholder="2.5"
                    value={form.farmDetails.landSize} onChange={e => setForm({...form, farmDetails: {...form.farmDetails, landSize: e.target.value}})} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">🌍 मिट्टी का प्रकार</label>
                  <select className="form-select"
                    value={form.farmDetails.soilType} onChange={e => setForm({...form, farmDetails: {...form.farmDetails, soilType: e.target.value}})}>
                    <option value="">चुनें</option>
                    {SOIL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">🌾 मुख्य फसलें (select all)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                  {CROPS.map(crop => (
                    <button key={crop} type="button"
                      onClick={() => toggleCrop(crop)}
                      style={{
                        padding: '6px 12px', borderRadius: 20, border: '1px solid',
                        borderColor: form.farmDetails.primaryCrops.includes(crop) ? 'var(--green-500)' : 'var(--border)',
                        background: form.farmDetails.primaryCrops.includes(crop) ? 'rgba(74,222,128,0.15)' : 'transparent',
                        color: form.farmDetails.primaryCrops.includes(crop) ? 'var(--green-400)' : 'var(--text-secondary)',
                        fontSize: 12, cursor: 'pointer'
                      }}>
                      {crop}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            {step > 1 && (
              <button type="button" className="btn btn-secondary" onClick={() => setStep(s => s-1)}>
                ← वापस
              </button>
            )}
            <button className="btn btn-primary" type="submit" disabled={loading}
              style={{ flex: 1, justifyContent: 'center' }}>
              {loading ? <span className="spinner">⏳</span> : step === 3 ? '✅ पंजीकरण करें' : 'आगे →'}
            </button>
          </div>
        </form>

        <div className="auth-footer">
          पहले से खाता है? <Link to="/login" className="auth-link">लॉगिन करें</Link>
        </div>
      </div>
    </div>
  );
}