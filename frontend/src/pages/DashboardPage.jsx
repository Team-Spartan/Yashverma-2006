import React, { useEffect, useState } from 'react';
import WaterQualityStats from '../components/dashboard/WaterQualityStats';
import ContaminationChart from '../components/dashboard/ContaminationChart';
import { fetchDashboardAnalytics, fetchWaterLogs } from '../services/waterLogService';

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const analyticsRes = await fetchDashboardAnalytics();
        setSummary(analyticsRes.summary);
        setTrends(analyticsRes.recentTrends || []);

        const logsRes = await fetchWaterLogs({ limit: 5 });
        setRecentLogs(logsRes.data || []);
      } catch (err) {
        console.error('[DashboardPage Error]', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading real-time village metrics...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.8rem' }}>Rural Water Quality Real-Time Dashboard</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          Monitoring community water sources, contamination flags, and field lab results.
        </p>
      </div>

      <WaterQualityStats summary={summary} />
      <ContaminationChart trends={trends} />

      <div className="glass-card">
        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Recent Water Quality Tests Logged</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Source / Village</th>
                <th style={{ padding: '0.75rem 1rem' }}>pH</th>
                <th style={{ padding: '0.75rem 1rem' }}>Turbidity (NTU)</th>
                <th style={{ padding: '0.75rem 1rem' }}>TDS (mg/L)</th>
                <th style={{ padding: '0.75rem 1rem' }}>Calculated WQI</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.map((log) => (
                <tr key={log._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                    {log.waterSource?.name || 'Village Handpump'} ({log.villageName})
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>{log.parameters?.ph}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{log.parameters?.turbidity}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{log.parameters?.tds}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{log.calculatedWQI} / 100</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span className={`status-badge badge-${log.qualityStatus.toLowerCase()}`}>
                      {log.qualityStatus}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
                    {new Date(log.testDate).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
