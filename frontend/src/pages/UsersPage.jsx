import React, { useEffect, useState } from 'react';
import { fetchUsers } from '../services/authService';
import { Users, Search, Filter, X, ChevronLeft, ChevronRight, RefreshCw, Mail, Phone, Calendar, Shield } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & search inputs
  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        limit,
        page
      };

      if (searchInput.trim()) params.search = searchInput.trim();
      if (roleFilter) params.role = roleFilter;

      const response = await fetchUsers(params);

      if (response && response.success) {
        setUsers(response.data || []);
        setTotalCount(response.total || 0);
        setTotalPages(response.pages || 1);
      } else {
        throw new Error('Failed to retrieve user accounts');
      }
    } catch (err) {
      console.error('[UsersPage Error]', err);
      setError('Unable to fetch registered users from the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [searchInput, roleFilter, page]);

  const handleFormSubmit = (e) => {
    e?.preventDefault();
    loadUsers();
  };

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
    setPage(1);
  };

  const handleRoleChange = (e) => {
    setRoleFilter(e.target.value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setRoleFilter('');
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  // Helper to format roles
  const renderRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="status-badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', fontWeight: 600 }}>
            Administrator
          </span>
        );
      case 'health_worker':
        return (
          <span className="status-badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', fontWeight: 600 }}>
            Health Worker
          </span>
        );
      case 'village_rep':
        return (
          <span className="status-badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: 600 }}>
            Village Rep
          </span>
        );
      default:
        return (
          <span className="status-badge">
            {role}
          </span>
        );
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Users style={{ color: 'var(--accent-cyan)' }} /> User Directory Management
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            View, search, and audit all registered Asha workers, health officials, and site admins.
          </p>
        </div>
        <button 
          onClick={loadUsers} 
          className="btn-primary" 
          disabled={loading}
          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh Directory
        </button>
      </div>

      {error && (
        <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#f87171', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Filter / Search bar */}
      <form onSubmit={handleFormSubmit} className="glass-card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          <Search size={18} style={{ color: 'var(--accent-cyan)' }} />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Search Registered Users</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'end' }}>
          {/* Query input */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Name or Email</label>
            <input
              type="text"
              placeholder="Search by name, email..."
              className="form-input"
              value={searchInput}
              onChange={handleSearchChange}
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
            />
          </div>

          {/* Role select */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Role</label>
            <select
              className="form-input"
              value={roleFilter}
              onChange={handleRoleChange}
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem', background: 'var(--bg-dark)' }}
            >
              <option value="">All Roles</option>
              <option value="admin">Administrator</option>
              <option value="health_worker">Community Health Worker</option>
              <option value="village_rep">Village Representative</option>
            </select>
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

      {/* Users table */}
      <div className="glass-card" style={{ padding: '1rem' }}>
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <RefreshCw className="animate-spin" size={32} style={{ color: 'var(--accent-cyan)', marginBottom: '0.5rem' }} />
              <p>Retrieving registered users...</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', background: 'rgba(11, 19, 43, 0.4)' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>User Info</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Role</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Village Assigned</th>
                  <th style={{ padding: '0.85rem 1rem' }}>District & State</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Contact</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {!users || users.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>No user accounts found matching query.</p>
                      <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>Adjust search queries or clear role filters.</p>
                    </td>
                  </tr>
                ) : (
                  users.map((item) => {
                    const formattedDate = new Date(item.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    });

                    return (
                      <tr key={item._id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: 600 }}>{item.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.1rem' }}>
                            <Mail size={12} /> {item.email}
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          {renderRoleBadge(item.role)}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 500 }}>
                          {item.villageName || 'N/A'}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          <div>{item.district}</div>
                          <div style={{ fontSize: '0.75rem' }}>{item.state}</div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem' }}>
                          {item.phone ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Phone size={12} style={{ color: 'var(--text-muted)' }} /> {item.phone}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontSize: '0.825rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Calendar size={12} /> {formattedDate}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && users.length > 0 && (
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
              Showing Page <strong style={{ color: 'var(--text-main)' }}>{page}</strong> of <strong style={{ color: 'var(--text-main)' }}>{totalPages}</strong> ({totalCount} total users)
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
