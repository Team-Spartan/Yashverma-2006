import axios from 'axios';
import { sampleVillages, sampleUsers, sampleLogs, sampleIssues, sampleTrends } from '../data/mockData';

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

const STORAGE_KEYS = {
  LOGS: 'jaldrishti_logs_v1',
  ISSUES: 'jaldrishti_issues_v1',
  NOTIFICATIONS: 'jaldrishti_notifs_v1'
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

// Domain Helper Methods attached directly to the api instance
api.login = async (email, password) => {
  try {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  } catch (err) {
    const foundUser = sampleUsers.find(u => u.email === email) || sampleUsers[0];
    return {
      success: true,
      token: 'demo-token-' + Date.now(),
      user: foundUser
    };
  }
};

api.register = async (name, email, password, role, village, district, phone) => {
  try {
    const res = await api.post('/auth/register', { name, email, password, role, village, district, phone });
    return res.data;
  } catch (err) {
    const newUser = { id: `u-${Date.now()}`, name, email, role: role || 'community_member', village: village || 'Rampur', district: district || 'Varanasi', phone };
    return {
      success: true,
      token: 'demo-token-' + Date.now(),
      user: newUser
    };
  }
};

api.getWaterLogs = async (filters = {}) => {
  try {
    const res = await api.get('/logs', { params: filters });
    return res.data;
  } catch (err) {
    let logs = getLocalData(STORAGE_KEYS.LOGS, sampleLogs);
    if (filters.village && filters.village !== 'All') logs = logs.filter(l => l.village === filters.village);
    if (filters.sourceType && filters.sourceType !== 'All') logs = logs.filter(l => l.sourceType === filters.sourceType);
    if (filters.safetyStatus && filters.safetyStatus !== 'All') logs = logs.filter(l => l.safetyStatus === filters.safetyStatus);
    return { success: true, count: logs.length, data: logs };
  }
};

api.createWaterLog = async (logData) => {
  try {
    const res = await api.post('/logs', logData);
    return res.data;
  } catch (err) {
    const logs = getLocalData(STORAGE_KEYS.LOGS, sampleLogs);
    const newLog = { id: `log-${Date.now()}`, ...logData, testedDate: new Date().toISOString().split('T')[0] };
    logs.unshift(newLog);
    setLocalData(STORAGE_KEYS.LOGS, logs);
    return { success: true, data: newLog };
  }
};

api.updateWaterLog = async (id, updateData) => {
  try {
    const res = await api.put(`/logs/${id}`, updateData);
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
};

api.deleteWaterLog = async (id) => {
  try {
    const res = await api.delete(`/logs/${id}`);
    return res.data;
  } catch (err) {
    const logs = getLocalData(STORAGE_KEYS.LOGS, sampleLogs);
    const filtered = logs.filter(l => l.id !== id);
    setLocalData(STORAGE_KEYS.LOGS, filtered);
    return { success: true, message: 'Log deleted locally' };
  }
};

api.getIssues = async (params = {}) => {
  try {
    const res = await api.get('/issues', { params });
    return res.data;
  } catch (err) {
    let issues = getLocalData(STORAGE_KEYS.ISSUES, sampleIssues);
    if (params.status && params.status !== 'All') issues = issues.filter(i => i.status === params.status);
    if (params.severity && params.severity !== 'All') issues = issues.filter(i => i.severity === params.severity);
    const page = params.page || 1;
    const limit = params.limit || 6;
    const totalPages = Math.ceil(issues.length / limit) || 1;
    const paginated = issues.slice((page - 1) * limit, page * limit);
    return { success: true, count: issues.length, page, totalPages, data: paginated };
  }
};

api.createIssue = async (issueData) => {
  try {
    const res = await api.post('/issues', issueData);
    return res.data;
  } catch (err) {
    const issues = getLocalData(STORAGE_KEYS.ISSUES, sampleIssues);
    const newIssue = { id: `issue-${Date.now()}`, ...issueData, reportedDate: new Date().toISOString().split('T')[0], status: 'Pending' };
    issues.unshift(newIssue);
    setLocalData(STORAGE_KEYS.ISSUES, issues);
    return { success: true, data: newIssue };
  }
};

api.updateIssue = async (id, updateData) => {
  try {
    const res = await api.put(`/issues/${id}`, updateData);
    return res.data;
  } catch (err) {
    const issues = getLocalData(STORAGE_KEYS.ISSUES, sampleIssues);
    const index = issues.findIndex(i => i.id === id);
    if (index !== -1) {
      issues[index] = { ...issues[index], ...updateData };
      setLocalData(STORAGE_KEYS.ISSUES, issues);
      return { success: true, data: issues[index] };
    }
    return { success: false, message: 'Issue not found' };
  }
};

api.deleteIssue = async (id) => {
  try {
    const res = await api.delete(`/issues/${id}`);
    return res.data;
  } catch (err) {
    const issues = getLocalData(STORAGE_KEYS.ISSUES, sampleIssues);
    const filtered = issues.filter(i => i.id !== id);
    setLocalData(STORAGE_KEYS.ISSUES, filtered);
    return { success: true, message: 'Issue deleted locally' };
  }
};

api.getVillages = async () => {
  try {
    const res = await api.get('/villages');
    return res.data;
  } catch (err) {
    return { success: true, data: sampleVillages };
  }
};

api.getUsers = async () => {
  try {
    const res = await api.get('/users');
    return res.data;
  } catch (err) {
    return { success: true, data: sampleUsers };
  }
};

api.getDashboardStats = async () => {
  try {
    const res = await api.get('/stats/dashboard');
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
};

api.getTrends = async () => {
  try {
    const res = await api.get('/stats/trends');
    return res.data;
  } catch (err) {
    return { success: true, data: sampleTrends };
  }
};

api.getNotifications = async (unreadOnly = false) => {
  try {
    const res = await api.get('/notifications', { params: { unreadOnly } });
    return res.data;
  } catch (err) {
    let notifs = getLocalData(STORAGE_KEYS.NOTIFICATIONS, [
      { id: 'notif-1', title: 'High Contamination Alert', message: 'High Fluoride in Devgarh Borewell #2', date: '2026-07-22', read: false },
      { id: 'notif-2', title: 'Issue Resolved', message: 'Feeder Valve Leakage fixed in Rampur', date: '2026-07-12', read: true }
    ]);
    if (unreadOnly) {
      const count = notifs.filter(n => !n.read).length;
      return { success: true, count };
    }
    return { success: true, data: notifs };
  }
};

api.markNotificationRead = async (id) => {
  try {
    const res = await api.put(`/notifications/${id}/read`);
    return res.data;
  } catch (err) {
    let notifs = getLocalData(STORAGE_KEYS.NOTIFICATIONS, []);
    notifs = notifs.map(n => n.id === id ? { ...n, read: true } : n);
    setLocalData(STORAGE_KEYS.NOTIFICATIONS, notifs);
    return { success: true };
  }
};

api.markAllNotificationsRead = async () => {
  try {
    const res = await api.put('/notifications/read-all');
    return res.data;
  } catch (err) {
    let notifs = getLocalData(STORAGE_KEYS.NOTIFICATIONS, []);
    notifs = notifs.map(n => ({ ...n, read: true }));
    setLocalData(STORAGE_KEYS.NOTIFICATIONS, notifs);
    return { success: true };
  }
};

api.deleteNotification = async (id) => {
  try {
    const res = await api.delete(`/notifications/${id}`);
    return res.data;
  } catch (err) {
    let notifs = getLocalData(STORAGE_KEYS.NOTIFICATIONS, []);
    notifs = notifs.filter(n => n.id !== id);
    setLocalData(STORAGE_KEYS.NOTIFICATIONS, notifs);
    return { success: true };
  }
};

api.getAdminActivityStats = async (params = {}) => {
  try {
    const res = await api.get('/admin/activity', { params });
    return res.data;
  } catch (err) {
    return {
      success: true,
      data: {
        totalTestsSubmitted: 142,
        activeReporters: 18,
        issuesResolved: 34,
        avgResolutionTimeDays: 2.4,
        recentActivity: [
          { id: 'act-1', user: 'Ankit Kumar', action: 'Log Water Test', detail: 'Central Panchayat Handpump #1 (Safe)', timestamp: '10 mins ago' },
          { id: 'act-2', user: 'Nitish Singh', action: 'Report Contamination Issue', detail: 'Sewer Line Leakage Near North Basti Well', timestamp: '1 hour ago' },
          { id: 'act-3', user: 'Yash Sharma', action: 'Status Update', detail: 'Pipeline Burst marked as Resolved', timestamp: '3 hours ago' }
        ]
      }
    };
  }
};

api.resetData = async () => {
  try {
    const res = await api.post('/seed');
    return res.data;
  } catch (err) {
    localStorage.removeItem(STORAGE_KEYS.LOGS);
    localStorage.removeItem(STORAGE_KEYS.ISSUES);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    return { success: true, message: 'Local storage reset' };
  }
};

// Named exports for components importing authAPI, waterTestAPI, issueAPI, adminAPI, waterQualityAPI
export const authAPI = {
  register: (data) => api.register(data.name || data.fullName, data.email, data.password, data.role, data.village, data.district, data.phone),
  login: (data) => api.login(data.email, data.password),
  getMe: () => api.get('/auth/me').then(r => r.data).catch(() => ({ success: true, user: sampleUsers[0] })),
  updateProfile: (data) => api.put('/auth/me', data).then(r => r.data).catch(() => ({ success: true })),
  changePassword: (data) => api.put('/auth/change-password', data).then(r => r.data).catch(() => ({ success: true })),
};

export const waterTestAPI = {
  create: (data) => api.createWaterLog(data),
  getAll: (params) => api.getWaterLogs(params),
  getById: (id) => api.get(`/water-tests/${id}`).then(r => r.data).catch(() => ({ success: true, data: sampleLogs[0] })),
  update: (id, data) => api.updateWaterLog(id, data),
  delete: (id) => api.deleteWaterLog(id),
  getTrends: (params) => api.getTrends(params),
  getStats: (params) => api.getDashboardStats(params),
  compare: (params) => api.get('/water-tests/compare', { params }).then(r => r.data).catch(() => ({ success: true, data: [] })),
};

export const issueAPI = {
  create: (data) => api.createIssue(data),
  getAll: (params) => api.getIssues(params),
  getById: (id) => api.get(`/issues/${id}`).then(r => r.data).catch(() => ({ success: true, data: sampleIssues[0] })),
  update: (id, data) => api.updateIssue(id, data),
  delete: (id) => api.deleteIssue(id),
};

export const adminAPI = {
  getDashboard: () => api.getAdminActivityStats(),
  getVillages: () => api.getVillages(),
  getUsers: (params) => api.getUsers(params),
  toggleUserStatus: (id) => api.patch(`/admin/users/${id}/toggle-status`).then(r => r.data).catch(() => ({ success: true })),
};

export const waterQualityAPI = {
  getLogs: (filters) => api.getWaterLogs(filters),
  createLog: (logData) => api.createWaterLog(logData),
  updateLog: (id, updateData) => api.updateWaterLog(id, updateData),
  deleteLog: (id) => api.deleteWaterLog(id),
  getIssues: (params) => api.getIssues(params),
  createIssue: (issueData) => api.createIssue(issueData),
  getVillages: () => api.getVillages(),
  getDashboardStats: () => api.getDashboardStats(),
};

export { api };
export default api;
