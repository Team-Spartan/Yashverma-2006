import React, { useEffect, useState } from 'react';
import { fetchIssues, createIssue, updateIssueStatus } from '../services/issueService';
import { AlertOctagon, Plus, CheckCircle2 } from 'lucide-react';

export default function IssuesPage() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newIssue, setNewIssue] = useState({
    waterSourceId: '',
    issueType: 'discoloration',
    severity: 'high',
    description: ''
  });

  const loadIssues = async () => {
    try {
      const res = await fetchIssues();
      setIssues(res.data || []);
    } catch (err) {
      console.error('[IssuesPage Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssues();
  }, []);

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    try {
      await createIssue(newIssue);
      setShowModal(false);
      loadIssues();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit report');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateIssueStatus(id, { status: newStatus });
      loadIssues();
    } catch (err) {
      alert('Permission denied or update failed.');
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading reported contamination issues...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem' }}>Water Contamination & Damage Reports</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Real-time tracking of pipeline leaks, water discoloration, and emergency alerts.
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={18} /> Report New Issue
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {issues.map((issue) => (
          <div key={issue._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span className={`status-badge badge-${issue.severity}`}>
                  {issue.severity.toUpperCase()} SEVERITY
                </span>
                <span className={`status-badge badge-${issue.status}`}>
                  {issue.status.replace('_', ' ')}
                </span>
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>
                {issue.waterSource?.name || 'Village Source'} ({issue.villageName})
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: '1.4' }}>
                {issue.description}
              </p>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Reported by {issue.reportedBy?.name || 'Village Rep'}
              </span>
              {issue.status !== 'resolved' && (
                <button
                  onClick={() => handleStatusChange(issue._id, 'resolved')}
                  style={{ background: 'transparent', border: '1px solid #10b981', color: '#34d399', borderRadius: '6px', padding: '0.3rem 0.6rem', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  <CheckCircle2 size={14} /> Resolve
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-card" style={{ width: 480, background: '#1c2541' }}>
            <h2 style={{ marginBottom: '1rem' }}>Report Water Quality Issue</h2>
            <form onSubmit={handleCreateIssue}>
              <div className="form-group">
                <label>Water Source ID</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Water Source Mongo ID"
                  value={newIssue.waterSourceId}
                  onChange={(e) => setNewIssue({ ...newIssue, waterSourceId: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Issue Category</label>
                <select
                  className="form-input"
                  value={newIssue.issueType}
                  onChange={(e) => setNewIssue({ ...newIssue, issueType: e.target.value })}
                >
                  <option value="bad_odor">Bad Odor / Smell</option>
                  <option value="discoloration">Yellow/Brown Discoloration</option>
                  <option value="pipe_leakage">Pipeline Leakage</option>
                  <option value="contamination_outbreak">Health / Diarrhea Outbreak Alert</option>
                  <option value="low_pressure">Low Water Supply Pressure</option>
                </select>
              </div>
              <div className="form-group">
                <label>Severity Level</label>
                <select
                  className="form-input"
                  value={newIssue.severity}
                  onChange={(e) => setNewIssue({ ...newIssue, severity: e.target.value })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="emergency">Emergency / Hazardous</option>
                </select>
              </div>
              <div className="form-group">
                <label>Detailed Description</label>
                <textarea
                  className="form-input"
                  rows="3"
                  value={newIssue.description}
                  onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Submit Report</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--border-color)' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
