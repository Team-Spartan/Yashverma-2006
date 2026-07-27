import api from './api';

export const fetchIssues = async (params = {}) => {
  const response = await api.get('/issues', { params });
  return response.data;
};

export const createIssue = async (issueData) => {
  const response = await api.post('/issues', issueData);
  return response.data;
};

export const updateIssueStatus = async (id, statusData) => {
  const response = await api.patch(`/issues/${id}`, statusData);
  return response.data;
};
