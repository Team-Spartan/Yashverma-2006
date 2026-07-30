import React, { useState, useEffect, useRef } from 'react';
import { BarChart3, Calendar, Loader, AlertCircle, RefreshCw } from 'lucide-react';

const GRAINULARITIES = {
  daily: { label: 'Daily', days: 7 },
  weekly: { label: 'Weekly', days: 30 },
  monthly: { label: 'Monthly', days: 90 }
};

export const AdminDashboard = ({ data, loading, error, onFetch, timeRange = 30, onTimeRangeChange, granularity = 'daily', onGranularityChange }) => {
  const chartRef = useRef(null);
  const [chartWidth, setChartWidth] = useState(400);

  useEffect(() => {
    if (chartRef.current) {
      setChartWidth(chartRef.current.offsetWidth);
    }
    const handleResize = () => {
      if (chartRef.current) setChartWidth(chartRef.current.offsetWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (typeof onFetch === 'function') {
      onFetch(timeRange);
    }
  }, [timeRange, onFetch]);

  const safeData = {
    signups: data?.signups || [],
    submissions: data?.submissions || [],
    roleDistribution: data?.roleDistribution || [],
    totalUsers: data?.totalUsers || 0,
    totalSubmissions: data?.totalSubmissions || 0,
    activeUsers: data?.activeUsers || 0,
    issuesResolved: data?.issuesResolved || 0
  };

  const renderBarChart = (dataset, label, color, height = 200) => {
    if (!dataset || dataset.length === 0) return null;
    const maxVal = Math.max(...dataset.map(d => d.value || 0), 1);
    const barWidth = Math.max(8, Math.min(28, (chartWidth - 60) / dataset.length - 4));

    return (
      <div style={{ width: '100%', height: `${height + 40}px`, position: 'relative' }}>
        <svg width="100%" height={height + 40} style={{ overflow: 'visible' }}>
          {[0.25, 0.5, 0.75].map(f => (
            <line key={f} x1="0" y1={height * (1 - f)} x2={chartWidth - 10} y2={height * (1 - f)} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          ))}
          {dataset.map((d, i) => {
            const x = 10 + i * (barWidth + 4);
            const barH = (d.value / maxVal) * height;
            return (
              <g key={i}>
                <rect
                  x={x} y={height - barH} width={barWidth} height={barH}
                  fill={color} rx="3"
                  opacity={0.85}
                >
                  <title>{d.label}: {d.value}</title>
                </rect>
                <text
                  x={x + barWidth / 2} y={height + 14}
                  textAnchor="end" transform={`rotate(-45, ${x + barWidth / 2}, ${height + 14})`}
                  fill="#94a3b8" fontSize="9"
                >
                  {d.label.length > 6 ? d.label.slice(0, 6) + '..' : d.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  const renderDoughnut = () => {
    const dist = safeData.roleDistribution;
    if (!dist || dist.length === 0) return <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No role data available</p>;
    const total = dist.reduce((sum, r) => sum + (r.value || 0), 0);
    if (total === 0) return <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No role data available</p>;
    const colors = ['#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];
    let cumulative = 0;
    const cx = 120, cy = 120, r = 90, sw = 30;
    const segments = dist.map((d, i) => {
      const pct = d.value / total;
      const startAngle = cumulative * 2 * Math.PI - Math.PI / 2;
      cumulative += pct;
      const endAngle = cumulative * 2 * Math.PI - Math.PI / 2;
      const x1 = cx + r * Math.cos(startAngle);
      const y1 = cy + r * Math.sin(startAngle);
      const x2 = cx + r * Math.cos(endAngle);
      const y2 = cy + r * Math.sin(endAngle);
      const largeArc = pct > 0.5 ? 1 : 0;
      return { d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`, color: colors[i % colors.length], label: d.label, pct: (pct * 100).toFixed(1) };
    });
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <svg width={240} height={240} viewBox="0 0 240 240">
          {segments.map((s, i) => <path key={i} d={s.d} fill={s.color} opacity="0.85" stroke="#0f172a" strokeWidth="2" />)}
          <circle cx={cx} cy={cy} r={50} fill="#0f172a" />
          <text x={cx} y={cy - 6} textAnchor="middle" fill="#fff" fontSize="28" fontWeight="800">{total}</text>
          <text x={cx} y={cy + 16} textAnchor="middle" fill="#94a3b8" fontSize="11">Total Users</text>
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {segments.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: s.color, flexShrink: 0 }} />
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{s.label}</span>
              <span style={{ color: 'var(--text-muted)', marginLeft: 'auto' }}>{s.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (error && !loading) {
    return (
      <div style={{ padding: '1rem' }}>
        <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', borderColor: 'rgba(239,68,68,0.3)' }}>
          <AlertCircle size={40} color="#ef4444" style={{ marginBottom: '0.75rem', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fca5a5', marginBottom: '0.5rem' }}>Failed to Load Analytics</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{error}</p>
          <button onClick={() => onFetch(timeRange)} className="btn-primary" style={{ justifyContent: 'center' }}>
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <BarChart3 color="#06b6d4" />
            System Activity Visualization
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Analytics dashboard for user registrations, water test submissions, and system-wide activity trends.
          </p>
        </div>
        <div ref={chartRef} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0.2rem' }}>
            {Object.entries(GRAINULARITIES).map(([key, val]) => (
              <button
                key={key}
                onClick={() => onGranularityChange(key)}
                style={{
                  padding: '0.35rem 0.75rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem',
                  background: granularity === key ? '#06b6d4' : 'transparent', color: granularity === key ? '#fff' : 'var(--text-secondary)'
                }}
              >
                {val.label}
              </button>
            ))}
          </div>
          <select
            value={timeRange}
            onChange={(e) => onTimeRangeChange(Number(e.target.value))}
            style={{ background: 'rgba(15,23,42,0.6)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '0.4rem 0.75rem', borderRadius: '8px', outline: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.82rem' }}
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={180}>Last 6 months</option>
            <option value={365}>Last year</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
        <div className="glass-panel" style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Total Users</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#06b6d4' }}>{loading ? '-' : safeData.totalUsers}</div>
        </div>
        <div className="glass-panel" style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Total Submissions</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#10b981' }}>{loading ? '-' : safeData.totalSubmissions}</div>
        </div>
        <div className="glass-panel" style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Active Users (30d)</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#f59e0b' }}>{loading ? '-' : safeData.activeUsers}</div>
        </div>
        <div className="glass-panel" style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Issues Resolved</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#10b981' }}>{loading ? '-' : safeData.issuesResolved}</div>
        </div>
      </div>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <Loader size={32} className="pulse" color="#38bdf8" />
        </div>
      )}

      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.25rem' }}>
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={16} /> User Signups
            </h3>
            {safeData.signups.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>No signup data for this period</p>
            ) : renderBarChart(safeData.signups, 'Signups', '#f59e0b')}
          </div>
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={16} /> Water Test Submissions
            </h3>
            {safeData.submissions.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>No submission data for this period</p>
            ) : renderBarChart(safeData.submissions, 'Submissions', '#10b981')}
          </div>
        </div>
      )}

      {!loading && (
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={16} /> User Role Distribution
          </h3>
          {renderDoughnut()}
        </div>
      )}
    </div>
  );
};
