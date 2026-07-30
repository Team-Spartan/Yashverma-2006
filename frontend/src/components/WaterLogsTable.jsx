import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Plus, Search, Filter, Edit, Trash2, TestTube2, AlertCircle, CheckCircle } from 'lucide-react';

export const WaterLogsTable = ({ waterLogs, onOpenAddModal, onEditLog, onDeleteLog }) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [safetyFilter, setSafetyFilter] = useState('All');

  const filteredLogs = waterLogs.filter(log => {
    const matchesSearch = log.sourceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.testedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSafety = safetyFilter === 'All' || log.safetyStatus.toLowerCase() === safetyFilter.toLowerCase();
    return matchesSearch && matchesSafety;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <TestTube2 color="#06b6d4" />
            Water Quality Testing Logs
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Record, update, and manage chemical and biological test data for village drinking water sources.
          </p>
        </div>

        <button onClick={onOpenAddModal} className="btn-primary">
          <Plus size={18} />
          {t('addLog')}
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '0.85rem 1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ flex: 1, minWidth: '220px', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(15,23,42,0.6)', padding: '0.45rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <Search size={18} color="var(--text-secondary)" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', width: '100%', fontSize: '0.88rem' }}
          />
        </div>

        {/* Safety Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} color="var(--text-secondary)" />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Status:</span>
          <select
            value={safetyFilter}
            onChange={(e) => setSafetyFilter(e.target.value)}
            style={{ background: 'rgba(15,23,42,0.6)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '0.45rem 0.75rem', borderRadius: '8px', outline: 'none', fontWeight: 600, cursor: 'pointer' }}
          >
            <option value="All">All Statuses</option>
            <option value="Safe">Safe Drinking Water</option>
            <option value="Warning">Warning (Needs Treatment)</option>
            <option value="Hazardous">Hazardous (Contaminated)</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="glass-panel data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Water Source</th>
              <th>Village / District</th>
              <th>pH Level</th>
              <th>TDS (ppm)</th>
              <th>Turbidity</th>
              <th>Fluoride / Nitrate</th>
              <th>WQI Score</th>
              <th>Safety Status</th>
              <th>Tested By & Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No water quality test records match the current filter.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{log.sourceName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.sourceType}</div>
                  </td>
                  <td>
                    <div>{log.village}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.district}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: (log.pH < 6.5 || log.pH > 8.5) ? '#ef4444' : '#10b981' }}>
                      {log.pH}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: log.tds > 500 ? '#f59e0b' : '#10b981' }}>
                      {log.tds}
                    </span>
                  </td>
                  <td>{log.turbidity} NTU</td>
                  <td>
                    <div style={{ fontSize: '0.8rem' }}>
                      F: <strong style={{ color: log.fluoride > 1.5 ? '#ef4444' : 'inherit' }}>{log.fluoride}</strong> mg/L
                    </div>
                    <div style={{ fontSize: '0.8rem' }}>
                      N: <strong style={{ color: log.nitrate > 45 ? '#ef4444' : 'inherit' }}>{log.nitrate}</strong> mg/L
                    </div>
                  </td>
                  <td>
                    <div style={{
                      fontWeight: 800,
                      fontSize: '1rem',
                      color: log.wqiScore >= 80 ? '#10b981' : log.wqiScore >= 50 ? '#f59e0b' : '#ef4444'
                    }}>
                      {log.wqiScore} / 100
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${log.safetyStatus.toLowerCase()}`}>
                      {log.safetyStatus}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.82rem' }}>{log.testedBy}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.testedDate}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        onClick={() => onEditLog(log)}
                        style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa', padding: '0.35rem 0.55rem', borderRadius: '6px', cursor: 'pointer' }}
                        title="Edit Log"
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        onClick={() => onDeleteLog(log.id)}
                        style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '0.35rem 0.55rem', borderRadius: '6px', cursor: 'pointer' }}
                        title="Delete Log"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
