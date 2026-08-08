import axios from 'axios';
import { sampleVillages, sampleLogs, sampleIssues, sampleTrends } from '../data/sampleData';

const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('jaldrishti_token') || localStorage.getItem('aquawatch_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('jaldrishti_token');
      localStorage.removeItem('aquawatch_token');
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

export const waterTestAPI = {
  create: (data) => api.post('/water-tests', data),
  getAll: (params) => api.get('/water-tests', { params }),
  getById: (id) => api.get(`/water-tests/${id}`),
  update: (id, data) => api.put(`/water-tests/${id}`, data),
  delete: (id) => api.delete(`/water-tests/${id}`),
  getTrends: (params) => api.get('/water-tests/trends', { params }),
  getStats: (params) => api.get('/water-tests/stats', { params }),
  compare: (params) => api.get('/water-tests/compare', { params }),
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

const STORAGE_KEYS = {
  LOGS: 'jaldrishti_logs_v1',
  ISSUES: 'jaldrishti_issues_v1'
};

const getLocalData = (key, fallback) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (err) {
    return fallback;
  }
};

const setLocalData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('LocalStorage write error', err);
  }
};

export const waterQualityAPI = {
  getLogs: async (filters = {}) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/logs`, { params: filters });
      return res.data;
    } catch (err) {
      let logs = getLocalData(STORAGE_KEYS.LOGS, sampleLogs);
      if (filters.village) logs = logs.filter(l => l.village === filters.village);
      if (filters.sourceType) logs = logs.filter(l => l.sourceType === filters.sourceType);
      if (filters.safetyStatus) logs = logs.filter(l => l.safetyStatus === filters.safetyStatus);
      return { success: true, count: logs.length, data: logs };
    }
  },

  createLog: async (logData) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/logs`, logData);
      return res.data;
    } catch (err) {
      const logs = getLocalData(STORAGE_KEYS.LOGS, sampleLogs);
      const newLog = { id: `log-${Date.now()}`, ...logData, testedDate: new Date().toISOString() };
      logs.unshift(newLog);
      setLocalData(STORAGE_KEYS.LOGS, logs);
      return { success: true, data: newLog };
    }
  },

  updateLog: async (id, updateData) => {
    try {
      const res = await axios.put(`${API_BASE_URL}/logs/${id}`, updateData);
      return res.data;
    } catch (err) {
      const logs = getLocalData(STORAGE_KEYS.LOGS, sampleLogs);
      const index = logs.findIndex(l => l.id === id);
      if (index !== -1) {
        logs[index] = { ...logs[index], ...updateData };
        setLocalData(STORAGE_KEYS.LOGS, logs);
        return { success: true, data: logs[index] };
      }
      return { success: false, message: 'Log not found' };
    }
  },

  deleteLog: async (id) => {
    try {
      const res = await axios.delete(`${API_BASE_URL}/logs/${id}`);
      return res.data;
    } catch (err) {
      const logs = getLocalData(STORAGE_KEYS.LOGS, sampleLogs);
      const filtered = logs.filter(l => l.id !== id);
      setLocalData(STORAGE_KEYS.LOGS, filtered);
      return { success: true, message: 'Log deleted locally' };
    }
  },

  getIssues: async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/issues`);
      return res.data;
    } catch (err) {
      const issues = getLocalData(STORAGE_KEYS.ISSUES, sampleIssues);
      return { success: true, count: issues.length, data: issues };
    }
  },

  createIssue: async (issueData) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/issues`, issueData);
      return res.data;
    } catch (err) {
      const issues = getLocalData(STORAGE_KEYS.ISSUES, sampleIssues);
      const newIssue = { id: `issue-${Date.now()}`, ...issueData, reportedDate: new Date().toISOString(), status: 'Pending' };
      issues.unshift(newIssue);
      setLocalData(STORAGE_KEYS.ISSUES, issues);
      return { success: true, data: newIssue };
    }
  },

  getVillages: async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/villages`);
      return res.data;
    } catch (err) {
      return { success: true, data: sampleVillages };
    }
  },

  getDashboardStats: async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/stats/dashboard`);
      return res.data;
    } catch (err) {
      const logs = getLocalData(STORAGE_KEYS.LOGS, sampleLogs);
      const issues = getLocalData(STORAGE_KEYS.ISSUES, sampleIssues);
      const totalLogs = logs.length;
      const safeCount = logs.filter(l => l.safetyStatus === 'Safe').length;
      const safePercentage = totalLogs > 0 ? Math.round((safeCount / totalLogs) * 100) : 0;
      const pendingIssues = issues.filter(i => i.status === 'Pending' || i.status === 'Under Review').length;
      const avgWQI = totalLogs > 0 ? Math.round(logs.reduce((acc, l) => acc + (l.wqiScore || 75), 0) / totalLogs) : 82;

      return {
        success: true,
        data: {
          totalLogs,
          safeCount,
          safePercentage,
          pendingIssues,
          avgWQI,
          villagesCount: sampleVillages.length
        }
      };
    }
  }
};

export { api };
export default api;
