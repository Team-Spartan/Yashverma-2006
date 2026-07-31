import React from 'react';
import { ShieldCheck, AlertTriangle, Droplet } from 'lucide-react';

export default function WaterTestTable({ logs = [], loading = false }) {
  if (loading) {
    return (
      <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <Droplet className="animate-spin" size={32} style={{ color: 'var(--accent-cyan)', marginBottom: '0.5rem' }} />
        <p>Retrieving community water test records...</p>
      </div>
    );
  }

  const isEmpty = !logs || logs.length === 0;

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', background: 'rgba(11, 19, 43, 0.4)' }}>
            <th style={{ padding: '0.85rem 1rem' }}>Test Date</th>
            <th style={{ padding: '0.85rem 1rem' }}>Water Source / Location</th>
            <th style={{ padding: '0.85rem 1rem' }}>pH</th>
            <th style={{ padding: '0.85rem 1rem' }}>Turbidity (NTU)</th>
            <th style={{ padding: '0.85rem 1rem' }}>TDS (mg/L)</th>
            <th style={{ padding: '0.85rem 1rem' }}>Nitrates / Fluoride</th>
            <th style={{ padding: '0.85rem 1rem' }}>E. Coli</th>
            <th style={{ padding: '0.85rem 1rem' }}>WQI Score</th>
            <th style={{ padding: '0.85rem 1rem' }}>Status</th>
            <th style={{ padding: '0.85rem 1rem' }}>Logged By</th>
          </tr>
        </thead>
        <tbody>
          {isEmpty ? (
            <tr>
              <td colSpan={10} style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '1.10rem', fontWeight: 500 }}>No water quality test records available.</p>
                <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>Submit a new test log or adjust your search filter.</p>
              </td>
            </tr>
          ) : (
            logs.map((log) => {
              const formattedDate = new Date(log.testDate || log.createdAt).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              });

              const sourceName = log.waterSource?.name || 'Village Handpump';
              const sourceType = log.waterSource?.sourceType ? log.waterSource.sourceType.replace('_', ' ') : 'Handpump';

              return (
                <tr key={log._id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap', fontWeight: 500 }}>
                    {formattedDate}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ fontWeight: 600 }}>{sourceName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                      {sourceType} • {log.villageName}
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: log.parameters?.ph < 6.5 || log.parameters?.ph > 8.5 ? '#f87171' : 'inherit' }}>
                    {log.parameters?.ph ?? 'N/A'}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    {log.parameters?.turbidity ?? 'N/A'}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    {log.parameters?.tds ?? 'N/A'}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                    N: {log.parameters?.nitrates ?? 0} | F: {log.parameters?.fluoride ?? 0}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    {log.parameters?.eColiPresent ? (
                      <span style={{ color: '#f87171', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                        <AlertTriangle size={14} /> DETECTED
                      </span>
                    ) : (
                      <span style={{ color: '#34d399', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                        <ShieldCheck size={14} /> Absent
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, fontSize: '0.95rem' }}>
                    {log.calculatedWQI} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ 100</span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span className={`status-badge badge-${log.qualityStatus ? log.qualityStatus.toLowerCase() : 'good'}`}>
                      {log.qualityStatus}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                    {log.testedBy?.name || 'Community Worker'}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
