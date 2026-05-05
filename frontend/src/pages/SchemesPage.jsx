import React, { useState, useEffect } from 'react';
import { aiAPI } from '../services/api';
import toast from 'react-hot-toast';

const STATIC_SCHEMES = [
  { name: 'PM-KISAN Samman Nidhi', nameHindi: 'पीएम किसान सम्मान निधि', amount: '₹6,000/year', benefit: 'किसानों को तीन किस्तों में ₹6000 सालाना', howToApply: 'pmkisan.gov.in पर ऑनलाइन आवेदन', icon: '💰', color: 'var(--green-400)' },
  { name: 'PM Fasal Bima Yojana', nameHindi: 'फसल बीमा योजना', amount: '2% premium', benefit: 'प्राकृतिक आपदा से फसल नुकसान पर मुआवजा', howToApply: 'pmfby.gov.in या बैंक शाखा', icon: '🛡', color: 'var(--sky-400)' },
  { name: 'Kisan Credit Card', nameHindi: 'किसान क्रेडिट कार्ड', amount: 'Up to ₹3 Lakh', benefit: 'सस्ती ब्याज पर खेती के लिए ऋण', howToApply: 'नजदीकी बैंक शाखा में आवेदन', icon: '💳', color: 'var(--earth-300)' },
  { name: 'Soil Health Card', nameHindi: 'मृदा स्वास्थ्य कार्ड', amount: 'Free', benefit: 'मिट्टी परीक्षण और खाद सलाह मुफ्त', howToApply: 'soilhealth.dac.gov.in', icon: '🌱', color: 'var(--green-400)' },
  { name: 'PM Kisan Maan Dhan', nameHindi: 'पीएम किसान मानधन', amount: '₹3,000/month pension', benefit: '60 वर्ष के बाद ₹3000 मासिक पेंशन', howToApply: 'maandhan.in या CSC केंद्र', icon: '👴', color: 'var(--earth-500)' },
  { name: 'e-NAM', nameHindi: 'राष्ट्रीय कृषि बाजार', amount: 'Better prices', benefit: 'ऑनलाइन मंडी से बेहतर दाम पाएं', howToApply: 'enam.gov.in पर रजिस्ट्रेशन', icon: '🏪', color: 'var(--sky-400)' },
];

export default function SchemesPage() {
  const [aiSchemes, setAiSchemes] = useState(null);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('static');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAISchemes = async () => {
    setLoading(true);
    try {
      const res = await aiAPI.getSchemes();
      setAiSchemes(res.data);
      setNews(res.data.news || []);
      setTab('ai');
      toast.success('AI ने आपके लिए योजनाएं ढूंढीं!');
    } catch (err) {
      toast.error('योजनाएं लाने में समस्या');
    } finally {
      setLoading(false);
    }
  };

  const filtered = STATIC_SCHEMES.filter(s =>
    !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.nameHindi.includes(searchQuery)
  );

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>🏛 सरकारी योजनाएं</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>किसानों के लिए केंद्र और राज्य सरकार की योजनाएं</p>
      </div>

      {/* AI Recommendation Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(22,163,74,0.15) 0%, rgba(15,37,16,0.9) 100%)',
        border: '1px solid var(--green-800)', borderRadius: 16, padding: '20px 24px', marginBottom: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12
      }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>🤖 AI आपके लिए योजनाएं खोजे</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            अपने प्रोफाइल के अनुसार सबसे उपयुक्त योजनाएं जानें
          </div>
        </div>
        <button className="btn btn-primary" onClick={fetchAISchemes} disabled={loading}>
          {loading ? <><span className="spinner">🔄</span> खोज रहे हैं...</> : '🔍 मेरे लिए योजनाएं खोजें'}
        </button>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'static' ? 'active' : ''}`} onClick={() => setTab('static')}>📋 सभी योजनाएं</button>
        <button className={`tab ${tab === 'ai' ? 'active' : ''}`} onClick={() => setTab('ai')}>🤖 AI सुझाव</button>
        <button className={`tab ${tab === 'news' ? 'active' : ''}`} onClick={() => setTab('news')}>📰 योजना समाचार</button>
      </div>

      {tab === 'static' && (
        <>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <input className="form-input" placeholder="🔍 योजना खोजें..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filtered.map((scheme, i) => (
              <div key={i} className="card" style={{ borderLeft: `3px solid ${scheme.color}` }}>
                <div className="flex-between" style={{ marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 24 }}>{scheme.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 15 }}>{scheme.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{scheme.nameHindi}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 800, color: scheme.color }}>{scheme.amount}</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 10 }}>
                  ✅ {scheme.benefit}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                  <span>📝 आवेदन:</span>
                  <span style={{ color: 'var(--sky-400)' }}>{scheme.howToApply}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'ai' && (
        <div>
          {!aiSchemes && (
            <div className="scanner-box">
              <div style={{ fontSize: 48 }}>🏛</div>
              <h3 style={{ color: 'var(--text-primary)', marginTop: 12 }}>AI सुझाव</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 8 }}>
                ऊपर बटन दबाएं — AI आपके प्रोफाइल के अनुसार योजनाएं सुझाएगा
              </p>
            </div>
          )}

          {aiSchemes?.schemes?.schemes?.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {aiSchemes.schemes.schemes.map((scheme, i) => (
                <div key={i} className="ai-response" style={{ marginBottom: 0 }}>
                  <div className="ai-label"><span className="ai-dot"></span> AI सुझाव</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>{scheme.name}</div>
                      {scheme.nameHindi && <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{scheme.nameHindi}</div>}
                    </div>
                    {scheme.amount && <span className="badge badge-green">💰 {scheme.amount}</span>}
                  </div>
                  {scheme.benefit && <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 8 }}>✅ {scheme.benefit}</p>}
                  {scheme.eligibility && <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>📋 पात्रता: {scheme.eligibility}</p>}
                  {scheme.howToApply && <p style={{ fontSize: 12, color: 'var(--sky-400)' }}>📝 आवेदन: {scheme.howToApply}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'news' && (
        <div className="grid-2">
          {news.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 32, gridColumn: '1/-1' }}>
              <button className="btn btn-primary" onClick={fetchAISchemes} disabled={loading}>
                {loading ? '...' : '📰 समाचार लोड करें'}
              </button>
            </div>
          ) : news.map((item, i) => (
            <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <div className="card" style={{ cursor: 'pointer' }}>
                <div style={{ fontSize: 12, color: 'var(--green-400)', fontWeight: 600, marginBottom: 6 }}>📰 SCHEME NEWS</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5 }}>{item.title}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>🔗 {item.url?.split('/')[2]}</div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}