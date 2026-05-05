import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { weatherAPI, cropAPI, aiAPI } from '../services/api';

const QuickAction = ({ icon, title, subtitle, to, color }) => (
  <Link to={to} style={{ textDecoration: 'none' }}>
    <div className="card" style={{ borderLeft: `3px solid ${color}`, cursor: 'pointer' }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{subtitle}</div>
    </div>
  </Link>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const [weather, setWeather] = useState(null);
  const [crops, setCrops] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [cropsRes, newsRes] = await Promise.all([
          cropAPI.getAll(),
          aiAPI.getNews().catch(() => ({ data: { results: [] } }))
        ]);
        setCrops(cropsRes.data);
        setNews(newsRes.data?.results?.slice(0, 4) || []);

        // Try to get weather by user location or city
        if (user?.location?.state) {
          weatherAPI.getCurrent({ city: `${user.location.district || user.location.state},India` })
            .then(res => setWeather(res.data))
            .catch(() => {});
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const activeCrops = crops.filter(c => c.status !== 'harvested');
  const alerts = crops.filter(c => c.weatherAlerts?.length > 0).length;

  return (
    <div>
      {/* Welcome banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f3d1a 0%, #1a5e2a 50%, #0f3d1a 100%)',
        borderRadius: 16, padding: '24px 28px', marginBottom: 24, position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', right: 20, top: -10, fontSize: 80, opacity: 0.15 }}>🌾</div>
        <div style={{ fontSize: 12, color: 'var(--green-200)', fontWeight: 600, marginBottom: 4 }}>
          {new Date().toLocaleDateString('hi-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'white', marginBottom: 6 }}>
          नमस्ते, {user?.name?.split(' ')[0]}! 🙏
        </h1>
        <p style={{ color: 'var(--green-200)', fontSize: 14 }}>
          {user?.location?.village ? `${user.location.village}, ` : ''}{user?.location?.district}, {user?.location?.state}
          {' · '} {user?.farmDetails?.landSize} एकड़ खेत
        </p>
        {weather && (
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>
              {weather.weather?.weather?.[0]?.main === 'Rain' ? '🌧' : weather.weather?.main?.temp > 35 ? '☀️' : '⛅'}
            </span>
            <span style={{ color: 'var(--green-100)', fontSize: 14 }}>
              {Math.round(weather.weather?.main?.temp || 0)}°C · {weather.weather?.weather?.[0]?.description}
            </span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">🌾</span>
          <div>
            <div className="stat-value">{activeCrops.length}</div>
            <div className="stat-label">चल रही फसलें</div>
            <div className="stat-change up">↑ Active Crops</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">⚠️</span>
          <div>
            <div className="stat-value" style={{ color: alerts > 0 ? 'var(--red-400)' : 'var(--green-400)' }}>{alerts}</div>
            <div className="stat-label">अलर्ट</div>
            <div className="stat-change" style={{ color: alerts > 0 ? 'var(--red-400)' : 'var(--green-400)' }}>
              {alerts > 0 ? '⚠ Attention needed' : '✓ All clear'}
            </div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🌡</span>
          <div>
            <div className="stat-value">{weather ? `${Math.round(weather.weather?.main?.temp || 0)}°` : '--'}</div>
            <div className="stat-label">तापमान</div>
            <div className="stat-change" style={{ color: 'var(--sky-400)' }}>💧 {weather?.weather?.main?.humidity || '--'}% humidity</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📊</span>
          <div>
            <div className="stat-value">{user?.farmDetails?.primaryCrops?.length || 0}</div>
            <div className="stat-label">फसल किस्में</div>
            <div className="stat-change up">🌱 Registered crops</div>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Quick Actions */}
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>
            ⚡ त्वरित सेवाएं
          </h2>
          <div className="grid-2" style={{ gap: 12 }}>
            <QuickAction icon="🔬" title="रोग पहचानें" subtitle="AI से निदान करें" to="/diagnose" color="var(--red-400)" />
            <QuickAction icon="🤖" title="AI से पूछें" subtitle="किसान मित्र से बात" to="/chat" color="var(--green-400)" />
            <QuickAction icon="📊" title="बाजार भाव" subtitle="MSP & मंडी दाम" to="/market" color="var(--earth-500)" />
            <QuickAction icon="🏛" title="सरकारी योजना" subtitle="PM-KISAN व अन्य" to="/schemes" color="var(--sky-400)" />
          </div>
        </div>

        {/* Active Crops */}
        <div>
          <div className="flex-between" style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>🌾 मेरी फसलें</h2>
            <Link to="/crops" className="btn btn-sm btn-secondary">सभी देखें</Link>
          </div>
          {activeCrops.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 32 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🌱</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>कोई फसल नहीं</div>
              <Link to="/crops" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>+ फसल जोड़ें</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {activeCrops.slice(0, 3).map(crop => (
                <div key={crop._id} className="card" style={{ padding: 14 }}>
                  <div className="flex-between">
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>{crop.cropName}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                        {crop.area} {crop.areaUnit} · {crop.variety || 'Standard'}
                      </div>
                    </div>
                    <span className={`badge badge-${crop.status === 'growing' ? 'green' : crop.status === 'harvesting' ? 'yellow' : 'blue'}`}>
                      {crop.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Agri News */}
      {news.length > 0 && (
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>
            📰 कृषि समाचार
          </h2>
          <div className="grid-2">
            {news.map((item, i) => (
              <a key={i} href={item.url} target="_blank" rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}>
                <div className="card" style={{ cursor: 'pointer' }}>
                  <div style={{ fontSize: 12, color: 'var(--green-400)', fontWeight: 600, marginBottom: 6 }}>📰 NEWS</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    {item.title?.slice(0, 80)}...
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 8 }}>{item.url?.split('/')[2]}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}