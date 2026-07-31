import React, { useState, useEffect, useCallback } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { waterTestAPI, adminAPI } from '../services/api';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler
);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const VILLAGE_COLORS = [
  { border: '#0077b6', bg: 'rgba(0,119,182,0.15)' },
  { border: '#ae2012', bg: 'rgba(174,32,18,0.15)' },
  { border: '#2d6a4f', bg: 'rgba(45,106,79,0.15)' },
  { border: '#e09f3e', bg: 'rgba(224,159,62,0.15)' },
  { border: '#7b2cbf', bg: 'rgba(123,44,191,0.15)' },
];

const VillageComparison = () => {
  const [availableVillages, setAvailableVillages] = useState([]);
  const [selectedVillages, setSelectedVillages] = useState([]);
  const [monthRange, setMonthRange] = useState(6);
  const [villageData, setVillageData] = useState({});
  const [loading, setLoading] = useState(false);
  const [villagesLoading, setVillagesLoading] = useState(true);
  const [error, setError] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchVillages = async () => {
      try {
        const res = await adminAPI.getVillages();
        const names = res.data.villages.map((v) => v.village).filter(Boolean);
        setAvailableVillages(names);
      } catch (err) {
        try {
          const dashRes = await adminAPI.getDashboard();
          setAvailableVillages(dashRes.data.stats.villages || []);
        } catch {
          setError('Failed to load villages');
        }
      }
      setVillagesLoading(false);
    };
    fetchVillages();
  }, []);

  const fetchComparison = useCallback(async () => {
    if (selectedVillages.length === 0) {
      setVillageData({});
      return;
    }

    setLoading(true);
    setError('');
    try {
      const params = {
        villages: selectedVillages.join(','),
        months: monthRange,
      };
      const res = await waterTestAPI.compare(params);
      setVillageData(res.data.villageData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch comparison data');
      setVillageData({});
    }
    setLoading(false);
  }, [selectedVillages, monthRange]);

  useEffect(() => {
    fetchComparison();
  }, [fetchComparison]);

  const toggleVillage = (village) => {
    setSelectedVillages((prev) =>
      prev.includes(village)
        ? prev.filter((v) => v !== village)
        : prev.length < 5
          ? [...prev, village]
          : prev
    );
  };

  const removeVillage = (village) => {
    setSelectedVillages((prev) => prev.filter((v) => v !== village));
  };

  const selectAll = () => {
    setSelectedVillages(availableVillages.slice(0, 5));
  };

  const clearAll = () => {
    setSelectedVillages([]);
  };

  const buildTimeLabels = () => {
    const now = new Date();
    const labels = [];
    for (let i = monthRange - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push({ year: d.getFullYear(), month: d.getMonth() + 1, label: `${MONTHS[d.getMonth()]} ${d.getFullYear()}` });
    }
    return labels;
  };

  const mergeData = (metric) => {
    const labels = buildTimeLabels();
    const labelStrings = labels.map((l) => l.label);

    const datasets = selectedVillages.map((village, idx) => {
      const color = VILLAGE_COLORS[idx % VILLAGE_COLORS.length];
      const villagePoints = villageData[village] || [];

      const pointMap = {};
      villagePoints.forEach((p) => {
        const key = `${p.year}-${p.month}`;
        pointMap[key] = p[metric];
      });

      const data = labels.map((l) => {
        const val = pointMap[`${l.year}-${l.month}`];
        return val != null ? (metric === 'avgTds' || metric === 'count' ? Math.round(val) : parseFloat(val.toFixed(2))) : null;
      });

      return {
        label: village,
        data,
        borderColor: color.border,
        backgroundColor: color.bg,
        fill: false,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        spanGaps: false,
      };
    });

    return { labels: labelStrings, datasets };
  };

  const chartOptions = (title, yLabel) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { usePointStyle: true, padding: 16 },
      },
      title: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (ctx) => ctx.parsed.y != null ? `${ctx.dataset.label}: ${ctx.parsed.y} ${yLabel}` : `${ctx.dataset.label}: No data`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: title !== 'pH',
        title: { display: true, text: yLabel },
      },
      x: {
        title: { display: true, text: 'Month' },
      },
    },
    interaction: { mode: 'nearest', axis: 'x', intersect: false },
  });

  const buildSafetyRateData = () => {
    const labels = buildTimeLabels();
    const labelStrings = labels.map((l) => l.label);

    const datasets = selectedVillages.map((village, idx) => {
      const color = VILLAGE_COLORS[idx % VILLAGE_COLORS.length];
      const villagePoints = villageData[village] || [];

      const pointMap = {};
      villagePoints.forEach((p) => {
        const key = `${p.year}-${p.month}`;
        const total = p.safeCount + p.cautionCount + p.unsafeCount;
        pointMap[key] = total > 0 ? parseFloat(((p.safeCount / total) * 100).toFixed(1)) : null;
      });

      const data = labels.map((l) => pointMap[`${l.year}-${l.month}`] ?? null);

      return {
        label: village,
        data,
        borderColor: color.border,
        backgroundColor: color.bg,
        fill: false,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        spanGaps: false,
      };
    });

    return { labels: labelStrings, datasets };
  };

  const buildTestCountData = () => {
    const labels = buildTimeLabels();
    const labelStrings = labels.map((l) => l.label);

    const datasets = selectedVillages.map((village, idx) => {
      const color = VILLAGE_COLORS[idx % VILLAGE_COLORS.length];
      const villagePoints = villageData[village] || [];

      const pointMap = {};
      villagePoints.forEach((p) => {
        const key = `${p.year}-${p.month}`;
        pointMap[key] = p.count;
      });

      const data = labels.map((l) => pointMap[`${l.year}-${l.month}`] ?? null);

      return {
        label: village,
        data,
        backgroundColor: color.border,
        borderColor: color.border,
        borderWidth: 1,
      };
    });

    return { labels: labelStrings, datasets };
  };

  const hasData = selectedVillages.length > 0 && Object.values(villageData).some((arr) => arr.length > 0);

  return (
    <div>
      <div className="page-header">
        <h1>Village Comparison</h1>
        <p>Compare water quality trends across multiple villages</p>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <h2>Select Villages to Compare</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-sm btn-secondary" onClick={selectAll} disabled={villagesLoading}>
              Select All
            </button>
            <button className="btn btn-sm btn-secondary" onClick={clearAll} disabled={selectedVillages.length === 0}>
              Clear All
            </button>
          </div>
        </div>

        <div className="village-selector">
          <div className="village-dropdown-wrapper" ref={dropdownRef}>
            <button
              className={`village-dropdown-trigger ${dropdownOpen ? 'open' : ''}`}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              disabled={villagesLoading}
            >
              {villagesLoading
                ? 'Loading villages...'
                : selectedVillages.length === 0
                  ? 'Choose villages...'
                  : `${selectedVillages.length} village${selectedVillages.length > 1 ? 'es' : ''} selected`
              }
              <span className="dropdown-arrow">&#9662;</span>
            </button>

            {dropdownOpen && (
              <div className="village-dropdown-menu">
                {availableVillages.length === 0 ? (
                  <div className="dropdown-empty">No villages available</div>
                ) : (
                  availableVillages.map((village) => {
                    const isSelected = selectedVillages.includes(village);
                    const isDisabled = !isSelected && selectedVillages.length >= 5;
                    return (
                      <button
                        key={village}
                        className={`dropdown-item ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                        onClick={() => !isDisabled && toggleVillage(village)}
                        disabled={isDisabled}
                      >
                        <span className={`checkbox ${isSelected ? 'checked' : ''}`}>
                          {isSelected && '✓'}
                        </span>
                        {village}
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>

          <div className="filter-bar" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Time Range:</label>
            <select
              className="form-control"
              value={monthRange}
              onChange={(e) => setMonthRange(parseInt(e.target.value))}
              style={{ width: 'auto', minWidth: 120 }}
            >
              <option value={3}>Last 3 months</option>
              <option value={6}>Last 6 months</option>
              <option value={12}>Last 12 months</option>
              <option value={24}>Last 24 months</option>
            </select>
          </div>
        </div>

        {selectedVillages.length > 0 && (
          <div className="selected-villages">
            {selectedVillages.map((village, idx) => (
              <span key={village} className="village-tag" style={{ borderColor: VILLAGE_COLORS[idx % VILLAGE_COLORS.length].border }}>
                <span className="tag-dot" style={{ background: VILLAGE_COLORS[idx % VILLAGE_COLORS.length].border }} />
                {village}
                <button className="tag-remove" onClick={() => removeVillage(village)}>&times;</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {selectedVillages.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">&#128202;</div>
            <h3>No Villages Selected</h3>
            <p>Select at least one village from the dropdown above to start comparing water quality data.</p>
          </div>
        </div>
      ) : loading ? (
        <div className="loading-screen" style={{ height: 300 }}>
          <div className="spinner" />
        </div>
      ) : hasData ? (
        <>
          <div className="charts-grid">
            <div className="card">
              <div className="card-header">
                <h2>Average pH Comparison</h2>
              </div>
              <div className="chart-container">
                <Line data={mergeData('avgPh')} options={chartOptions('pH', 'pH Level')} />
              </div>
            </div>
            <div className="card">
              <div className="card-header">
                <h2>Average TDS Comparison</h2>
              </div>
              <div className="chart-container">
                <Line data={mergeData('avgTds')} options={chartOptions('TDS', 'TDS (ppm)')} />
              </div>
            </div>
          </div>

          <div className="charts-grid">
            <div className="card">
              <div className="card-header">
                <h2>Safety Rate Trend</h2>
              </div>
              <div className="chart-container">
                <Line data={buildSafetyRateData()} options={chartOptions('Safety', '% Safe Tests')} />
              </div>
            </div>
            <div className="card">
              <div className="card-header">
                <h2>Average Turbidity Comparison</h2>
              </div>
              <div className="chart-container">
                <Line data={mergeData('avgTurbidity')} options={chartOptions('Turbidity', 'Turbidity (NTU)')} />
              </div>
            </div>
          </div>

          <div className="charts-grid">
            <div className="card">
              <div className="card-header">
                <h2>Average Chlorine Level</h2>
              </div>
              <div className="chart-container">
                <Line data={mergeData('avgChlorine')} options={chartOptions('Chlorine', 'Chlorine (mg/L)')} />
              </div>
            </div>
            <div className="card">
              <div className="card-header">
                <h2>Monthly Test Volume</h2>
              </div>
              <div className="chart-container">
                <Bar
                  data={buildTestCountData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'bottom', labels: { usePointStyle: true, padding: 16 } },
                    },
                    scales: {
                      y: { beginAtZero: true, title: { display: true, text: 'Number of Tests' } },
                      x: { title: { display: true, text: 'Month' } },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: 24 }}>
            <div className="card-header">
              <h2>Summary Comparison</h2>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Village</th>
                    <th>Total Tests</th>
                    <th>Avg pH</th>
                    <th>Avg TDS (ppm)</th>
                    <th>Avg Turbidity (NTU)</th>
                    <th>Safety Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedVillages.map((village, idx) => {
                    const data = villageData[village] || [];
                    if (data.length === 0) {
                      return (
                        <tr key={village}>
                          <td>
                            <span className="tag-dot" style={{ background: VILLAGE_COLORS[idx % VILLAGE_COLORS.length].border, display: 'inline-block', width: 8, height: 8, borderRadius: '50%', marginRight: 8 }} />
                            {village}
                          </td>
                          <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No data available</td>
                        </tr>
                      );
                    }

                    const totalTests = data.reduce((s, d) => s + d.count, 0);
                    const totalSafe = data.reduce((s, d) => s + d.safeCount, 0);
                    const avgPh = data.reduce((s, d) => s + (d.avgPh || 0), 0) / data.length;
                    const avgTds = data.reduce((s, d) => s + (d.avgTds || 0), 0) / data.length;
                    const avgTurb = data.reduce((s, d) => s + (d.avgTurbidity || 0), 0) / data.length;
                    const safetyRate = totalTests > 0 ? ((totalSafe / totalTests) * 100).toFixed(1) : 0;

                    return (
                      <tr key={village}>
                        <td>
                          <span className="tag-dot" style={{ background: VILLAGE_COLORS[idx % VILLAGE_COLORS.length].border, display: 'inline-block', width: 8, height: 8, borderRadius: '50%', marginRight: 8 }} />
                          {village}
                        </td>
                        <td>{totalTests}</td>
                        <td>{avgPh.toFixed(2)}</td>
                        <td>{avgTds.toFixed(0)}</td>
                        <td>{avgTurb.toFixed(2)}</td>
                        <td>
                          <span className={`badge ${parseFloat(safetyRate) >= 80 ? 'badge-safe' : parseFloat(safetyRate) >= 50 ? 'badge-caution' : 'badge-unsafe'}`}>
                            {safetyRate}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">&#128269;</div>
            <h3>No Data Found</h3>
            <p>No water quality data exists for the selected villages in the chosen time range. Try selecting different villages or expanding the time range.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VillageComparison;
