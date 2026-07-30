import axios from 'axios';
import { sampleVillages, sampleLogs, sampleIssues, sampleTrends } from '../data/mockData';

const API_BASE_URL = '/api';

// LocalStorage persistence for standalone offline demo mode
const STORAGE_KEYS = {
  LOGS: 'jaldrishti_logs_v1',
  ISSUES: 'jaldrishti_issues_v1',
  USER: 'jaldrishti_user_v1'
};

const getLocalData = (key, defaultVal) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
};

const setLocalData = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {}
};

// Initialize default local storage if empty
if (!localStorage.getItem(STORAGE_KEYS.LOGS)) {
  setLocalData(STORAGE_KEYS.LOGS, sampleLogs);
}
if (!localStorage.getItem(STORAGE_KEYS.ISSUES)) {
  setLocalData(STORAGE_KEYS.ISSUES, sampleIssues);
}

// Calculate WQI in frontend for instant feedback
export const calculateFrontendWQI = (params) => {
  const { pH = 7.2, tds = 300, turbidity = 1.5, fluoride = 0.8, nitrate = 20, bacterialCount = 0 } = params;
  let penalty = 0;
  const issues = [];

  if (pH < 6.5) { penalty += (6.5 - pH) * 15; issues.push(`Acidic (pH ${pH})`); }
  else if (pH > 8.5) { penalty += (pH - 8.5) * 15; issues.push(`Alkaline (pH ${pH})`); }

  if (tds > 2000) { penalty += 35; issues.push(`TDS (${tds} ppm)`); }
  else if (tds > 500) { penalty += ((tds - 500) / 1500) * 20; }

  if (turbidity > 5) { penalty += 25; issues.push(`Turbidity (${turbidity} NTU)`); }

  if (fluoride > 1.5) { penalty += 30; issues.push(`High Fluoride (${fluoride} mg/L)`); }

  if (nitrate > 45) { penalty += 25; issues.push(`High Nitrate (${nitrate} mg/L)`); }

  if (bacterialCount > 0) { penalty += 35; issues.push(`Bacterial Contamination (${bacterialCount} CFU)`); }

  const score = Math.max(0, Math.min(100, Math.round(100 - penalty)));

  let safetyStatus = 'Safe';
  if (score < 50 || bacterialCount > 5 || fluoride > 2.0 || nitrate > 70) {
    safetyStatus = 'Hazardous';
  } else if (score < 75 || issues.length > 0) {
    safetyStatus = 'Warning';
  }

  return { wqiScore: score, safetyStatus, issues };
};

export const api = {
  // Auth APIs
  register: async (name, email, password, role, village, district, phone) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/register`, { name, email, password, role, village, district, phone });
      if (res.data.success) {
        setLocalData(STORAGE_KEYS.USER, res.data.user);
      }
      return res.data;
    } catch (err) {
      if (err.response) {
        return err.response.data;
      }
      return { success: false, message: 'Network error. Please check your connection.' };
    }
  },

  login: async (email, password) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      return res.data;
    } catch (err) {
      // Standalone Fallback
      const role = email.includes('admin') ? 'admin' : (email.includes('worker') ? 'health_worker' : 'community_member');
      const user = {
        id: 'usr-' + Date.now(),
        name: email.split('@')[0].toUpperCase(),
        email,
        role,
        village: 'Rampur',
        district: 'Varanasi'
      };
      setLocalData(STORAGE_KEYS.USER, user);
      return { success: true, user, token: 'mock-token-' + Date.now() };
    }
  },

  // Water Logs APIs
  getWaterLogs: async (params = {}) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/water-logs`, { params });
      return res.data;
    } catch (err) {
      let logs = getLocalData(STORAGE_KEYS.LOGS, sampleLogs);
      if (params.village && params.village !== 'All') {
        logs = logs.filter(l => l.village.toLowerCase() === params.village.toLowerCase());
      }
      if (params.safetyStatus && params.safetyStatus !== 'All') {
        logs = logs.filter(l => l.safetyStatus.toLowerCase() === params.safetyStatus.toLowerCase());
      }
      if (params.search) {
        const q = params.search.toLowerCase();
        logs = logs.filter(l => l.sourceName.toLowerCase().includes(q) || l.village.toLowerCase().includes(q));
      }
      return { success: true, count: logs.length, data: logs };
    }
  },

  createWaterLog: async (logData) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/water-logs`, logData);
      return res.data;
    } catch (err) {
      const logs = getLocalData(STORAGE_KEYS.LOGS, sampleLogs);
      const evalWQI = calculateFrontendWQI(logData);
      const newLog = {
        ...logData,
        id: 'log-' + Date.now(),
        safetyStatus: evalWQI.safetyStatus,
        wqiScore: evalWQI.wqiScore,
        testedDate: logData.testedDate || new Date().toISOString().split('T')[0]
      };
      logs.unshift(newLog);
      setLocalData(STORAGE_KEYS.LOGS, logs);
      return { success: true, message: 'Log created locally', data: newLog };
    }
  },

  updateWaterLog: async (id, logData) => {
    try {
      const res = await axios.put(`${API_BASE_URL}/water-logs/${id}`, logData);
      return res.data;
    } catch (err) {
      const logs = getLocalData(STORAGE_KEYS.LOGS, sampleLogs);
      const idx = logs.findIndex(l => l.id === id);
      if (idx !== -1) {
        const evalWQI = calculateFrontendWQI(logData);
        logs[idx] = { ...logs[idx], ...logData, safetyStatus: evalWQI.safetyStatus, wqiScore: evalWQI.wqiScore };
        setLocalData(STORAGE_KEYS.LOGS, logs);
        return { success: true, data: logs[idx] };
      }
      return { success: false, message: 'Log not found' };
    }
  },

  deleteWaterLog: async (id) => {
    try {
      const res = await axios.delete(`${API_BASE_URL}/water-logs/${id}`);
      return res.data;
    } catch (err) {
      let logs = getLocalData(STORAGE_KEYS.LOGS, sampleLogs);
      logs = logs.filter(l => l.id !== id);
      setLocalData(STORAGE_KEYS.LOGS, logs);
      return { success: true, message: 'Deleted locally' };
    }
  },

  // Issues APIs
  getIssues: async (params = {}) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/issues`, { params });
      return res.data;
    } catch (err) {
      let issues = getLocalData(STORAGE_KEYS.ISSUES, sampleIssues);
      if (params.village && params.village !== 'All') {
        issues = issues.filter(i => i.village.toLowerCase() === params.village.toLowerCase());
      }
      if (params.status && params.status !== 'All') {
        issues = issues.filter(i => i.status.toLowerCase() === params.status.toLowerCase());
      }
      if (params.severity && params.severity !== 'All') {
        issues = issues.filter(i => i.severity.toLowerCase() === params.severity.toLowerCase());
      }
      const page = parseInt(params.page) || 1;
      const limit = parseInt(params.limit) || 6;
      const totalCount = issues.length;
      const totalPages = Math.ceil(totalCount / limit);
      const start = (page - 1) * limit;
      return { success: true, count: issues.slice(start, start + limit).length, totalCount, page, limit, totalPages, data: issues.slice(start, start + limit) };
    }
  },

  createIssue: async (issueData) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/issues`, issueData);
      return res.data;
    } catch (err) {
      const issues = getLocalData(STORAGE_KEYS.ISSUES, sampleIssues);
      const newIssue = {
        ...issueData,
        id: 'issue-' + Date.now(),
        status: 'Pending',
        reportedDate: new Date().toISOString().split('T')[0],
        assignedTo: 'Gram Panchayat Officer',
        actionNotes: 'Incident logged in system.'
      };
      issues.unshift(newIssue);
      setLocalData(STORAGE_KEYS.ISSUES, issues);
      return { success: true, data: newIssue };
    }
  },

  updateIssue: async (id, updateData) => {
    try {
      const res = await axios.put(`${API_BASE_URL}/issues/${id}`, updateData);
      return res.data;
    } catch (err) {
      const issues = getLocalData(STORAGE_KEYS.ISSUES, sampleIssues);
      const idx = issues.findIndex(i => i.id === id);
      if (idx !== -1) {
        issues[idx] = { ...issues[idx], ...updateData };
        setLocalData(STORAGE_KEYS.ISSUES, issues);
        return { success: true, data: issues[idx] };
      }
      return { success: false, message: 'Issue not found' };
    }
  },

  deleteIssue: async (id) => {
    try {
      const res = await axios.delete(`${API_BASE_URL}/issues/${id}`);
      return res.data;
    } catch (err) {
      let issues = getLocalData(STORAGE_KEYS.ISSUES, sampleIssues);
      issues = issues.filter(i => i.id !== id);
      setLocalData(STORAGE_KEYS.ISSUES, issues);
      return { success: true, message: 'Issue deleted locally' };
    }
  },

  // Villages & Stats APIs
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
  },

  getUsers: async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/users`);
      return res.data;
    } catch (err) {
      return {
        success: true,
        data: [
          { id: 'u1', name: 'Yash Sharma', role: 'admin', village: 'Rampur', district: 'Varanasi', phone: '+91 98765 43210', email: 'yash.leader@jaldrishti.org', registeredDate: '2026-07-01' },
          { id: 'u2', name: 'Ankit Kumar', role: 'health_worker', village: 'Rampur', district: 'Varanasi', phone: '+91 98123 45678', email: 'ankit.worker@jaldrishti.org', registeredDate: '2026-07-08' },
          { id: 'u3', name: 'Nitish Singh', role: 'health_worker', village: 'Shivpur', district: 'Varanasi', phone: '+91 97111 22334', email: 'nitish.worker@jaldrishti.org', registeredDate: '2026-07-15' },
          { id: 'u4', name: 'Rohit Verma', role: 'community_member', village: 'Devgarh', district: 'Sonbhadra', phone: '+91 95999 88776', email: 'rohit.citizen@jaldrishti.org', registeredDate: '2026-07-20' },
          { id: 'u5', name: 'Pooja Devi', role: 'health_worker', village: 'Sundarpur', district: 'Mirzapur', phone: '+91 98333 44556', email: 'pooja.asha@jaldrishti.org', registeredDate: '2026-07-24' },
          { id: 'u6', name: 'Sanjay Patel', role: 'admin', village: 'Chandpur', district: 'Varanasi', phone: '+91 94150 12345', email: 'sanjay.admin@jaldrishti.org', registeredDate: '2026-07-27' }
        ]
      };
    }
  },

  getActivityStats: async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/stats/activity`);
      return res.data;
    } catch (err) {
      const logs = getLocalData(STORAGE_KEYS.LOGS, sampleLogs);
      const issues = getLocalData(STORAGE_KEYS.ISSUES, sampleIssues);
      return {
        success: true,
        data: {
          waterLogs: logs,
          issueReports: issues
        }
      };
    }
  },

  getAdminActivityStats: async ({ days = 30, granularity = 'daily' } = {}) => {
    try {
      let range = '30days';
      if (days <= 7) range = '7days';
      else if (days >= 90) range = 'allTime';
      const res = await axios.get(`${API_BASE_URL}/admin/activity-stats`, {
        params: { range, granularity }
      });
      return res.data;
    } catch (err) {
      return { success: false, message: err.message, data: null };
    }
  },

  getTrends: async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/stats/trends`);
      return res.data;
    } catch (err) {
      return { success: true, data: sampleTrends };
    }
  },

  // Notifications APIs
  getNotifications: async (unreadOnly = false) => {
    try {
      const params = unreadOnly ? { unreadOnly: 'true' } : {};
      const res = await axios.get(`${API_BASE_URL}/notifications`, { params });
      return res.data;
    } catch (err) {
      const notifs = getLocalData('jaldrishti_notifications_v1', []);
      if (unreadOnly) {
        return { success: true, count: notifs.filter(n => !n.read).length, data: notifs.filter(n => !n.read) };
      }
      return { success: true, count: notifs.length, data: notifs };
    }
  },

  markNotificationRead: async (id) => {
    try {
      const res = await axios.put(`${API_BASE_URL}/notifications/${id}/read`);
      return res.data;
    } catch (err) {
      const notifs = getLocalData('jaldrishti_notifications_v1', []);
      const n = notifs.find(n => n.id === id);
      if (n) n.read = true;
      setLocalData('jaldrishti_notifications_v1', notifs);
      return { success: true };
    }
  },

  markAllNotificationsRead: async () => {
    try {
      const res = await axios.put(`${API_BASE_URL}/notifications/read-all`);
      return res.data;
    } catch (err) {
      const notifs = getLocalData('jaldrishti_notifications_v1', []);
      notifs.forEach(n => { n.read = true; });
      setLocalData('jaldrishti_notifications_v1', notifs);
      return { success: true };
    }
  },

  deleteNotification: async (id) => {
    try {
      const res = await axios.delete(`${API_BASE_URL}/notifications/${id}`);
      return res.data;
    } catch (err) {
      if (err.response) return err.response.data;
      return { success: false, message: err.message };
    }
  },

  resetData: async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/seed`);
      localStorage.removeItem(STORAGE_KEYS.LOGS);
      localStorage.removeItem(STORAGE_KEYS.ISSUES);
      return res.data;
    } catch (err) {
      setLocalData(STORAGE_KEYS.LOGS, sampleLogs);
      setLocalData(STORAGE_KEYS.ISSUES, sampleIssues);
      return { success: true, message: 'Data reset to defaults' };
    }
  }
};
