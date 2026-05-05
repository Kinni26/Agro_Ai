import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: data => api.post('/auth/register', data),
  login: data => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: data => api.put('/auth/profile', data)
};

export const aiAPI = {
  diagnose: data => api.post('/ai/diagnose', data),
  recommendCrops: data => api.post('/ai/recommend-crops', data),
  fertilizerAdvice: data => api.post('/ai/fertilizer-advice', data),
  marketAnalysis: data => api.post('/ai/market-analysis', data),
  chat: data => api.post('/ai/chat', data),
  getSchemes: () => api.get('/ai/schemes'),
  getNews: (topic) => api.get(`/ai/news${topic ? `?topic=${topic}` : ''}`)
};

export const weatherAPI = {
  getCurrent: params => api.get('/weather/current', { params }),
  getForecast: params => api.get('/weather/forecast', { params }),
  getFarmingAdvice: data => api.post('/weather/farming-advice', data)
};

export const cropAPI = {
  getAll: () => api.get('/crops'),
  add: data => api.post('/crops', data),
  update: (id, data) => api.put(`/crops/${id}`, data),
  delete: id => api.delete(`/crops/${id}`)
};

export const marketAPI = {
  getMSP: () => api.get('/market/msp'),
  getMandi: (crop, state) => api.get(`/market/mandi/${crop}`, { params: { state } }),
  getNews: () => api.get('/market/news')
};

export const communityAPI = {
  getPosts: params => api.get('/community', { params }),
  createPost: data => api.post('/community', data),
  like: id => api.put(`/community/${id}/like`),
  comment: (id, content) => api.post(`/community/${id}/comment`, { content })
};

export default api;