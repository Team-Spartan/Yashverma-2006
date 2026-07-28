import api from './api';

export const fetchAuditLogs = async (params = {}) => {
  const response = await api.get('/audit', { params });
  return response.data;
};
