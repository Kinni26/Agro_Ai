import React, { useState, useEffect } from 'react';
import { communityAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CATEGORIES = ['all', 'query', 'tip', 'success', 'alert', 'market'];
const CAT_COLORS = { query: 'blue', tip: 'green', success: 'green', alert: 'red', market: 'yellow' };
const CAT_ICONS = { query: '❓', tip: '💡', success: '🏆', alert: '⚠️', market: '📊' };

const NewPostModal = ({ onClose, onSave }) => {
  const [form, setForm] = useState({ title: '', content: '', category: 'query', tags: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
      await communityAPI.createPost(data);
      toast.success('पोस्ट हो गई! AI जवाब आ रहा है...');
      onSave();
      onClose();
    } catch (err) {
      toast.error('Error creating post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}>
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 520 }}>
        <div className="flex-between" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>✍ नई पोस्ट</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">📋 श्रेणी</label>
            <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              <option value="query">❓ सवाल (Query)</option>
              <option value="tip">💡 टिप्स (Tip)</option>
              <option value="success">🏆 सफलता की कहानी</option>
              <option value="alert">⚠️ अलर्ट</option>
              <option value="market">📊 बाजार जानकारी</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">📝 शीर्षक</label>
            <input className="form-input" placeholder="आपका सवाल या विषय..." required
              value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">💬 विवरण</label>
            <textarea className="form-textarea" placeholder="विस्तार से लिखें..." required
              value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">🏷 टैग (comma separated)</label>
            <input className="form-input" placeholder="गेहूं, कीट, सलाह"
              value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
          </div>
          {form.category === 'query' && (
            <div className="alert alert-info" style={{ marginBottom: 12, fontSize: 12 }}>
              🤖 आपके सवाल का AI जवाब स्वचालित रूप से दिया जाएगा!
            </div>
          )}
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>रद्द</button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
              {loading ? <span className="spinner">🔄</span> : '📤 पोस्ट करें'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PostCard = ({ post, onLike, onComment, currentUserId }) => {
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const liked = post.likes?.includes(currentUserId);

  const handleComment = async () => {
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      await onComment(post._id, comment);
      setComment('');
      toast.success('टिप्पणी जोड़ी');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      {/* Header */}
      <div className="flex-between" style={{ marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, background: 'var(--green-800)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👨‍🌾</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{post.author?.name || 'किसान'}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{post.author?.location?.state} · {new Date(post.createdAt).toLocaleDateString('hi-IN')}</div>
          </div>
        </div>
        <span className={`badge badge-${CAT_COLORS[post.category] || 'blue'}`}>
          {CAT_ICONS[post.category]} {post.category}
        </span>
      </div>

      {/* Content */}
      <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{post.title}</h3>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>{post.content}</p>

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {post.tags.map(t => <span key={t} style={{ fontSize: 11, color: 'var(--green-400)', background: 'rgba(74,222,128,0.1)', padding: '2px 8px', borderRadius: 20 }}>#{t}</span>)}
        </div>
      )}

      {/* AI Answer */}
      {post.aiAnswer && (
        <div style={{ background: 'rgba(22,163,74,0.06)', border: '1px solid var(--green-900)', borderRadius: 10, padding: '12px 14px', marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--green-400)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="ai-dot"></span> AI KisaanMitra का जवाब
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {post.aiAnswer.slice(0, 300)}{post.aiAnswer.length > 300 ? '...' : ''}
          </p>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
        <button onClick={() => onLike(post._id)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: liked ? 'var(--green-400)' : 'var(--text-secondary)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
          {liked ? '❤️' : '🤍'} {post.likes?.length || 0}
        </button>
        <button onClick={() => setShowComments(!showComments)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
          💬 {post.comments?.length || 0}
        </button>
        {post.resolved && <span className="badge badge-green">✅ हल हुआ</span>}
      </div>

      {/* Comments */}
      {showComments && (
        <div style={{ marginTop: 12 }}>
          {post.comments?.slice(-3).map((c, i) => (
            <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>{c.author?.name || 'किसान'}:</strong> {c.content}
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <input className="form-input" style={{ flex: 1, padding: '6px 10px', fontSize: 13 }}
              placeholder="टिप्पणी लिखें..." value={comment}
              onChange={e => setComment(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleComment()} />
            <button className="btn btn-primary btn-sm" onClick={handleComment} disabled={submitting}>→</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function CommunityPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPosts = async (cat = category, pg = 1) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: 10 };
      if (cat !== 'all') params.category = cat;
      const res = await communityAPI.getPosts(params);
      setPosts(pg === 1 ? res.data.posts : [...posts, ...res.data.posts]);
      setTotalPages(res.data.pages);
    } catch (err) {
      toast.error('पोस्ट लोड नहीं हुई');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(category, 1); setPage(1); }, [category]);

  const handleLike = async (postId) => {
    try {
      await communityAPI.like(postId);
      fetchPosts(category, 1);
    } catch (e) {}
  };

  const handleComment = async (postId, content) => {
    await communityAPI.comment(postId, content);
    fetchPosts(category, 1);
  };

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>👥 किसान समुदाय</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>सवाल पूछें · टिप्स शेयर करें · AI से जवाब पाएं</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowNew(true)}>✍ पोस्ट करें</button>
      </div>

      <div className="tabs" style={{ marginBottom: 20 }}>
        {CATEGORIES.map(cat => (
          <button key={cat} className={`tab ${category === cat ? 'active' : ''}`} onClick={() => setCategory(cat)}>
            {cat === 'all' ? '📋 सभी' : `${CAT_ICONS[cat]} ${cat}`}
          </button>
        ))}
      </div>

      {loading && page === 1 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <span className="spinner" style={{ fontSize: 36 }}>👥</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {posts.map(post => (
            <PostCard key={post._id} post={post} onLike={handleLike} onComment={handleComment} currentUserId={user?._id} />
          ))}
          {posts.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: 48 }}>
              <div style={{ fontSize: 40 }}>💬</div>
              <div style={{ color: 'var(--text-secondary)', marginTop: 12 }}>अभी कोई पोस्ट नहीं</div>
              <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => setShowNew(true)}>पहली पोस्ट करें</button>
            </div>
          )}
          {page < totalPages && (
            <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => { setPage(p => p + 1); fetchPosts(category, page + 1); }}>
              और देखें
            </button>
          )}
        </div>
      )}

      {showNew && <NewPostModal onClose={() => setShowNew(false)} onSave={() => fetchPosts(category, 1)} />}
    </div>
  );
}