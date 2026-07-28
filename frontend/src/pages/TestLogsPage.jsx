import React, { useEffect, useState, useContext } from 'react';
import WaterTestTable from '../components/logs/WaterTestTable';
import { fetchWaterLogs } from '../services/waterLogService';
import { FileText, RefreshCw, ChevronLeft, ChevronRight, Filter, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function TestLogsPage() {
  const { user } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [villageFilter, setVillageFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Pagination states
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // Show 10 logs per page
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Active filters applied to server request
  const [appliedFilters, setAppliedFilters] = useState({
    villageName: '',
    qualityStatus: '',
    startDate: '',
    endDate: '',
    page: 1
  });

  const loadTestLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        limit,
        page: appliedFilters.page
      };

      if (appliedFilters.villageName) params.villageName = appliedFilters.villageName;
      if (appliedFilters.qualityStatus) params.qualityStatus = appliedFilters.qualityStatus;
      if (appliedFilters.startDate) params.startDate = appliedFilters.startDate;
      if (appliedFilters.endDate) params.endDate = appliedFilters.endDate;

      const response = await fetchWaterLogs(params);
      
      if (response && response.success) {
        setLogs(response.data || []);
        setTotalCount(response.total || 0);
        setTotalPages(response.pages || 1);
        setPage(response.page || 1);
      } else {
        throw new Error('Failed to retrieve data');
      }
    } catch (err) {
      console.error('[TestLogsPage Error]', err);
      setError('Unable to fetch water quality test logs from server.');
    } finally {
      setLoading(false);
    }
  };

  // Set default village filter for village representatives
  useEffect(() => {
    if (user && user.role === 'village_rep') {
      setVillageFilter(user.villageName);
      setAppliedFilters(prev => ({
        ...prev,
        villageName: user.villageName
      }));
    }
  }, [user]);

  // Re-fetch logs when applied filters change
  useEffect(() => {
    loadTestLogs();
  }, [appliedFilters]);

  // Apply filters trigger
  const handleApplyFilters = (e) => {
    e?.preventDefault();
    setAppliedFilters({
      villageName: villageFilter.trim(),
      qualityStatus: statusFilter,
      startDate,
      endDate,
      page: 1 // Reset to first page on filter search
    });
  };

  // Reset filters trigger
  const handleClearFilters = () => {
    const isRep = user && user.role === 'village_rep';
    setVillageFilter(isRep ? user.villageName : '');
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
    setAppliedFilters({
      villageName: isRep ? user.villageName : '',
      qualityStatus: '',
      startDate: '',
      endDate: '',
      page: 1
    });
  };

  // Pagination navigation
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setAppliedFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  return (
    <div>
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText style={{ color: 'var(--accent-cyan)' }} /> Water Quality Test Records
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Comprehensive ledger of field lab measurements, WQI scores, and biological test results.
          </p>
        </div>
        <button 
          onClick={loadTestLogs} 
          className="btn-primary" 
          disabled={loading}
          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh Records
        </button>
      </div>

      {error && (
        <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#f87171', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Filter panel */}
      <form onSubmit={handleApplyFilters} className="glass-card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          <Filter size={18} style={{ color: 'var(--accent-cyan)' }} />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Filter Test Logs</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
          {/* Location filter */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Location / Village</label>
            <input
              type="text"
              placeholder="e.g. Rampur"
              className="form-input"
              value={villageFilter}
              onChange={(e) => setVillageFilter(e.target.value)}
              disabled={user && user.role === 'village_rep'}
              style={{ 
                padding: '0.5rem 0.75rem', 
                fontSize: '0.875rem',
                opacity: user && user.role === 'village_rep' ? 0.75 : 1,
                cursor: user && user.role === 'village_rep' ? 'not-allowed' : 'text'
              }}
              title={user && user.role === 'village_rep' ? `Locked to your community: ${user.villageName}` : ''}
            />
          </div>

          {/* Status filter */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Water Quality Status</label>
            <select
              className="form-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem', background: 'var(--bg-dark)' }}
            >
              <option value="">All Statuses</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Poor">Poor</option>
              <option value="Unsafe">Unsafe</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          {/* Start Date filter */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Start Date</label>
            <input
              type="date"
              className="form-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
            />
          </div>

          {/* End Date filter */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>End Date</label>
            <input
              type="date"
              className="form-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
            />
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              type="submit" 
              className="btn-primary" 
              style={{ flex: 1, padding: '0.5rem 1rem', fontSize: '0.875rem', justifyContent: 'center' }}
            >
              Search
            </button>
            <button 
              type="button" 
              onClick={handleClearFilters}
              className="btn-primary" 
              style={{ 
                padding: '0.5rem', 
                background: 'rgba(255, 255, 255, 0.05)', 
                border: '1px solid var(--border-color)', 
                color: 'var(--text-main)' 
              }}
              title="Clear Filters"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </form>

      {/* Test Logs table */}
      <div className="glass-card" style={{ padding: '1rem' }}>
        <WaterTestTable logs={logs} loading={loading} />

        {/* Pagination controls */}
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
              Showing Page <strong style={{ color: 'var(--text-main)' }}>{page}</strong> of <strong style={{ color: 'var(--text-main)' }}>{totalPages}</strong> ({totalCount} total records)
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

              {/* Individual page numbers */}
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
