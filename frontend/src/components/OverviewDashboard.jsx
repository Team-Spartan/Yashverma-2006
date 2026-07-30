import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { TestTube, ShieldCheck, AlertTriangle, Activity, CheckCircle2, XCircle, ArrowUpRight, MapPin, Eye } from 'lucide-react';

export const OverviewDashboard = ({ stats, waterLogs, issues, villages, onNavigateTab, onSelectLog, onSelectIssue }) => {
  const { t } = useLanguage();

  const safeLogs = waterLogs.filter(l => l.safetyStatus === 'Safe').length;
  const warningLogs = waterLogs.filter(l => l.safetyStatus === 'Warning').length;
  const hazardousLogs = waterLogs.filter(l => l.safetyStatus === 'Hazardous').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Banner */}
      <div className="glass-panel" style={{
        padding: '1.5rem',
        background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(59,130,246,0.15))',
        borderColor: 'rgba(6,182,212,0.3)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Rural Jal Suraksha Surveillance Network
          </span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.2rem' }}>
            Real-time Village Water Quality & Health Monitor
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '680px', marginTop: '0.25rem' }}>
            Empowering village representatives and district health officials with automated Water Quality Indexing (BIS IS 10500), swift contamination alerts, and data-backed interventions.
          </p>
        </div>

        {/* WQI Speedometer Gauge Meter */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          background: 'rgba(15, 23, 42, 0.7)',
          padding: '0.85rem 1.25rem',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: stats.avgWQI > 75 ? '#10b981' : stats.avgWQI > 50 ? '#f59e0b' : '#ef4444' }}>
              {stats.avgWQI} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>/ 100</span>
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>REGIONAL WQI INDEX</div>
          </div>
          <Activity size={32} color={stats.avgWQI > 75 ? '#10b981' : '#f59e0b'} className="pulse" />
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid-metrics">
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TestTube size={24} color="#3b82f6" />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{stats.totalLogs}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{t('totalLogs')}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={24} color="#10b981" />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981' }}>{stats.safePercentage}%</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{t('safeWaterPct')}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={24} color="#ef4444" />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ef4444' }}>{stats.pendingIssues}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{t('pendingIssues')}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MapPin size={24} color="#f59e0b" />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{villages.length}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Villages Monitored</div>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Logs Summary + Active Issues */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        
        {/* Recent Water Tests Section */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recent Water Test Logs</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Latest parameter recordings by health workers</p>
            </div>
            <button
              onClick={() => onNavigateTab('logs')}
              style={{ background: 'transparent', border: 'none', color: '#38bdf8', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
            >
              View All <ArrowUpRight size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {waterLogs.slice(0, 4).map((log) => (
              <div
                key={log.id}
                style={{
                  background: 'rgba(15, 23, 42, 0.5)',
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{log.sourceName}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>• {log.village}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                    pH: <strong>{log.pH}</strong> | TDS: <strong>{log.tds} ppm</strong> | Turbidity: <strong>{log.turbidity} NTU</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className={`badge badge-${log.safetyStatus.toLowerCase()}`}>
                    {log.safetyStatus}
                  </span>
                  <button
                    onClick={() => onSelectLog(log)}
                    style={{ background: 'rgba(255,255,255,0.08)', border: 'none', padding: '0.35rem', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-primary)' }}
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Urgent Contamination Alerts Section */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fca5a5' }}>Active Contamination Alerts</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Incidents requiring urgent municipal intervention</p>
            </div>
            <button
              onClick={() => onNavigateTab('issues')}
              style={{ background: 'transparent', border: 'none', color: '#fca5a5', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
            >
              Manage Issues <ArrowUpRight size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {issues.filter(i => i.status !== 'Resolved').slice(0, 4).map((issue) => (
              <div
                key={issue.id}
                style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f8fafc' }}>{issue.title}</span>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    background: issue.severity === 'Critical' ? '#ef4444' : '#f59e0b',
                    color: '#ffffff'
                  }}>
                    {issue.severity}
                  </span>
                </div>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
                  {issue.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  <span>📍 {issue.village} ({issue.locationDetails})</span>
                  <span style={{ color: '#38bdf8', fontWeight: 600 }}>Status: {issue.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Villages Health Summary Matrix */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.85rem' }}>
          Monitored Village Water Health Status
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {villages.map(v => {
            const vilLogs = waterLogs.filter(l => l.village.toLowerCase() === v.name.toLowerCase());
            const safeVilLogs = vilLogs.filter(l => l.safetyStatus === 'Safe').length;
            const healthPct = vilLogs.length > 0 ? Math.round((safeVilLogs / vilLogs.length) * 100) : 100;
            return (
              <div
                key={v.id}
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  padding: '1rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{v.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{v.district} District</div>

                <div style={{ marginTop: '0.65rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Water Safety:</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: healthPct >= 80 ? '#10b981' : healthPct >= 50 ? '#f59e0b' : '#ef4444' }}>
                    {healthPct}% Safe
                  </span>
                </div>

                {/* Mini progress bar */}
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', marginTop: '0.4rem', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${healthPct}%`, background: healthPct >= 80 ? '#10b981' : healthPct >= 50 ? '#f59e0b' : '#ef4444' }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
