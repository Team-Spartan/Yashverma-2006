import React, { useState, useEffect, useCallback, useRef } from 'react';
import WaterQualityChart, { PARAMETER_CONFIG } from '../components/WaterQualityChart';
import { waterTestAPI, adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const REFRESH_INTERVALS = [
  { label: 'Off', value: 0 },
  { label: '30s', value: 30000 },
  { label: '1m', value: 60000 },
  { label: '5m', value: 300000 },
];

const WaterTrends = () => {
  const { user } = useAuth();
  const [village, setVillage] = useState(user?.village || '');
  const [villages, setVillages] = useState([]);
  const [months, setMonths] = useState(6);
  const [selectedParams, setSelectedParams] = useState(['ph', 'tds']);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(0);
  const timerRef = useRef(null);

  const fetchVillages = async () => {
    try {
      const res = await adminAPI.getVillages();
      const names = res.data.villages.map((v) => v.village).filter(Boolean);
      setVillages(names);
    } catch {
      try {
        const dashRes = await adminAPI.getDashboard();
        setVillages(dashRes.data.stats.villages || []);
      } catch {
        if (!village) setVillages([]);
      }
    }
  };

  const fetchTrends = useCallback(async () => {
    try {
      setError('');
      const params = { months };
      if (village) params.village = village;
      const res = await waterTestAPI.getTrends(params);
      setTrends(res.data.trends);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load trend data');
      setTrends([]);
    }
  }, [village, months]);

  useEffect(() => {
    fetchVillages();
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchTrends().finally(() => setLoading(false));
  }, [fetchTrends]);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (refreshInterval > 0) {
      timerRef.current = setInterval(() => {
        fetchTrends();
      }, refreshInterval);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [refreshInterval, fetchTrends]);

  const toggleParam = (paramKey) => {
    setSelectedParams((prev) => {
      if (prev.includes(paramKey)) {
        return prev.length > 1 ? prev.filter((p) => p !== paramKey) : prev;
      }
      return [...prev, paramKey];
    });
  };

  const computeStats = () => {
    if (trends.length === 0) return null;

    const totals = trends.reduce(
      (acc, t) => ({
        count: acc.count + (t.count || 0),
        safe: acc.safe + (t.safeCount || 0),
        caution: acc.caution + (t.cautionCount || 0),
        unsafe: acc.unsafe + (t.unsafeCount || 0),
      }),
      { count: 0, safe: 0, caution: 0, unsafe: 0 }
    );

    const avgPh = trends.reduce((s, t) => s + (t.avgPh || 0), 0) / trends.length;
    const avgTds = trends.reduce((s, t) => s + (t.avgTds || 0), 0) / trends.length;
    const avgTurb = trends.reduce((s, t) => s + (t.avgTurbidity || 0), 0) / trends.length;
    const avgChlorine = trends.reduce((s, t) => s + (t.avgChlorine || 0), 0) / trends.length;

    return {
      totalTests: totals.count,
      safeTests: totals.safe,
      safetyRate: totals.count > 0 ? ((totals.safe / totals.count) * 100).toFixed(1) : 0,
      avgPh: avgPh.toFixed(2),
      avgTds: avgTds.toFixed(0),
      avgTurbidity: avgTurb.toFixed(2),
      avgChlorine: avgChlorine.toFixed(2),
    };
  };

  const stats = computeStats();

  return (
    <div>
      <div className="page-header">
        <h1>Water Quality Trends</h1>
        <p>Track and analyze water quality parameters over time</p>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <h2>Chart Controls</h2>
          {lastUpdated && (
            <span className="wq-last-updated">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>

        <div className="wq-controls">
          <div className="wq-control-group">
            <label className="wq-control-label">Village</label>
            <select
              className="form-control"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              disabled={user?.role !== 'admin' && user?.role !== 'official'}
            >
              {user?.role !== 'admin' && user?.role !== 'official' && (
                <option value={user?.village}>{user?.village}</option>
              )}
              {villages.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          <div className="wq-control-group">
            <label className="wq-control-label">Time Range</label>
            <select
              className="form-control"
              value={months}
              onChange={(e) => setMonths(parseInt(e.target.value))}
            >
              <option value={3}>Last 3 months</option>
              <option value={6}>Last 6 months</option>
              <option value={12}>Last 12 months</option>
              <option value={24}>Last 24 months</option>
              <option value={36}>Last 36 months</option>
            </select>
          </div>

          <div className="wq-control-group">
            <label className="wq-control-label">Auto Refresh</label>
            <select
              className="form-control"
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
            >
              {REFRESH_INTERVALS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="wq-control-group">
            <button
              className="btn btn-primary"
              onClick={() => {
                setLoading(true);
                fetchTrends().finally(() => setLoading(false));
              }}
            >
              &#8635; Refresh Now
            </button>
          </div>
        </div>

        <div className="wq-param-toggles">
          <label className="wq-control-label">Parameters</label>
          <div className="wq-param-buttons">
            {Object.entries(PARAMETER_CONFIG).map(([key, config]) => {
              const isActive = selectedParams.includes(key);
              return (
                <button
                  key={key}
                  className={`wq-param-btn ${isActive ? 'active' : ''}`}
                  style={{
                    '--param-color': config.color,
                    borderColor: isActive ? config.color : 'var(--border)',
                    background: isActive ? `${config.color}10` : 'white',
                  }}
                  onClick={() => toggleParam(key)}
                >
                  <span className="wq-param-dot" style={{ background: config.color }} />
                  {config.label}
                  {config.unit && <span className="wq-param-unit">({config.unit})</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <h2>Trend Analysis</h2>
          {village && <span className="wq-village-badge">{village}</span>}
        </div>
        <WaterQualityChart
          trends={trends}
          parameters={selectedParams}
          height={380}
          loading={loading}
          error=""
          emptyMessage={`No water quality data found for the selected period${village ? ` in ${village}` : ''}`}
        />
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">&#128202;</div>
            <div className="stat-value">{stats.totalTests}</div>
            <div className="stat-label">Total Tests</div>
          </div>
          <div className="stat-card safe">
            <div className="stat-icon">&#9989;</div>
            <div className="stat-value">{stats.safetyRate}%</div>
            <div className="stat-label">Safety Rate</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">&#128167;</div>
            <div className="stat-value">{stats.avgPh}</div>
            <div className="stat-label">Avg pH</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">&#9879;&#65039;</div>
            <div className="stat-value">{stats.avgTds}</div>
            <div className="stat-label">Avg TDS (ppm)</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">&#128166;</div>
            <div className="stat-value">{stats.avgTurbidity}</div>
            <div className="stat-label">Avg Turbidity (NTU)</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">&#9986;</div>
            <div className="stat-value">{stats.avgChlorine}</div>
            <div className="stat-label">Avg Chlorine (mg/L)</div>
          </div>
        </div>
      )}

      {trends.length > 0 && (
        <div className="card" style={{ marginTop: 24 }}>
          <div className="card-header">
            <h2>Monthly Breakdown</h2>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Tests</th>
                  <th>Avg pH</th>
                  <th>Avg TDS (ppm)</th>
                  <th>Avg Turbidity (NTU)</th>
                  <th>Avg Chlorine (mg/L)</th>
                  <th>Safe</th>
                  <th>Caution</th>
                  <th>Unsafe</th>
                </tr>
              </thead>
              <tbody>
                {trends.map((t, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 500 }}>
                      {t._id?.month ? `${MONTHS[t._id.month - 1]} ${t._id.year}` : `${t.month ? MONTHS[t.month - 1] : '?'} ${t.year || ''}`}
                    </td>
                    <td>{t.count || 0}</td>
                    <td>{t.avgPh != null ? t.avgPh.toFixed(2) : '-'}</td>
                    <td>{t.avgTds != null ? Math.round(t.avgTds) : '-'}</td>
                    <td>{t.avgTurbidity != null ? t.avgTurbidity.toFixed(2) : '-'}</td>
                    <td>{t.avgChlorine != null ? t.avgChlorine.toFixed(2) : '-'}</td>
                    <td><span className="badge badge-safe">{t.safeCount || 0}</span></td>
                    <td><span className="badge badge-caution">{t.cautionCount || 0}</span></td>
                    <td><span className="badge badge-unsafe">{t.unsafeCount || 0}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default WaterTrends;
