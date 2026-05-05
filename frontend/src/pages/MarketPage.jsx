import React, { useState, useEffect } from 'react';
import { marketAPI, aiAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import toast from 'react-hot-toast';

const MSP_CROPS = ['wheat','rice','maize','soybean','cotton','sugarcane','mustard','chickpea','sunflower','groundnut'];

export default function MarketPage() {
  const { user } = useAuth();
  const [mspData, setMspData] = useState({});
  const [selectedCrop, setSelectedCrop] = useState('');
  const [myPrice, setMyPrice] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [mandiData, setMandiData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mspLoading, setMspLoading] = useState(true);
  const [tab, setTab] = useState('msp');

  useEffect(() => {
    marketAPI.getMSP()
      .then(res => setMspData(res.data.msp || {}))
      .catch(() => {})
      .finally(() => setMspLoading(false));
  }, []);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!selectedCrop || !myPrice) return toast.error('फसल और दाम दर्ज करें');
    setLoading(true);
    setAnalysis(null);
    setMandiData([]);
    try {
      const [analysisRes, mandiRes] = await Promise.all([
        aiAPI.marketAnalysis({
          crop: selectedCrop,
          currentPrice: myPrice,
          season: new Date().getMonth() < 6 ? 'Rabi' : 'Kharif'
        }),
        marketAPI.getMandi(selectedCrop.toLowerCase(), user?.location?.state || 'India')
      ]);
      setAnalysis(analysisRes.data);
      setMandiData(mandiRes.data?.results || []);
      toast.success('विश्लेषण पूरा!');
    } catch (err) {
      toast.error('विश्लेषण में समस्या');
    } finally {
      setLoading(false);
    }
  };

  const mspChartData = Object.entries(mspData).map(([crop, data]) => ({
    crop: crop.charAt(0).toUpperCase() + crop.slice(1),
    msp: data.msp
  }));

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>📊 बाजार भाव</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>MSP, मंडी दाम और AI बाजार विश्लेषण</p>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'msp' ? 'active' : ''}`} onClick={() => setTab('msp')}>💰 MSP दाम</button>
        <button className={`tab ${tab === 'analysis' ? 'active' : ''}`} onClick={() => setTab('analysis')}>🤖 AI विश्लेषण</button>
        <button className={`tab ${tab === 'news' ? 'active' : ''}`} onClick={() => setTab('news')}>📰 मंडी समाचार</button>
      </div>

      {tab === 'msp' && (
        <div>
          {/* MSP Chart */}
          {!mspLoading && mspChartData.length > 0 && (
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-header">
                <h3 className="card-title">📊 MSP 2023-24 (₹/क्विंटल)</h3>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={mspChartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <XAxis dataKey="crop" tick={{ fontSize: 11, fill: '#86efac' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#86efac' }} />
                  <Tooltip
                    contentStyle={{ background: '#111f11', border: '1px solid #1e3a1e', borderRadius: 8, color: '#e8f5e9' }}
                    formatter={v => [`₹${v}`, 'MSP']} />
                  <Bar dataKey="msp" radius={[4, 4, 0, 0]}>
                    {mspChartData.map((_, i) => (
                      <Cell key={i} fill={i % 2 === 0 ? '#16a34a' : '#22c55e'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* MSP Grid */}
          <div className="grid-3">
            {Object.entries(mspData).map(([crop, data]) => (
              <div key={crop} className="price-card">
                <div style={{ fontSize: 20, marginBottom: 4 }}>
                  {crop === 'wheat' ? '🌾' : crop === 'rice' ? '🍚' : crop === 'cotton' ? '🌸' : crop === 'soybean' ? '🫘' : crop === 'mustard' ? '🌼' : '🌱'}
                </div>
                <div className="price-crop">{crop.charAt(0).toUpperCase() + crop.slice(1)}</div>
                <div className="price-msp">₹{data.msp.toLocaleString()}</div>
                <div className="price-unit">per {data.unit} · {data.season}</div>
              </div>
            ))}
          </div>

          <div className="alert alert-info" style={{ marginTop: 16 }}>
            ℹ️ MSP = Minimum Support Price (न्यूनतम समर्थन मूल्य) 2023-24 · सरकार द्वारा घोषित
          </div>
        </div>
      )}

      {tab === 'analysis' && (
        <div>
          <div className="grid-2">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">🤖 AI बाजार विश्लेषण</h3>
              </div>
              <form onSubmit={handleAnalyze}>
                <div className="form-group">
                  <label className="form-label">🌾 फसल का नाम</label>
                  <select className="form-select" value={selectedCrop} onChange={e => setSelectedCrop(e.target.value)} required>
                    <option value="">चुनें</option>
                    {MSP_CROPS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">💰 वर्तमान मंडी दाम (₹/क्विंटल)</label>
                  <input className="form-input" type="number" placeholder="जैसे: 2100" value={myPrice}
                    onChange={e => setMyPrice(e.target.value)} required />
                </div>
                {selectedCrop && mspData[selectedCrop] && (
                  <div className="alert alert-info" style={{ marginBottom: 12 }}>
                    📋 MSP: ₹{mspData[selectedCrop].msp}/क्विंटल
                    {parseFloat(myPrice) < mspData[selectedCrop].msp && myPrice && (
                      <span style={{ color: 'var(--red-400)', display: 'block', marginTop: 4 }}>
                        ⚠️ आपका दाम MSP से कम है! सरकारी खरीद केंद्र पर बेचें।
                      </span>
                    )}
                  </div>
                )}
                <button className="btn btn-primary" type="submit" disabled={loading}
                  style={{ width: '100%', justifyContent: 'center' }}>
                  {loading ? <><span className="spinner">🔄</span> विश्लेषण हो रहा है...</> : '📊 बाजार विश्लेषण करें'}
                </button>
              </form>
            </div>

            <div>
              {analysis && (
                <div className="ai-response">
                  <div className="ai-label"><span className="ai-dot"></span> AI बाजार रिपोर्ट</div>

                  <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                    <span className={`badge badge-${analysis.analysis?.trend === 'up' ? 'green' : analysis.analysis?.trend === 'down' ? 'red' : 'yellow'}`}>
                      {analysis.analysis?.trend === 'up' ? '📈 Upward' : analysis.analysis?.trend === 'down' ? '📉 Downward' : '➡ Stable'}
                    </span>
                    <span className={`badge badge-${analysis.analysis?.sellNow ? 'green' : 'yellow'}`}>
                      {analysis.analysis?.sellNow ? '✅ बेचने का सही समय' : '⏳ रुकें — दाम बढ़ेगा'}
                    </span>
                  </div>

                  {analysis.analysis?.analysis && (
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>
                      {analysis.analysis.analysis}
                    </p>
                  )}

                  {analysis.analysis?.expectedPrice30Days && (
                    <div style={{ padding: '10px 14px', background: 'rgba(74,222,128,0.08)', borderRadius: 8, marginBottom: 12 }}>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>30 दिन बाद संभावित दाम</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--green-400)' }}>
                        ₹{analysis.analysis.expectedPrice30Days}/क्विंटल
                      </div>
                    </div>
                  )}

                  {analysis.analysis?.recommendation && (
                    <div className="alert alert-success">
                      💡 {analysis.analysis.recommendation}
                    </div>
                  )}

                  {analysis.analysis?.bestMarkets?.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>🏪 बेहतर मंडियां</div>
                      {analysis.analysis.bestMarkets.map((m, i) => (
                        <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>📍 {m}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!analysis && !loading && (
                <div className="scanner-box">
                  <div style={{ fontSize: 48 }}>📊</div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 12 }}>फसल और दाम डालें — AI बाजार विश्लेषण पाएं</p>
                </div>
              )}

              {loading && (
                <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                  <span className="spinner" style={{ fontSize: 36 }}>📊</span>
                  <div style={{ color: 'var(--green-400)', marginTop: 12 }}>विश्लेषण हो रहा है...</div>
                </div>
              )}
            </div>
          </div>

          {/* Mandi Search Results */}
          {mandiData.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>🏪 मंडी समाचार ({user?.location?.state})</h3>
              <div className="grid-2">
                {mandiData.map((item, i) => (
                  <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <div className="card" style={{ cursor: 'pointer' }}>
                      <div style={{ fontSize: 12, color: 'var(--earth-300)', fontWeight: 600, marginBottom: 4 }}>🏪 मंडी भाव</div>
                      <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>{item.title?.slice(0, 100)}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'news' && (
        <MarketNewsTab />
      )}
    </div>
  );
}

function MarketNewsTab() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    marketAPI.getNews()
      .then(res => setNews(res.data?.results || []))
      .catch(() => setNews([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="card" style={{ textAlign: 'center', padding: 40 }}><span className="spinner" style={{ fontSize: 36 }}>📰</span></div>;

  return (
    <div className="grid-2">
      {news.map((item, i) => (
        <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer', height: '100%' }}>
            <div style={{ fontSize: 12, color: 'var(--earth-300)', fontWeight: 600, marginBottom: 6 }}>📰 MARKET NEWS</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: 8 }}>
              {item.title}
            </div>
            {item.content && (
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {item.content.slice(0, 120)}...
              </div>
            )}
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>🔗 {item.url?.split('/')[2]}</div>
          </div>
        </a>
      ))}
    </div>
  );
}