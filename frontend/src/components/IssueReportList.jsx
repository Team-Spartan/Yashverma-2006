import React, { useState } from 'react';
import { AlertOctagon, Plus, Filter, ChevronLeft, ChevronRight, Loader, AlertCircle, RefreshCw, Table, Grid } from 'lucide-react';

const ISSUE_STATUSES = ['Pending', 'Under Review', 'In Progress', 'Resolved'];

const statusColors = {
  'Pending': '#f59e0b',
  'Under Review': '#3b82f6',
  'In Progress': '#06b6d4',
  'Resolved': '#10b981'
};

const statusBgColors = {
  'Pending': 'rgba(245,158,11,0.15)',
  'Under Review': 'rgba(59,130,246,0.15)',
  'In Progress': 'rgba(6,182,212,0.15)',
  'Resolved': 'rgba(16,185,129,0.15)'
};

export const IssueReportList = ({ issues, onOpenReportModal, onUpdateStatus, onDeleteIssue, loading, error, onRetry, page, totalPages, onPageChange, statusFilter = 'All', severityFilter = 'All', onStatusFilterChange, onSeverityFilterChange }) => {
  const [updatingId, setUpdatingId] = useState(null);
  const [viewMode, setViewMode] = useState('card');

  const handleStatusChange = async (issueId, newStatus) => {
    setUpdatingId(issueId);
    try {
      await onUpdateStatus(issueId, newStatus);
    } catch (e) {
      console.error('Status update failed', e);
    }
    setUpdatingId(null);
  };

  const getNextStatuses = (currentStatus) => {
    const idx = ISSUE_STATUSES.indexOf(currentStatus);
    if (idx === -1) return ISSUE_STATUSES;
    return ISSUE_STATUSES.slice(idx + 1);
  };

  const handleFilterChange = (setter) => (e) => {
    if (setter) setter(e.target.value);
  };

  const handleClearFilters = () => {
    if (onStatusFilterChange) onStatusFilterChange('All');
    if (onSeverityFilterChange) onSeverityFilterChange('All');
  };

  const renderStatusBadge = (status) => (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
      padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700,
      background: statusBgColors[status] || 'rgba(255,255,255,0.1)',
      color: statusColors[status] || 'var(--text-secondary)'
    }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusColors[status] || 'var(--text-secondary)' }} />
      {status}
    </span>
  );

  const renderSeverityBadge = (severity) => (
    <span style={{
      fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.55rem',
      borderRadius: '6px', whiteSpace: 'nowrap',
      background: severity === 'Critical' ? '#ef4444' : severity === 'High' ? '#f59e0b' : 'rgba(255,255,255,0.1)',
      color: '#ffffff'
    }}>
      {severity}
    </span>
  );

  const renderStatusUpdater = (issue) => (
    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
      {issue.status !== 'Resolved' && (
        <select
          value=""
          onChange={(e) => {
            if (e.target.value) handleStatusChange(issue.id, e.target.value);
            e.target.value = '';
          }}
          disabled={updatingId === issue.id}
          style={{
            padding: '0.35rem 0.65rem', fontSize: '0.78rem', fontWeight: 600,
            background: 'rgba(15,23,42,0.6)', color: '#38bdf8',
            border: '1px solid rgba(56,189,248,0.3)', borderRadius: '6px',
            outline: 'none', cursor: 'pointer', minWidth: '100px'
          }}
        >
          <option value="">Update status...</option>
          {getNextStatuses(issue.status).map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      )}
      {updatingId === issue.id && (
        <Loader size={16} className="pulse" style={{ color: '#38bdf8' }} />
      )}
    </div>
  );

  const renderPagination = () => {
    if (!totalPages || totalPages <= 1) return null;
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0' }}>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="btn-secondary"
          style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem', opacity: page <= 1 ? 0.4 : 1, cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
        >
          <ChevronLeft size={16} /> Previous
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            style={{
              width: '36px', height: '36px', borderRadius: '8px', border: 'none',
              background: p === page ? '#06b6d4' : 'rgba(255,255,255,0.07)',
              color: p === page ? '#fff' : 'var(--text-secondary)',
              fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="btn-secondary"
          style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem', opacity: page >= totalPages ? 0.4 : 1, cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <AlertOctagon color="#ef4444" />
            Issue Reports & Status Tracking
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Track, filter, and update contamination and infrastructure issues across all villages.
          </p>
        </div>
        <button
          onClick={onOpenReportModal}
          className="btn-primary"
          style={{ background: 'linear-gradient(135deg, #ef4444, #f59e0b)', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)' }}
        >
          <Plus size={18} />
          Report Issue
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '0.85rem 1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} color="var(--text-secondary)" />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Status:</span>
          <select
            value={statusFilter}
            onChange={handleFilterChange(onStatusFilterChange)}
            style={{ background: 'rgba(15,23,42,0.6)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '0.45rem 0.75rem', borderRadius: '8px', outline: 'none', fontWeight: 600, cursor: 'pointer' }}
          >
            <option value="All">All Statuses</option>
            {ISSUE_STATUSES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Severity:</span>
          <select
            value={severityFilter}
            onChange={handleFilterChange(onSeverityFilterChange)}
            style={{ background: 'rgba(15,23,42,0.6)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '0.45rem 0.75rem', borderRadius: '8px', outline: 'none', fontWeight: 600, cursor: 'pointer' }}
          >
            <option value="All">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        {(statusFilter !== 'All' || severityFilter !== 'All') && (
          <button onClick={handleClearFilters} style={{ background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, marginLeft: '0.5rem' }}>
            Clear filters
          </button>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.25rem', background: 'rgba(255,255,255,0.06)', borderRadius: '8px', padding: '0.15rem' }}>
          <button onClick={() => setViewMode('card')} style={{ padding: '0.3rem 0.5rem', borderRadius: '6px', border: 'none', cursor: 'pointer', background: viewMode === 'card' ? '#06b6d4' : 'transparent', color: viewMode === 'card' ? '#fff' : '#94a3b8' }} title="Card View"><Grid size={16} /></button>
          <button onClick={() => setViewMode('table')} style={{ padding: '0.3rem 0.5rem', borderRadius: '6px', border: 'none', cursor: 'pointer', background: viewMode === 'table' ? '#06b6d4' : 'transparent', color: viewMode === 'table' ? '#fff' : '#94a3b8' }} title="Table View"><Table size={16} /></button>
        </div>
      </div>

      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-panel" style={{ padding: '1.25rem', height: '260px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', opacity: 0.4 }}>
                <div style={{ width: '70%', height: '18px', background: 'var(--border-color)', borderRadius: '4px' }} />
                <div style={{ width: '100%', height: '14px', background: 'var(--border-color)', borderRadius: '4px' }} />
                <div style={{ width: '85%', height: '14px', background: 'var(--border-color)', borderRadius: '4px' }} />
                <div style={{ width: '60%', height: '14px', background: 'var(--border-color)', borderRadius: '4px', marginTop: '1rem' }} />
                <div style={{ width: '40%', height: '14px', background: 'var(--border-color)', borderRadius: '4px' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', borderColor: 'rgba(239,68,68,0.3)' }}>
          <AlertCircle size={40} color="#ef4444" style={{ marginBottom: '0.75rem', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fca5a5', marginBottom: '0.5rem' }}>Failed to Load Issues</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{error}</p>
          <button onClick={onRetry} className="btn-primary" style={{ justifyContent: 'center' }}>
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      )}

      {!loading && !error && issues.length === 0 && (
        <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <AlertOctagon size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>No Issues Found</h3>
          <p style={{ fontSize: '0.9rem' }}>
            {statusFilter !== 'All' || severityFilter !== 'All'
              ? 'No issues match the selected filters. Try adjusting your filter criteria.'
              : 'No issues have been reported yet. Click "Report Issue" to create the first one.'}
          </p>
        </div>
      )}

      {!loading && !error && issues.length > 0 && (
        <>
          {viewMode === 'card' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.25rem' }}>
              {issues.map((issue) => (
                <div key={issue.id} className="glass-panel" style={{
                  padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem',
                  borderColor: issue.severity === 'Critical' ? 'rgba(239,68,68,0.4)' : issue.severity === 'High' ? 'rgba(245,158,11,0.3)' : 'var(--border-color)'
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>{issue.title}</h3>
                      {renderSeverityBadge(issue.severity)}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '0.75rem' }}>{issue.description}</p>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div><strong>Location:</strong> {issue.locationDetails}, {issue.village} ({issue.district})</div>
                      <div><strong>Category:</strong> {issue.issueType}</div>
                      <div><strong>Reported By:</strong> {issue.reportedBy} on {issue.reportedDate}</div>
                      <div><strong>Assigned:</strong> {issue.assignedTo}</div>
                    </div>
                    {issue.actionNotes && (
                      <div style={{ marginTop: '0.65rem', padding: '0.55rem 0.75rem', background: 'rgba(15,23,42,0.6)', borderRadius: '8px', border: '1px dashed var(--border-color)', fontSize: '0.8rem' }}>
                        <strong style={{ color: '#38bdf8' }}>Action Log:</strong> {issue.actionNotes}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                    {renderStatusBadge(issue.status)}
                    {renderStatusUpdater(issue)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="data-table-container">
                <table className="data-table" style={{ fontSize: '0.82rem', width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '0.75rem 1rem' }}>Title</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Location</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Severity</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issues.map((issue) => (
                      <tr key={issue.id}>
                        <td style={{ padding: '0.65rem 1rem' }}><strong>{issue.title}</strong></td>
                        <td style={{ padding: '0.65rem 1rem', color: 'var(--text-secondary)' }}>{issue.village}</td>
                        <td style={{ padding: '0.65rem 1rem' }}>{renderSeverityBadge(issue.severity)}</td>
                        <td style={{ padding: '0.65rem 1rem' }}>{renderStatusBadge(issue.status)}</td>
                        <td style={{ padding: '0.65rem 1rem', color: 'var(--text-muted)' }}>{issue.reportedDate}</td>
                        <td style={{ padding: '0.65rem 1rem' }}>{renderStatusUpdater(issue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {renderPagination()}
        </>
      )}
    </div>
  );
};
