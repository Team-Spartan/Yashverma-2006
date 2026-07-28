import React, { useState, useEffect, useCallback } from 'react';
import { waterTestAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import WaterTestForm from '../components/WaterTestForm';

const WaterTests = () => {
  const { user } = useAuth();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [filters, setFilters] = useState({ status: '', page: 1 });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [recentlyUpdated, setRecentlyUpdated] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTests = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: filters.page, limit: 10 };
      if (filters.status) params.status = filters.status;
      const res = await waterTestAPI.getAll(params);
      setTests(res.data.tests);
      setPagination(res.data.pagination);
    } catch (err) {
      showToast('Failed to load tests', 'error');
    }
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const handleCreate = async (data) => {
    try {
      const res = await waterTestAPI.create(data);
      setTests((prev) => [res.data.test, ...prev]);
      setShowCreateModal(false);
      showToast('Test result added successfully');
    } catch (err) {
      throw err;
    }
  };

  const handleUpdate = async (data) => {
    try {
      const res = await waterTestAPI.update(editingTest._id, data);
      setTests((prev) =>
        prev.map((t) => (t._id === editingTest._id ? res.data.test : t))
      );
      setRecentlyUpdated(editingTest._id);
      setTimeout(() => setRecentlyUpdated(null), 2000);
      setEditingTest(null);
      showToast('Test result updated successfully');
    } catch (err) {
      throw err;
    }
  };

  const handleDelete = async (id) => {
    try {
      await waterTestAPI.delete(id);
      setTests((prev) => prev.filter((t) => t._id !== id));
      setDeleteConfirm(null);
      showToast('Test result deleted');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete test result';
      showToast(msg, 'error');
    }
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const canEdit = (test) => {
    return test.userId?._id === user?.id || user?.role === 'admin' || user?.role === 'official';
  };

  return (
    <div>
      <div className="page-header">
        <h1>Water Quality Test Results</h1>
        <p>Track and manage water quality test data for your village</p>
      </div>

      <div className="filter-bar">
        <select
          className="form-control"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
        >
          <option value="">All Status</option>
          <option value="safe">Safe</option>
          <option value="caution">Caution</option>
          <option value="unsafe">Unsafe</option>
        </select>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          + Add Test Result
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-screen" style={{ minHeight: 200 }}><div className="spinner" /></div>
        ) : tests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">&#128167;</div>
            <h3>No test results found</h3>
            <p>Add your first water quality test result to get started.</p>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Source</th>
                    <th>Type</th>
                    <th>pH</th>
                    <th>Turbidity</th>
                    <th>TDS</th>
                    <th>Chlorine</th>
                    <th>Bacteria</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tests.map((test) => (
                    <tr
                      key={test._id}
                      className={recentlyUpdated === test._id ? 'row-updated' : ''}
                    >
                      <td>{new Date(test.testDate).toLocaleDateString()}</td>
                      <td>{test.sourceName}</td>
                      <td style={{ textTransform: 'capitalize' }}>{test.sourceType}</td>
                      <td>{test.ph ?? '-'}</td>
                      <td>{test.turbidity ? `${test.turbidity} ${test.turbidityUnit}` : '-'}</td>
                      <td>{test.tds ? `${test.tds} ${test.tdsUnit}` : '-'}</td>
                      <td>{test.chlorine ? `${test.chlorine} ${test.chlorineUnit}` : '-'}</td>
                      <td>
                        <span className={`badge badge-${test.bacteriaTest === 'safe' ? 'safe' : test.bacteriaTest === 'unsafe' ? 'unsafe' : ''}`}>
                          {test.bacteriaTest === 'not_tested' ? 'Not Tested' : test.bacteriaTest}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${test.overallStatus}`}>{test.overallStatus}</span>
                      </td>
                      <td>
                        <div className="table-actions">
                          {canEdit(test) && (
                            <button
                              className="btn-icon btn-edit"
                              title="Edit test result"
                              onClick={() => setEditingTest(test)}
                            >
                              &#9998;
                            </button>
                          )}
                          {canEdit(test) && (
                            <button
                              className="btn-icon"
                              title="Delete test result"
                              onClick={() => setDeleteConfirm(test)}
                              style={{ color: 'var(--danger)' }}
                            >
                              &#128465;
                            </button>
                          )}
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
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  Previous
                </button>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={p === pagination.page ? 'active' : ''}
                    onClick={() => handlePageChange(p)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => handlePageChange(pagination.page + 1)}
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
              <h2>Add Water Quality Test</h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <WaterTestForm
                onSubmit={handleCreate}
                onCancel={() => setShowCreateModal(false)}
                initialData={{ village: user?.village || '' }}
              />
            </div>
          </div>
        </div>
      )}

      {editingTest && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setEditingTest(null)}>
          <div className="modal">
            <div className="modal-header">
              <div>
                <h2>Edit Water Quality Test</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  {editingTest.sourceName} &middot; {new Date(editingTest.testDate).toLocaleDateString()}
                </p>
              </div>
              <button className="modal-close" onClick={() => setEditingTest(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <WaterTestForm
                initialData={editingTest}
                onSubmit={handleUpdate}
                onCancel={() => setEditingTest(null)}
                isEditing
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
              <p>Are you sure you want to delete the test result for <strong>{deleteConfirm.sourceName}</strong> on {new Date(deleteConfirm.testDate).toLocaleDateString()}?</p>
              <p style={{ color: 'var(--danger)', marginTop: 8, fontSize: '0.9rem' }}>This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm._id)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default WaterTests;
