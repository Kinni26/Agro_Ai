import React, { useState, useEffect } from 'react';
import { weatherAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const WEATHER_ICONS = {
  '01d': '☀️', '01n': '🌙', '02d': '⛅', '02n': '🌤',
  '03d': '☁️', '03n': '☁️', '04d': '☁️', '04n': '☁️',
  '09d': '🌧', '09n': '🌧', '10d': '🌦', '10n': '🌧',
  '11d': '⛈', '11n': '⛈', '13d': '❄️', '13n': '❄️',
  '50d': '🌫', '50n': '🌫'
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function WeatherPage() {
  const { user } = useAuth();
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [farmingAdvice, setFarmingAdvice] = useState(null);
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState(user?.location?.district || '');
  const [searched, setSearched] = useState(false);

  const fetchWeather = async (searchCity) => {
    if (!searchCity) return toast.error('शहर का नाम दर्ज करें');
    setLoading(true);
    try {
      const [currRes, forecastRes] = await Promise.all([
        weatherAPI.getCurrent({ city: `${searchCity},India` }),
        weatherAPI.getCurrent({ city: `${searchCity},India` }) // placeholder; forecast needs coords
      ]);

      setWeather(currRes.data.weather);
      setRisks(currRes.data.risks || []);
      setSearched(true);

      // Get forecast with coordinates from current weather
      const { lat, lon } = currRes.data.weather.coord || {};
      if (lat && lon) {
        const fRes = await weatherAPI.getForecast({ lat, lon });
        setForecast(fRes.data.forecast || []);

        // Get AI farming advice
        const advRes = await weatherAPI.getFarmingAdvice({ weatherData: currRes.data.weather });
        setFarmingAdvice(advRes.data);
      }
    } catch (err) {
      toast.error('मौसम जानकारी नहीं मिली — शहर का नाम जाँचें');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.location?.district) {
      fetchWeather(user.location.district);
    }
  }, []);

  const getDayName = (dateStr) => {
    const d = new Date(dateStr);
    return DAY_NAMES[d.getDay()];
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>🌤 मौसम जानकारी</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
          7-दिन पूर्वानुमान + खेती सलाह
        </p>
      </div>

      {/* Search */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <input className="form-input" placeholder="शहर/जिले का नाम (जैसे: Bhopal, Indore, Nagpur)"
            value={city} onChange={e => setCity(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchWeather(city)}
            style={{ flex: 1 }} />
          <button className="btn btn-primary" onClick={() => fetchWeather(city)} disabled={loading}>
            {loading ? <span className="spinner">🔄</span> : '🔍'} खोजें
          </button>
        </div>
      </div>

      {loading && (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 48 }}>🌤</div>
          <div style={{ color: 'var(--green-400)', marginTop: 12 }}>मौसम जानकारी ला रहे हैं...</div>
        </div>
      )}

      {weather && !loading && (
        <>
          {/* Current Weather */}
          <div className="weather-card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ fontSize: 13, color: 'var(--green-200)', fontWeight: 600, marginBottom: 4 }}>📍 {weather.name}, {weather.sys?.country}</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
                  <div style={{ fontSize: 72, fontWeight: 800, color: 'white', lineHeight: 1 }}>
                    {Math.round(weather.main?.temp)}°
                  </div>
                  <div style={{ paddingBottom: 8 }}>
                    <div style={{ fontSize: 16, color: 'var(--green-200)', textTransform: 'capitalize' }}>
                      {weather.weather?.[0]?.description}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--green-300)', marginTop: 2 }}>
                      Feels like {Math.round(weather.main?.feels_like)}°C
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 80 }}>
                {WEATHER_ICONS[weather.weather?.[0]?.icon] || '🌡'}
              </div>
            </div>

            <div className="weather-details">
              <div className="weather-detail-item">
                <div className="weather-detail-value">💧 {weather.main?.humidity}%</div>
                <div className="weather-detail-label">नमी (Humidity)</div>
              </div>
              <div className="weather-detail-item">
                <div className="weather-detail-value">💨 {weather.wind?.speed} m/s</div>
                <div className="weather-detail-label">हवा (Wind)</div>
              </div>
              <div className="weather-detail-item">
                <div className="weather-detail-value">👁 {weather.visibility ? (weather.visibility/1000).toFixed(1) : '--'} km</div>
                <div className="weather-detail-label">दृश्यता (Visibility)</div>
              </div>
              <div className="weather-detail-item">
                <div className="weather-detail-value">🌡 {Math.round(weather.main?.temp_max)}°</div>
                <div className="weather-detail-label">अधिकतम (Max)</div>
              </div>
              <div className="weather-detail-item">
                <div className="weather-detail-value">🌡 {Math.round(weather.main?.temp_min)}°</div>
                <div className="weather-detail-label">न्यूनतम (Min)</div>
              </div>
              <div className="weather-detail-item">
                <div className="weather-detail-value">⬆ {weather.main?.pressure} hPa</div>
                <div className="weather-detail-label">वायुदाब (Pressure)</div>
              </div>
            </div>
          </div>

          {/* Weather Risks */}
          {risks.length > 0 && (
            <div style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {risks.map((risk, i) => (
                <div key={i} className={`alert alert-${risk.level === 'high' ? 'danger' : risk.level === 'medium' ? 'warning' : 'info'}`}>
                  <span>⚠️</span>
                  <div>
                    <strong>{risk.type?.toUpperCase()}</strong> — {risk.message}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="grid-2" style={{ marginBottom: 20 }}>
            {/* 7-Day Forecast */}
            {forecast.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">📅 7-दिन पूर्वानुमान</h3>
                </div>
                <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
                  {forecast.map((day, i) => (
                    <div key={i} className="forecast-day">
                      <div className="forecast-day-name">{getDayName(day.date)}</div>
                      <div className="forecast-icon">{WEATHER_ICONS['10d'] || '🌡'}</div>
                      <div className="forecast-temp-max">{day.maxTemp}°</div>
                      <div className="forecast-temp-min">{day.minTemp}°</div>
                      {parseFloat(day.rain) > 0 && (
                        <div className="forecast-rain">💧 {day.rain}mm</div>
                      )}
                      <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 4 }}>
                        💧{day.avgHumidity}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sunrise/Sunset */}
            <div className="card">
              <div className="card-header"><h3 className="card-title">🌅 दिन की जानकारी</h3></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>🌅 सूर्योदय</span>
                  <span style={{ fontWeight: 700, color: 'var(--earth-300)' }}>
                    {weather.sys?.sunrise ? new Date(weather.sys.sunrise * 1000).toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }) : '--'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>🌇 सूर्यास्त</span>
                  <span style={{ fontWeight: 700, color: 'var(--earth-500)' }}>
                    {weather.sys?.sunset ? new Date(weather.sys.sunset * 1000).toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }) : '--'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>☁️ बादल</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{weather.clouds?.all}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Farming Advice */}
          {farmingAdvice && (
            <div className="ai-response">
              <div className="ai-label"><span className="ai-dot"></span> AI खेती सलाह</div>

              {farmingAdvice.alerts?.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>⚠️ मौसम आधारित अलर्ट</div>
                  {farmingAdvice.alerts.map((alert, i) => (
                    <div key={i} style={{
                      display: 'flex', gap: 10, padding: '8px 12px', marginBottom: 6, borderRadius: 8,
                      background: alert.severity === 'high' ? 'rgba(239,68,68,0.1)' : alert.severity === 'medium' ? 'rgba(245,158,11,0.1)' : 'rgba(74,222,128,0.1)',
                      border: `1px solid ${alert.severity === 'high' ? 'rgba(239,68,68,0.3)' : alert.severity === 'medium' ? 'rgba(245,158,11,0.3)' : 'rgba(74,222,128,0.3)'}`
                    }}>
                      <span>{alert.severity === 'high' ? '🔴' : alert.severity === 'medium' ? '🟡' : '🟢'}</span>
                      <div>
                        <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{alert.message}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>→ {alert.action}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {farmingAdvice.bestTimeForActivities && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>⏰ आज के लिए सही समय</div>
                  <div className="grid-2" style={{ gap: 10 }}>
                    {Object.entries(farmingAdvice.bestTimeForActivities).map(([act, time]) => (
                      <div key={act} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 8 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>{act.toUpperCase()}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--green-400)' }}>{time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {!searched && !loading && (
        <div className="scanner-box">
          <div className="scanner-icon">🌤</div>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>मौसम जानकारी</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>अपने जिले का नाम डालें और 7-दिन का मौसम पूर्वानुमान पाएं</p>
        </div>
      )}
    </div>
  );
}