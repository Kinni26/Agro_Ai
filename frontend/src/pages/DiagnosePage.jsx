// import React, { useState } from 'react';
// import { aiAPI } from '../services/api';
// import toast from 'react-hot-toast';

// const CROPS = ['Wheat/गेहूं','Rice/धान','Maize/मक्का','Tomato/टमाटर','Cotton/कपास','Soybean/सोयाबीन','Potato/आलू','Onion/प्याज','Mustard/सरसों','Chickpea/चना'];
// const SYMPTOMS = [
//   'पत्तियां पीली हो रही हैं (Yellow leaves)',
//   'पत्तियों पर धब्बे हैं (Spots on leaves)',
//   'पौधा मुरझा रहा है (Wilting)',
//   'तने पर काले धब्बे (Black stem spots)',
//   'फल/अनाज सड़ रहा है (Fruit/grain rot)',
//   'पत्तियों पर सफेद पाउडर (White powder)',
//   'जड़ें सड़ रही हैं (Root rot)',
//   'पौधे की बढ़वार रुक गई (Stunted growth)',
//   'कीट दिख रहे हैं (Insects visible)',
//   'पत्तियां मुड़ रही हैं (Leaf curling)'
// ];

// const SeverityBar = ({ level }) => {
//   const colors = { low: 'var(--green-400)', medium: 'var(--earth-300)', high: 'var(--red-400)' };
//   const widths = { low: '33%', medium: '66%', high: '100%' };
//   return (
//     <div>
//       <div className="flex-between" style={{ marginBottom: 4 }}>
//         <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Severity</span>
//         <span style={{ fontSize: 12, fontWeight: 700, color: colors[level] }}>{level?.toUpperCase()}</span>
//       </div>
//       <div className="progress-bar">
//         <div className="progress-fill" style={{ width: widths[level] || '50%', background: colors[level] }} />
//       </div>
//     </div>
//   );
// };

// export default function DiagnosePage() {
//   const [form, setForm] = useState({ cropName: '', symptoms: '', location: '' });
//   const [selectedSymptoms, setSelectedSymptoms] = useState([]);
//   const [result, setResult] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [tab, setTab] = useState('text');

//   const toggleSymptom = (s) => {
//     const updated = selectedSymptoms.includes(s)
//       ? selectedSymptoms.filter(x => x !== s)
//       : [...selectedSymptoms, s];
//     setSelectedSymptoms(updated);
//     setForm(f => ({ ...f, symptoms: updated.join('; ') + (f.symptoms.replace(selectedSymptoms.join('; '), '').trim() ? '\n' + f.symptoms.replace(selectedSymptoms.join('; '), '').trim() : '') }));
//   };

//   const handleDiagnose = async (e) => {
//     e.preventDefault();
//     if (!form.cropName || !form.symptoms) return toast.error('फसल और लक्षण बताएं');
//     setLoading(true);
//     setResult(null);
//     try {
//       const res = await aiAPI.diagnose(form);
//       setResult(res.data);
//       toast.success('निदान हो गया! ✅');
//     } catch (err) {
//       toast.error('Error: ' + (err.response?.data?.message || 'Please try again'));
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div>
//       <div style={{ marginBottom: 24 }}>
//         <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>🔬 फसल रोग निदान</h1>
//         <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
//           AI-powered crop disease diagnosis — लक्षण बताएं, इलाज पाएं
//         </p>
//       </div>

//       <div className="grid-2">
//         {/* Input Panel */}
//         <div>
//           <div className="card">
//             <div className="card-header">
//               <h3 className="card-title">📋 लक्षण दर्ज करें</h3>
//             </div>

//             <div className="tabs">
//               <button className={`tab ${tab === 'text' ? 'active' : ''}`} onClick={() => setTab('text')}>✍ Text Input</button>
//               <button className={`tab ${tab === 'quick' ? 'active' : ''}`} onClick={() => setTab('quick')}>⚡ Quick Select</button>
//             </div>

//             <form onSubmit={handleDiagnose}>
//               <div className="form-group">
//                 <label className="form-label">🌾 फसल का नाम</label>
//                 <select className="form-select" value={form.cropName}
//                   onChange={e => setForm({ ...form, cropName: e.target.value })} required>
//                   <option value="">फसल चुनें</option>
//                   {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
//                 </select>
//               </div>

//               {tab === 'quick' && (
//                 <div className="form-group">
//                   <label className="form-label">लक्षण चुनें (एक या अधिक)</label>
//                   <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
//                     {SYMPTOMS.map(s => (
//                       <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '6px 10px', borderRadius: 8, background: selectedSymptoms.includes(s) ? 'rgba(74,222,128,0.1)' : 'transparent', border: `1px solid ${selectedSymptoms.includes(s) ? 'var(--green-600)' : 'transparent'}`, transition: 'all 0.2s' }}>
//                         <input type="checkbox" checked={selectedSymptoms.includes(s)} onChange={() => toggleSymptom(s)} style={{ accentColor: 'var(--green-500)' }} />
//                         <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{s}</span>
//                       </label>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               <div className="form-group">
//                 <label className="form-label">📝 विस्तृत लक्षण</label>
//                 <textarea className="form-textarea"
//                   placeholder="जैसे: 10 दिन पहले से पत्तियां पीली पड़ रही हैं, किनारों से शुरू होकर बीच तक आ रही है..."
//                   value={form.symptoms}
//                   onChange={e => setForm({ ...form, symptoms: e.target.value })}
//                   required />
//               </div>

//               <div className="form-group">
//                 <label className="form-label">📍 स्थान (वैकल्पिक)</label>
//                 <input className="form-input" placeholder="जैसे: Vidisha, Madhya Pradesh"
//                   value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
//               </div>

//               <button className="btn btn-primary" type="submit" disabled={loading}
//                 style={{ width: '100%', justifyContent: 'center' }}>
//                 {loading ? <><span className="spinner">🔄</span> AI विश्लेषण हो रहा है...</> : '🔬 निदान करें'}
//               </button>
//             </form>
//           </div>
//         </div>

//         {/* Result Panel */}
//         <div>
//           {loading && (
//             <div className="card" style={{ textAlign: 'center', padding: 48 }}>
//               <div style={{ fontSize: 48, marginBottom: 16 }}>🤖</div>
//               <div style={{ color: 'var(--green-400)', fontWeight: 600 }}>AI विश्लेषण कर रहा है...</div>
//               <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 8 }}>कृपया प्रतीक्षा करें</div>
//               <div className="progress-bar" style={{ marginTop: 16 }}>
//                 <div className="progress-fill" style={{ width: '70%' }} />
//               </div>
//             </div>
//           )}

//           {result && result.diagnosis && (
//             <div>
//               <div className="ai-response">
//                 <div className="ai-label"><span className="ai-dot"></span> AI निदान परिणाम</div>

//                 <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
//                   🦠 {result.diagnosis.disease || 'Disease Detected'}
//                 </h2>

//                 {result.diagnosis.confidence && (
//                   <div className="flex gap-8 mt-8">
//                     <span className="badge badge-green">✓ {result.diagnosis.confidence} confidence</span>
//                     {result.diagnosis.urgency && (
//                       <span className={`badge badge-${result.diagnosis.urgency === 'high' ? 'red' : result.diagnosis.urgency === 'medium' ? 'yellow' : 'green'}`}>
//                         ⏰ {result.diagnosis.urgency} urgency
//                       </span>
//                     )}
//                   </div>
//                 )}

//                 {result.diagnosis.severity && (
//                   <div style={{ marginTop: 16 }}>
//                     <SeverityBar level={result.diagnosis.severity} />
//                   </div>
//                 )}
//               </div>

//               {result.diagnosis.causes && (
//                 <div className="card" style={{ marginTop: 16 }}>
//                   <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>🔍 कारण</h3>
//                   <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
//                     {Array.isArray(result.diagnosis.causes) ? result.diagnosis.causes.join(' · ') : result.diagnosis.causes}
//                   </p>
//                 </div>
//               )}

//               {result.diagnosis.treatment && (
//                 <div className="card" style={{ marginTop: 16, borderColor: 'var(--green-800)' }}>
//                   <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--green-400)', marginBottom: 10 }}>💊 उपचार</h3>
//                   <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
//                     {Array.isArray(result.diagnosis.treatment)
//                       ? result.diagnosis.treatment.map((t, i) => (
//                         <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
//                           <span style={{ color: 'var(--green-400)' }}>→</span> {t}
//                         </div>
//                       ))
//                       : result.diagnosis.treatment}
//                   </div>
//                 </div>
//               )}

//               {result.diagnosis.prevention && (
//                 <div className="card" style={{ marginTop: 16 }}>
//                   <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--earth-300)', marginBottom: 10 }}>🛡 रोकथाम</h3>
//                   <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
//                     {Array.isArray(result.diagnosis.prevention)
//                       ? result.diagnosis.prevention.map((p, i) => <div key={i}>• {p}</div>)
//                       : result.diagnosis.prevention}
//                   </div>
//                 </div>
//               )}

//               {result.relatedAlerts?.length > 0 && (
//                 <div className="card" style={{ marginTop: 16 }}>
//                   <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--sky-400)', marginBottom: 10 }}>📰 संबंधित अलर्ट</h3>
//                   {result.relatedAlerts.map((a, i) => (
//                     <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
//                       • <a href={a.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--sky-400)' }}>{a.title?.slice(0, 80)}</a>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           )}

//           {!loading && !result && (
//             <div className="scanner-box">
//               <div className="scanner-icon">🔬</div>
//               <h3 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>रोग निदान</h3>
//               <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
//                 फसल का नाम और लक्षण भरें, AI तुरंत निदान और इलाज बताएगा
//               </p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }





import React, { useState } from 'react';
import { aiAPI } from '../services/api';
import toast from 'react-hot-toast';

const CROPS = ['Wheat','Rice','Maize','Tomato','Cotton','Soybean','Potato','Onion','Mustard','Chickpea'];
const SYMPTOMS = [
  'Yellow leaves',
  'Spots on leaves',
  'Wilting plant',
  'Black stem spots',
  'Fruit/grain rot',
  'White powder on leaves',
  'Root rot',
  'Stunted growth',
  'Insects visible',
  'Leaf curling'
];

const SeverityBar = ({ level }) => {
  const colors = { low: 'var(--green-400)', medium: 'var(--earth-300)', high: 'var(--red-400)' };
  const widths = { low: '33%', medium: '66%', high: '100%' };
  return (
    <div>
      <div className="flex-between" style={{ marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Severity</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: colors[level] }}>{level?.toUpperCase()}</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: widths[level] || '50%', background: colors[level] }} />
      </div>
    </div>
  );
};

const renderValue = (val) => {
  if (!val) return null;
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) return val.join(', ');
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
};

const renderList = (val) => {
  if (!val) return null;
  if (typeof val === 'string') return <div>{val}</div>;
  if (Array.isArray(val)) return val.map((item, i) => (
    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
      <span style={{ color: 'var(--green-400)' }}>→</span>
      <span>{typeof item === 'object' ? JSON.stringify(item) : item}</span>
    </div>
  ));
  if (typeof val === 'object') return Object.entries(val).map(([k, v], i) => (
    <div key={i} style={{ marginBottom: 4 }}>
      <strong style={{ color: 'var(--green-400)' }}>{k}:</strong> {typeof v === 'object' ? JSON.stringify(v) : v}
    </div>
  ));
  return <div>{String(val)}</div>;
};

export default function DiagnosePage() {
  const [form, setForm] = useState({ cropName: '', symptoms: '', location: '' });
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('text');

  const toggleSymptom = (s) => {
    const updated = selectedSymptoms.includes(s)
      ? selectedSymptoms.filter(x => x !== s)
      : [...selectedSymptoms, s];
    setSelectedSymptoms(updated);
    setForm(f => ({ ...f, symptoms: updated.join('; ') }));
  };

  const handleDiagnose = async (e) => {
    e.preventDefault();
    if (!form.cropName || !form.symptoms) return toast.error('Please enter crop and symptoms');
    setLoading(true);
    setResult(null);
    try {
      const res = await aiAPI.diagnose(form);
      setResult(res.data);
      toast.success('Diagnosis complete!');
    } catch (err) {
      toast.error('Error: ' + (err.response?.data?.message || 'Please try again'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>Crop Disease Diagnosis</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>AI-powered crop disease diagnosis</p>
      </div>

      <div className="grid-2">
        <div>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Enter Symptoms</h3>
            </div>
            <div className="tabs">
              <button className={`tab ${tab === 'text' ? 'active' : ''}`} onClick={() => setTab('text')}>Text Input</button>
              <button className={`tab ${tab === 'quick' ? 'active' : ''}`} onClick={() => setTab('quick')}>Quick Select</button>
            </div>
            <form onSubmit={handleDiagnose}>
              <div className="form-group">
                <label className="form-label">Crop Name</label>
                <select className="form-select" value={form.cropName}
                  onChange={e => setForm({ ...form, cropName: e.target.value })} required>
                  <option value="">Select crop</option>
                  {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {tab === 'quick' && (
                <div className="form-group">
                  <label className="form-label">Select Symptoms</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {SYMPTOMS.map(s => (
                      <label key={s} style={{
                        display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                        padding: '6px 10px', borderRadius: 8,
                        background: selectedSymptoms.includes(s) ? 'rgba(74,222,128,0.1)' : 'transparent',
                        border: `1px solid ${selectedSymptoms.includes(s) ? 'var(--green-600)' : 'transparent'}`,
                      }}>
                        <input type="checkbox" checked={selectedSymptoms.includes(s)}
                          onChange={() => toggleSymptom(s)} style={{ accentColor: 'var(--green-500)' }} />
                        <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{s}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Describe Symptoms in Detail</label>
                <textarea className="form-textarea"
                  placeholder="e.g. Leaves turning yellow from bottom, started 10 days ago..."
                  value={form.symptoms}
                  onChange={e => setForm({ ...form, symptoms: e.target.value })}
                  required />
              </div>
              <div className="form-group">
                <label className="form-label">Location (optional)</label>
                <input className="form-input" placeholder="e.g. Bhopal, Madhya Pradesh"
                  value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
              </div>
              <button className="btn btn-primary" type="submit" disabled={loading}
                style={{ width: '100%', justifyContent: 'center' }}>
                {loading ? <><span className="spinner">...</span> AI Analyzing...</> : 'Diagnose Disease'}
              </button>
            </form>
          </div>
        </div>

        <div>
          {loading && (
            <div className="card" style={{ textAlign: 'center', padding: 48 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🤖</div>
              <div style={{ color: 'var(--green-400)', fontWeight: 600 }}>AI is analyzing...</div>
              <div className="progress-bar" style={{ marginTop: 16 }}>
                <div className="progress-fill" style={{ width: '70%' }} />
              </div>
            </div>
          )}

          {result && result.diagnosis && (
            <div>
              <div className="ai-response">
                <div className="ai-label"><span className="ai-dot"></span> AI Diagnosis Result</div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                  {renderValue(result.diagnosis.disease) || 'Disease Detected'}
                </h2>
                <div className="flex gap-8 mt-8">
                  {result.diagnosis.confidence && (
                    <span className="badge badge-green">Confidence: {renderValue(result.diagnosis.confidence)}</span>
                  )}
                  {result.diagnosis.urgency && (
                    <span className={`badge badge-${result.diagnosis.urgency === 'high' ? 'red' : 'yellow'}`}>
                      Urgency: {renderValue(result.diagnosis.urgency)}
                    </span>
                  )}
                </div>
                {result.diagnosis.severity && (
                  <div style={{ marginTop: 16 }}>
                    <SeverityBar level={typeof result.diagnosis.severity === 'string' ? result.diagnosis.severity : 'medium'} />
                  </div>
                )}
              </div>

              {result.diagnosis.causes && (
                <div className="card" style={{ marginTop: 16 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>Causes</h3>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {renderList(result.diagnosis.causes)}
                  </div>
                </div>
              )}

              {result.diagnosis.treatment && (
                <div className="card" style={{ marginTop: 16, borderColor: 'var(--green-800)' }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--green-400)', marginBottom: 10 }}>Treatment</h3>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                    {renderList(result.diagnosis.treatment)}
                  </div>
                </div>
              )}

              {result.diagnosis.prevention && (
                <div className="card" style={{ marginTop: 16 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--earth-300)', marginBottom: 10 }}>Prevention</h3>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                    {renderList(result.diagnosis.prevention)}
                  </div>
                </div>
              )}

              {result.relatedAlerts?.length > 0 && (
                <div className="card" style={{ marginTop: 16 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--sky-400)', marginBottom: 10 }}>Related Alerts</h3>
                  {result.relatedAlerts.map((a, i) => (
                    <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
                      <a href={a.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--sky-400)' }}>
                        {a.title?.slice(0, 80)}
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!loading && !result && (
            <div className="scanner-box">
              <div className="scanner-icon">🔬</div>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>Disease Diagnosis</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                Enter crop name and symptoms — AI will diagnose and provide treatment
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}