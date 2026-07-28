import React, { useEffect, useState } from 'react';
import { fetchAuditLogs } from '../services/auditService';
import { ShieldAlert, RefreshCw, ChevronLeft, ChevronRight, Clock, FileEdit, Trash2, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Expandable row state (maps audit log id to boolean)
  const [expandedRows, setExpandedRows] = useState({});

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const loadAuditLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        limit,
        page
      };

      const response = await fetchAuditLogs(params);
      
      if (response && response.success) {
        setLogs(response.data || []);
        setTotalCount(response.total || 0);
        setTotalPages(response.pages || 1);
      } else {
        throw new Error('Failed to retrieve audit log records');
      }
    } catch (err) {
      console.error('[AuditLogsPage Error]', err);
      setError('Unable to fetch integrity audit logs from the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, [page]);

  const toggleRow = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  const renderActionBadge = (action) => {
    if (action === 'DELETE') {
      return (
        <span className="status-badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 700 }}>
          <Trash2 size={12} /> DELETE
        </span>
      );
    }
    return (
      <span className="status-badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 700 }}>
        <FileEdit size={12} /> EDIT
      </span>
    );
  };

  const renderChangesTable = (changes, action) => {
    if (!changes || !changes.before) return null;
    const before = changes.before;
    const after = changes.after || {};

    const formatVal = (val) => {
      if (val === undefined || val === null) return '—';
      if (typeof val === 'boolean') return val ? 'Detected' : 'Absent';
      return val;
    };

    return (
      <div style={{ 
        padding: '1rem', 
        background: 'rgba(11, 19, 43, 0.6)', 
        borderRadius: 'var(--radius-md)', 
        fontSize: '0.85rem', 
        marginTop: '0.75rem',
        border: '1px solid var(--border-color)',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
      }}>
        <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
          {action === 'DELETE' ? 'Deleted Parameter Log Values:' : 'Modified Parameters Comparison:'}
        </h4>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', textTransform: 'uppercase' }}>Field / Parameter</th>
              <th style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', textTransform: 'uppercase' }}>Old Value</th>
              {action === 'EDIT' && <th style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', textTransform: 'uppercase' }}>New Value</th>}
            </tr>
          </thead>
          <tbody>
            {Object.keys(before).map((key) => {
              if (key === 'remarks' || key === 'calculatedWQI' || key === 'qualityStatus') return null;
              
              const beforeVal = formatVal(before[key]);
              const afterVal = formatVal(after[key]);
              
              // Only display fields that actually changed (or all if it's a delete operation)
              if (action === 'EDIT' && beforeVal === afterVal) return null;

              return (
                <tr key={key} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                  <td style={{ padding: '0.4rem 0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {key === 'ph' ? 'pH' : key === 'tds' ? 'TDS' : key === 'eColiPresent' ? 'E. Coli' : key.replace(/([A-Z])/g, ' $1')}
                  </td>
                  <td style={{ padding: '0.4rem 0.75rem', color: action === 'DELETE' ? '#ef4444' : '#f87171', fontWeight: 500 }}>
                    {beforeVal}
                  </td>
                  {action === 'EDIT' && (
                    <td style={{ padding: '0.4rem 0.75rem', color: '#34d399', fontWeight: 600 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <ArrowRight size={12} style={{ color: 'var(--text-muted)' }} /> {afterVal}
                      </span>
                    </td>
                  )}
                </tr>
              );
            })}
            
            {/* Display metadata changes (WQI, Status, Remarks) */}
            {(before.calculatedWQI !== undefined || before.qualityStatus !== undefined || before.remarks !== undefined) && (
              <tr style={{ borderTop: '1px dashed rgba(255,255,255,0.08)' }}>
                <td colSpan={action === 'EDIT' ? 3 : 2} style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginTop: '0.25rem' }}>
                    {before.calculatedWQI !== undefined && (
                      <div>
                        <strong>WQI Score:</strong> {before.calculatedWQI} 
                        {action === 'EDIT' && before.calculatedWQI !== after.calculatedWQI && ` ➡️ ${after.calculatedWQI}`}
                      </div>
                    )}
                    {before.qualityStatus !== undefined && (
                      <div>
                        <strong>Quality Rating:</strong> {before.qualityStatus}
                        {action === 'EDIT' && before.qualityStatus !== after.qualityStatus && ` ➡️ ${after.qualityStatus}`}
                      </div>
                    )}
                    {before.remarks !== undefined && (
                      <div style={{ gridColumn: '1 / -1' }}>
                        <strong>Remarks:</strong> "{before.remarks}"
                        {action === 'EDIT' && before.remarks !== after.remarks && ` ➡️ "${after.remarks}"`}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShieldAlert style={{ color: 'var(--accent-cyan)' }} /> Data Integrity Audit Trail
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Chronological ledger tracking edits, modifications, and deletions of water quality entries.
          </p>
        </div>
        <button 
          onClick={loadAuditLogs} 
          className="btn-primary" 
          disabled={loading}
          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh Ledger
        </button>
      </div>

      {error && (
        <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#f87171', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Main ledger */}
      <div className="glass-card" style={{ padding: '1rem' }}>
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <RefreshCw className="animate-spin" size={32} style={{ color: 'var(--accent-cyan)', marginBottom: '0.5rem' }} />
              <p>Retrieving audit logs...</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', background: 'rgba(11, 19, 43, 0.4)' }}>
                  <th style={{ padding: '0.85rem 1rem', width: '50px' }}>Details</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Timestamp</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Action Type</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Water Source / Location</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Modified By</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Summary of Changes</th>
                </tr>
              </thead>
              <tbody>
                {!logs || logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>No audit logs recorded.</p>
                      <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>Edits or deletions of test logs will be logged here.</p>
                    </td>
                  </tr>
                ) : (
                  logs.map((item) => {
                    const formattedDate = new Date(item.timestamp || item.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    });
                    const formattedTime = new Date(item.timestamp || item.createdAt).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    });

                    const isExpanded = !!expandedRows[item._id];

                    return (
                      <React.Fragment key={item._id}>
                        <tr style={{ 
                          borderBottom: isExpanded ? 'none' : '1px solid var(--border-color)', 
                          background: isExpanded ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                          transition: 'background 0.2s' 
                        }}>
                          <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                            <button
                              onClick={() => toggleRow(item._id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--accent-cyan)',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                padding: '0.25rem'
                              }}
                              title={isExpanded ? 'Hide changes' : 'Show changes'}
                            >
                              {isExpanded ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                            <div style={{ fontWeight: 500 }}>{formattedDate}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.1rem' }}>
                              <Clock size={12} /> {formattedTime}
                            </div>
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            {renderActionBadge(item.action)}
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ fontWeight: 600 }}>{item.waterSourceName}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Village: {item.villageName}
                            </div>
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ fontWeight: 500 }}>{item.performedBy?.name || 'Deleted Account'}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {item.performedBy?.role ? item.performedBy.role.replace('_', ' ') : 'Administrator'}
                            </div>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', fontWeight: 500 }}>
                            {item.description}
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr style={{ 
                            borderBottom: '1px solid var(--border-color)', 
                            background: 'rgba(255, 255, 255, 0.02)'
                          }}>
                            <td style={{ padding: '0 1rem 1rem 1rem' }}></td>
                            <td colSpan={5} style={{ padding: '0 1rem 1rem 1rem' }}>
                              {renderChangesTable(item.changes, item.action)}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && logs.length > 0 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginTop: '1rem', 
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-color)',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Showing Page <strong style={{ color: 'var(--text-main)' }}>{page}</strong> of <strong style={{ color: 'var(--text-main)' }}>{totalPages}</strong> ({totalCount} total audit records)
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                className="btn-primary"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                style={{ 
                  padding: '0.4rem 0.8rem', 
                  fontSize: '0.8rem', 
                  opacity: page === 1 ? 0.4 : 1,
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)'
                }}
              >
                <ChevronLeft size={14} /> Prev
              </button>

              {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .map((p, index, array) => {
                  const items = [];
                  if (index > 0 && p - array[index - 1] > 1) {
                    items.push(<span key={`ellipsis-${p}`} style={{ color: 'var(--text-muted)', padding: '0 0.25rem' }}>...</span>);
                  }
                  items.push(
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      style={{
                        padding: '0.4rem 0.75rem',
                        fontSize: '0.8rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid',
                        borderColor: p === page ? 'var(--accent-cyan)' : 'var(--border-color)',
                        background: p === page ? 'rgba(76, 201, 240, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                        color: p === page ? 'var(--accent-cyan)' : 'var(--text-main)',
                        cursor: 'pointer',
                        fontWeight: p === page ? 700 : 400
                      }}
                    >
                      {p}
                    </button>
                  );
                  return items;
                })}

              <button
                className="btn-primary"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                style={{ 
                  padding: '0.4rem 0.8rem', 
                  fontSize: '0.8rem', 
                  opacity: page === totalPages ? 0.4 : 1,
                  cursor: page === totalPages ? 'not-allowed' : 'pointer',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)'
                }}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
