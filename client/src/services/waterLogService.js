import api from './api';

export const fetchWaterLogs = async (params = {}) => {
  const response = await api.get('/logs', { params });
  return response.data;
};

export const createWaterLog = async (logData) => {
  const response = await api.post('/logs', logData);
  return response.data;
};

export const fetchDashboardAnalytics = async () => {
  const response = await api.get('/analytics/dashboard');
  return response.data;
};
