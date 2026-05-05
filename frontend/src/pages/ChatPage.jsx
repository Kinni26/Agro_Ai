import React, { useState, useRef, useEffect } from 'react';
import { aiAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const QUICK_QUESTIONS = [
  '🌾 गेहूं में कौन सी खाद डालें?',
  '💧 ड्रिप इरिगेशन के फायदे क्या हैं?',
  '🐛 फसल में कीट से कैसे बचाएं?',
  '📊 PM-KISAN योजना क्या है?',
  '🌧 बेमौसम बारिश से फसल कैसे बचाएं?',
  '🧪 मिट्टी परीक्षण कैसे करें?',
  '💰 फसल बीमा कैसे करें?',
  '🌱 जैविक खेती कैसे शुरू करें?'
];

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: `नमस्ते ${user?.name?.split(' ')[0] || 'किसान भाई'}! 🙏\n\nमैं KisaanMitra हूं — आपका AI कृषि सहायक।\n\n• फसल रोग और कीट\n• खाद और सिंचाई\n• बाजार भाव\n• सरकारी योजनाएं\n• मौसम सलाह\n\nकोई भी सवाल पूछें! मैं हिंदी और English दोनों में जवाब दे सकता हूं। 🌿`,
      time: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');

    const userMsg = { role: 'user', content: msg, time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages.slice(-6).map(m => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.content
      }));

      const res = await aiAPI.chat({ message: msg, history });
      setMessages(prev => [...prev, {
        role: 'ai',
        content: res.data.response,
        time: new Date()
      }]);
    } catch (err) {
      toast.error('जवाब देने में समस्या आई');
      setMessages(prev => [...prev, {
        role: 'ai',
        content: 'माफ करें, अभी जवाब देने में समस्या है। कृपया थोड़ी देर बाद कोशिश करें।',
        time: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (t) => new Date(t).toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>🤖 KisaanMitra AI</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>आपका 24/7 कृषि सहायक — कोई भी सवाल पूछें</p>
      </div>

      <div style={{ display: 'flex', gap: 20, height: 'calc(100vh - 200px)' }}>
        {/* Chat Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.role === 'user' ? 'user' : 'ai'}`}>
                {msg.role === 'ai' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 28, height: 28, background: 'var(--green-800)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🌿</div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--green-400)' }}>KisaanMitra</span>
                  </div>
                )}
                <div className="message-bubble" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                  {msg.content}
                </div>
                <div className="message-time">{formatTime(msg.time)}</div>
              </div>
            ))}

            {loading && (
              <div className="message ai">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 28, height: 28, background: 'var(--green-800)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🌿</div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--green-400)' }}>KisaanMitra</span>
                </div>
                <div className="message-bubble">
                  <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <span style={{ animation: 'bounce 0.8s infinite 0s' }}>●</span>
                    <span style={{ animation: 'bounce 0.8s infinite 0.2s' }}>●</span>
                    <span style={{ animation: 'bounce 0.8s infinite 0.4s' }}>●</span>
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chat-input-area">
            <textarea
              className="chat-input"
              placeholder="कोई भी कृषि सवाल पूछें... (Enter to send)"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={loading}
            />
            <button className="btn btn-primary" onClick={() => sendMessage()} disabled={loading || !input.trim()}
              style={{ height: 44, padding: '0 16px', flexShrink: 0 }}>
              {loading ? <span className="spinner">⏳</span> : '➤'}
            </button>
          </div>
        </div>

        {/* Quick Questions Sidebar */}
        <div style={{ width: 220, flexShrink: 0 }}>
          <div className="card" style={{ position: 'sticky', top: 80 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>⚡ जल्दी पूछें</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {QUICK_QUESTIONS.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q.replace(/^[^\s]+\s/, ''))}
                  disabled={loading}
                  style={{
                    textAlign: 'left', padding: '8px 10px', background: 'var(--bg-primary)',
                    border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-secondary)',
                    fontSize: 12, cursor: 'pointer', transition: 'all 0.2s', lineHeight: 1.4
                  }}
                  onMouseEnter={e => { e.target.style.borderColor = 'var(--green-600)'; e.target.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-secondary)'; }}
                >
                  {q}
                </button>
              ))}
            </div>

            <div className="divider" />
            <button onClick={() => setMessages([messages[0]])} className="btn btn-sm btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
              🗑 बातचीत साफ करें
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}