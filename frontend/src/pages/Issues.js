import React, { useState, useEffect, useCallback } from 'react';
import { issueAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Issues = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [filters, setFilters] = useState({ status: '', severity: '', page: 1 });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: filters.page, limit: 10 };
      if (filters.status) params.status = filters.status;
      if (filters.severity) params.severity = filters.severity;
      const res = await issueAPI.getAll(params);
      setIssues(res.data.issues);
      setPagination(res.data.pagination);
    } catch (err) {
      showToast('Failed to load issues', 'error');
    }
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const data = Object.fromEntries(form);
    try {
      const res = await issueAPI.create(data);
      setIssues((prev) => [res.data.issue, ...prev]);
      setShowCreateModal(false);
      showToast('Issue reported successfully');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to report issue', 'error');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await issueAPI.update(id, { status });
      setIssues((prev) => prev.map((i) => (i._id === id ? res.data.issue : i)));
      showToast('Issue status updated');
    } catch (err) {
      showToast('Failed to update issue', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await issueAPI.delete(id);
      setIssues((prev) => prev.filter((i) => i._id !== id));
      setDeleteConfirm(null);
      showToast('Issue deleted');
    } catch (err) {
      showToast('Failed to delete issue', 'error');
    }
  };

  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  const statusOrder = { reported: 0, acknowledged: 1, in_progress: 2, resolved: 3, closed: 4 };

  return (
    <div>
      <div className="page-header">
        <h1>Issue Reports</h1>
        <p>Report and track water contamination and infrastructure issues</p>
      </div>

      <div className="filter-bar">
        <select
          className="form-control"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
        >
          <option value="">All Status</option>
          <option value="reported">Reported</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select
          className="form-control"
          value={filters.severity}
          onChange={(e) => setFilters({ ...filters, severity: e.target.value, page: 1 })}
        >
          <option value="">All Severity</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          + Report Issue
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-screen" style={{ minHeight: 200 }}><div className="spinner" /></div>
        ) : issues.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">&#128679;</div>
            <h3>No issues reported</h3>
            <p>Report an issue to get started.</p>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th>Village</th>
                    <th>Reported By</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.map((issue) => (
                    <tr key={issue._id}>
                      <td>{new Date(issue.createdAt).toLocaleDateString()}</td>
                      <td>{issue.title}</td>
                      <td style={{ textTransform: 'capitalize' }}>{issue.category?.replace('_', ' ')}</td>
                      <td>
                        <span className={`badge badge-${issue.severity === 'critical' || issue.severity === 'high' ? 'unsafe' : issue.severity === 'medium' ? 'caution' : 'safe'}`}>
                          {issue.severity}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${issue.status}`}>{issue.status?.replace('_', ' ')}</span>
                      </td>
                      <td>{issue.village}</td>
                      <td>{issue.userId?.name || 'Unknown'}</td>
                      <td>
                        <div className="table-actions">
                          {issue.status === 'reported' && (
                            <button
                              className="btn btn-sm btn-secondary"
                              onClick={() => handleUpdateStatus(issue._id, 'acknowledged')}
                              title="Acknowledge"
                            >
                              Ack
                            </button>
                          )}
                          {issue.status === 'acknowledged' && (
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => handleUpdateStatus(issue._id, 'in_progress')}
                              title="Start Working"
                            >
                              Start
                            </button>
                          )}
                          {issue.status === 'in_progress' && (
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleUpdateStatus(issue._id, 'resolved')}
                              title="Mark Resolved"
                            >
                              Resolve
                            </button>
                          )}
                          {(user?.role === 'admin' || user?.role === 'official') && (
                            <button
                              className="btn-icon"
                              onClick={() => setEditingIssue(issue)}
                              title="Edit"
                            >
                              &#9998;
                            </button>
                          )}
                          <button
                            className="btn-icon"
                            onClick={() => setDeleteConfirm(issue)}
                            title="Delete"
                            style={{ color: 'var(--danger)' }}
                          >
                            &#128465;
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.pages > 1 && (
              <div className="pagination">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                >
                  Previous
                </button>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={p === pagination.page ? 'active' : ''}
                    onClick={() => setFilters((f) => ({ ...f, page: p }))}
                  >
                    {p}
                  </button>
                ))}
                <button
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowCreateModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>Report Issue</h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreate}>
                <div className="form-group">
                  <label>Village *</label>
                  <input
                    type="text"
                    name="village"
                    className="form-control"
                    defaultValue={user?.village || ''}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    name="title"
                    className="form-control"
                    placeholder="Brief description of the issue"
                    required
                    maxLength={200}
                  />
                </div>
                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    name="description"
                    className="form-control"
                    rows={4}
                    placeholder="Detailed description of the issue"
                    required
                    maxLength={2000}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Category *</label>
                    <select name="category" className="form-control" required>
                      <option value="contamination">Contamination</option>
                      <option value="infrastructure">Infrastructure</option>
                      <option value="supply_shortage">Supply Shortage</option>
                      <option value="flooding">Flooding</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Severity</label>
                    <select name="severity" className="form-control" defaultValue="medium">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    name="location"
                    className="form-control"
                    placeholder="Specific location details (optional)"
                  />
                </div>
                <div className="modal-footer" style={{ padding: 0, border: 'none' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">Submit Report</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {editingIssue && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setEditingIssue(null)}>
          <div className="modal">
            <div className="modal-header">
              <h2>Edit Issue</h2>
              <button className="modal-close" onClick={() => setEditingIssue(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <IssueEditForm
                issue={editingIssue}
                onSave={async (data) => {
                  try {
                    const res = await issueAPI.update(editingIssue._id, data);
                    setIssues((prev) => prev.map((i) => (i._id === editingIssue._id ? res.data.issue : i)));
                    setEditingIssue(null);
                    showToast('Issue updated');
                  } catch (err) {
                    showToast('Failed to update issue', 'error');
                  }
                }}
                onCancel={() => setEditingIssue(null)}
              />
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setDeleteConfirm(null)}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button className="modal-close" onClick={() => setDeleteConfirm(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete the issue: <strong>{deleteConfirm.title}</strong>?</p>
              <p style={{ color: 'var(--danger)', marginTop: 8, fontSize: '0.9rem' }}>This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm._id)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
};

const IssueEditForm = ({ issue, onSave, onCancel }) => {
  const [form, setForm] = useState({
    title: issue.title || '',
    description: issue.description || '',
    category: issue.category || 'other',
    severity: issue.severity || 'medium',
    status: issue.status || 'reported',
    location: issue.location || '',
    adminNotes: issue.adminNotes || '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (!form.description.trim()) newErrors.description = 'Description is required';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Title *</label>
        <input
          type="text"
          name="title"
          className={`form-control ${errors.title ? 'error' : ''}`}
          value={form.title}
          onChange={handleChange}
          required
        />
        {errors.title && <span className="error-text">{errors.title}</span>}
      </div>
      <div className="form-group">
        <label>Description *</label>
        <textarea
          name="description"
          className={`form-control ${errors.description ? 'error' : ''}`}
          rows={3}
          value={form.description}
          onChange={handleChange}
          required
        />
        {errors.description && <span className="error-text">{errors.description}</span>}
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Category</label>
          <select name="category" className="form-control" value={form.category} onChange={handleChange}>
            <option value="contamination">Contamination</option>
            <option value="infrastructure">Infrastructure</option>
            <option value="supply_shortage">Supply Shortage</option>
            <option value="flooding">Flooding</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="form-group">
          <label>Severity</label>
          <select name="severity" className="form-control" value={form.severity} onChange={handleChange}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label>Status</label>
        <select name="status" className="form-control" value={form.status} onChange={handleChange}>
          <option value="reported">Reported</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>
      <div className="form-group">
        <label>Location</label>
        <input
          type="text"
          name="location"
          className="form-control"
          value={form.location}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label>Admin Notes</label>
        <textarea
          name="adminNotes"
          className="form-control"
          rows={2}
          value={form.adminNotes}
          onChange={handleChange}
        />
      </div>
      <div className="modal-footer" style={{ padding: 0, border: 'none' }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary">Save Changes</button>
      </div>
    </form>
  );
};

export default Issues;
