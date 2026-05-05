import React, { useState, useEffect } from 'react';
import { cropAPI, aiAPI } from '../services/api';
import toast from 'react-hot-toast';

const CROP_LIST = ['Wheat/गेहूं','Rice/धान','Maize/मक्का','Soybean/सोयाबीन','Cotton/कपास','Sugarcane/गन्ना','Mustard/सरसों','Chickpea/चना','Tomato/टमाटर','Potato/आलू','Onion/प्याज'];
const STAGES = ['planned','sowing','growing','harvesting','harvested'];
const STATUS_COLORS = { planned: 'blue', sowing: 'yellow', growing: 'green', harvesting: 'yellow', harvested: 'green' };

const AddCropModal = ({ onClose, onSave }) => {
  const [form, setForm] = useState({ cropName: '', variety: '', area: '', areaUnit: 'acres', sowingDate: '', status: 'planned', soilHealth: { ph: '' } });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await cropAPI.add(form);
      toast.success('फसल जोड़ी गई! 🌱');
      onSave();
      onClose();
    } catch (err) {
      toast.error('Error adding crop');
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}>
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 480 }}>
        <div className="flex-between" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>🌱 नई फसल जोड़ें</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">🌾 फसल</label>
              <select className="form-select" required value={form.cropName} onChange={e => setForm({ ...form, cropName: e.target.value })}>
                <option value="">चुनें</option>
                {CROP_LIST.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">🌿 किस्म</label>
              <input className="form-input" placeholder="जैसे: HI-8498" value={form.variety} onChange={e => setForm({ ...form, variety: e.target.value })} />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">📐 क्षेत्रफल</label>
              <input className="form-input" type="number" placeholder="2.5" step="0.1" required value={form.area} onChange={e => setForm({ ...form, area: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">📏 इकाई</label>
              <select className="form-select" value={form.areaUnit} onChange={e => setForm({ ...form, areaUnit: e.target.value })}>
                <option value="acres">Acres</option>
                <option value="hectares">Hectares</option>
                <option value="bigha">Bigha</option>
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">📅 बुवाई तारीख</label>
              <input className="form-input" type="date" value={form.sowingDate} onChange={e => setForm({ ...form, sowingDate: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">📊 स्थिति</label>
              <select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">🧪 मिट्टी pH (वैकल्पिक)</label>
            <input className="form-input" type="number" step="0.1" min="0" max="14" placeholder="6.5-7.5 ideal"
              value={form.soilHealth.ph} onChange={e => setForm({ ...form, soilHealth: { ...form.soilHealth, ph: e.target.value } })} />
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>रद्द करें</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>✅ जोड़ें</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function CropsPage() {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [fertAdvice, setFertAdvice] = useState(null);
  const [adviceLoading, setAdviceLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchCrops = async () => {
    try {
      const res = await cropAPI.getAll();
      setCrops(res.data);
    } catch (e) {
      toast.error('Error loading crops');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCrops(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('क्या आप इस फसल को हटाना चाहते हैं?')) return;
    try {
      await cropAPI.delete(id);
      toast.success('फसल हटाई गई');
      fetchCrops();
      if (selectedCrop?._id === id) setSelectedCrop(null);
    } catch (e) {
      toast.error('Error deleting crop');
    }
  };

  const getFertilizerAdvice = async (crop) => {
    setAdviceLoading(true);
    setFertAdvice(null);
    try {
      const res = await aiAPI.fertilizerAdvice({
        cropName: crop.cropName,
        growthStage: crop.status,
        soilHealth: crop.soilHealth,
        area: crop.area
      });
      setFertAdvice(res.data);
    } catch (e) {
      toast.error('Error getting advice');
    } finally {
      setAdviceLoading(false);
    }
  };

  const filtered = filter === 'all' ? crops : crops.filter(c => c.status === filter);
  const daysSinceSowing = (date) => {
    if (!date) return null;
    return Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));
  };

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>🌾 मेरी फसलें</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>फसल प्रबंधन और AI सलाह</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ नई फसल जोड़ें</button>
      </div>

      {/* Filters */}
      <div className="tabs" style={{ marginBottom: 20 }}>
        {['all', ...STAGES].map(s => (
          <button key={s} className={`tab ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
            {s === 'all' ? '📋 सभी' : s}
          </button>
        ))}
      </div>

      <div className="grid-2">
        {/* Crop List */}
        <div>
          {loading ? (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <span className="spinner" style={{ fontSize: 32 }}>🌱</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🌿</div>
              <div style={{ color: 'var(--text-secondary)' }}>कोई फसल नहीं</div>
              <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => setShowAdd(true)}>+ जोड़ें</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filtered.map(crop => (
                <div key={crop._id} className="card"
                  style={{ cursor: 'pointer', borderColor: selectedCrop?._id === crop._id ? 'var(--green-600)' : 'var(--border)', transition: 'all 0.2s' }}
                  onClick={() => { setSelectedCrop(crop); setFertAdvice(null); }}>
                  <div className="flex-between">
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{crop.cropName}</span>
                        <span className={`badge badge-${STATUS_COLORS[crop.status] || 'blue'}`}>{crop.status}</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        📐 {crop.area} {crop.areaUnit}
                        {crop.variety && ` · 🌿 ${crop.variety}`}
                        {crop.sowingDate && ` · ⏱ ${daysSinceSowing(crop.sowingDate)} days`}
                      </div>
                    </div>
                    <button className="btn btn-sm btn-danger"
                      onClick={e => { e.stopPropagation(); handleDelete(crop._id); }}>🗑</button>
                  </div>

                  {/* Progress bar */}
                  {crop.status !== 'harvested' && (
                    <div className="progress-bar" style={{ marginTop: 10 }}>
                      <div className="progress-fill" style={{
                        width: `${STAGES.indexOf(crop.status) / (STAGES.length - 1) * 100}%`
                      }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail & Advice Panel */}
        <div>
          {selectedCrop ? (
            <div>
              <div className="card" style={{ marginBottom: 16 }}>
                <div className="card-header">
                  <h3 className="card-title">📋 {selectedCrop.cropName} — विवरण</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                  {[
                    ['किस्म', selectedCrop.variety || 'N/A'],
                    ['क्षेत्रफल', `${selectedCrop.area} ${selectedCrop.areaUnit}`],
                    ['स्थिति', selectedCrop.status],
                    ['बुवाई', selectedCrop.sowingDate ? new Date(selectedCrop.sowingDate).toLocaleDateString('hi-IN') : 'N/A'],
                    ['pH', selectedCrop.soilHealth?.ph || 'N/A'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex-between" style={{ padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{k}</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{v}</span>
                    </div>
                  ))}
                </div>

                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}
                  onClick={() => getFertilizerAdvice(selectedCrop)} disabled={adviceLoading}>
                  {adviceLoading ? <><span className="spinner">🔄</span> AI सलाह ला रहे हैं...</> : '🧪 खाद व सिंचाई सलाह पाएं'}
                </button>
              </div>

              {/* AI Fertilizer Advice */}
              {fertAdvice && (
                <div className="ai-response">
                  <div className="ai-label"><span className="ai-dot"></span> AI खाद सलाह</div>

                  {fertAdvice.fertilizers?.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>🧪 सुझाई खाद</div>
                      {fertAdvice.fertilizers.map((f, i) => (
                        <div key={i} style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, marginBottom: 6 }}>
                          <div style={{ fontWeight: 700, color: 'var(--green-400)', fontSize: 14 }}>{f.name} {f.nameHindi && `(${f.nameHindi})`}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                            📊 {f.quantity} {f.unit} · ⏰ {f.timing} · 💰 ~₹{f.cost}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>→ {f.method}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {fertAdvice.irrigationSchedule?.length > 0 && (
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--sky-400)', marginBottom: 8 }}>💧 सिंचाई कार्यक्रम</div>
                      {fertAdvice.irrigationSchedule.map((ir, i) => (
                        <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
                          🌱 <strong>{ir.stage}:</strong> {ir.frequency} · {ir.amount} · {ir.method}
                        </div>
                      ))}
                    </div>
                  )}

                  {fertAdvice.warnings?.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      {fertAdvice.warnings.map((w, i) => (
                        <div key={i} className="alert alert-warning" style={{ marginBottom: 6 }}>⚠️ {w}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="scanner-box">
              <div style={{ fontSize: 48 }}>🌾</div>
              <h3 style={{ color: 'var(--text-primary)', marginTop: 12, marginBottom: 8 }}>फसल चुनें</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>बायीं ओर से फसल पर क्लिक करें — AI से खाद और सिंचाई की सलाह पाएं</p>
            </div>
          )}
        </div>
      </div>

      {showAdd && <AddCropModal onClose={() => setShowAdd(false)} onSave={fetchCrops} />}
    </div>
  );
}