import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('aquawatch_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('aquawatch_token');
      localStorage.removeItem('aquawatch_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
};

export const waterTestAPI = {
  create: (data) => api.post('/water-tests', data),
  getAll: (params) => api.get('/water-tests', { params }),
  getById: (id) => api.get(`/water-tests/${id}`),
  update: (id, data) => api.put(`/water-tests/${id}`, data),
  delete: (id) => api.delete(`/water-tests/${id}`),
  getTrends: (params) => api.get('/water-tests/trends', { params }),
  getStats: (params) => api.get('/water-tests/stats', { params }),
};

export const issueAPI = {
  create: (data) => api.post('/issues', data),
  getAll: (params) => api.get('/issues', { params }),
  getById: (id) => api.get(`/issues/${id}`),
  update: (id, data) => api.put(`/issues/${id}`, data),
  delete: (id) => api.delete(`/issues/${id}`),
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getVillages: () => api.get('/admin/villages'),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUserStatus: (id) => api.patch(`/admin/users/${id}/toggle-status`),
};

export default api;
