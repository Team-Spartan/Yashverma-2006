import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { waterTestAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, ArcElement,
  PointElement, LineElement, Title, Tooltip, Legend, Filler
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, trendsRes] = await Promise.all([
          waterTestAPI.getStats(),
          waterTestAPI.getTrends({ months: 6 }),
        ]);
        setStats(statsRes.data.stats);
        setTrends(trendsRes.data.trends);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="loading-screen"><div className="spinner" /></div>;
  }

  const safetyData = stats ? {
    labels: ['Safe', 'Caution', 'Unsafe'],
    datasets: [{
      data: [stats.safeTests, stats.cautionTests, stats.unsafeTests],
      backgroundColor: ['#2d6a4f', '#e09f3e', '#ae2012'],
      borderWidth: 0,
    }],
  } : null;

  const trendData = trends.length > 0 ? {
    labels: trends.map((t) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[t._id.month - 1]} ${t._id.year}`;
    }),
    datasets: [
      {
        label: 'Avg pH',
        data: trends.map((t) => t.avgPh?.toFixed(2)),
        borderColor: '#0077b6',
        backgroundColor: 'rgba(0,119,182,0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Avg TDS (ppm)',
        data: trends.map((t) => t.avgTds?.toFixed(0)),
        borderColor: '#ae2012',
        backgroundColor: 'rgba(174,32,18,0.1)',
        fill: false,
        tension: 0.4,
        yAxisID: 'y1',
      },
    ],
  } : null;

  const sourceData = stats?.sourceBreakdown?.length > 0 ? {
    labels: stats.sourceBreakdown.map((s) => s._id.charAt(0).toUpperCase() + s._id.slice(1)),
    datasets: [{
      data: stats.sourceBreakdown.map((s) => s.count),
      backgroundColor: ['#0077b6', '#00b4d8', '#023e8a', '#90e0ef', '#48cae4', '#ade8f4'],
    }],
  } : null;

  return (
    <div>
      <div className="page-header">
        <h1>Welcome back, {user?.name}</h1>
        <p>{user?.village} - Water Quality Overview</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">&#128167;</div>
          <div className="stat-value">{stats?.totalTests || 0}</div>
          <div className="stat-label">Total Tests</div>
        </div>
        <div className="stat-card safe">
          <div className="stat-icon">&#9989;</div>
          <div className="stat-value">{stats?.safetyRate || 0}%</div>
          <div className="stat-label">Safety Rate</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon">&#9888;&#65039;</div>
          <div className="stat-value">{stats?.cautionTests || 0}</div>
          <div className="stat-label">Caution Alerts</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-icon">&#10060;</div>
          <div className="stat-value">{stats?.unsafeTests || 0}</div>
          <div className="stat-label">Unsafe Tests</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="card">
          <div className="card-header">
            <h2>Water Quality Trends</h2>
          </div>
          <div className="chart-container">
            {trendData ? (
              <Line
                data={trendData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: { beginAtZero: true, position: 'left' },
                    y1: { beginAtZero: true, position: 'right', grid: { drawOnChartArea: false } },
                  },
                  plugins: { legend: { position: 'bottom' } },
                }}
              />
            ) : (
              <div className="empty-state"><p>No trend data available</p></div>
            )}
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h2>Safety Distribution</h2>
          </div>
          <div className="chart-container">
            {safetyData ? (
              <Doughnut
                data={safetyData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom' } },
                }}
              />
            ) : (
              <div className="empty-state"><p>No data available</p></div>
            )}
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="card">
          <div className="card-header">
            <h2>Tests by Source</h2>
          </div>
          <div className="chart-container">
            {sourceData ? (
              <Bar
                data={sourceData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                }}
              />
            ) : (
              <div className="empty-state"><p>No source data available</p></div>
            )}
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h2>Monthly Test Volume</h2>
          </div>
          <div className="chart-container">
            {trends.length > 0 ? (
              <Bar
                data={{
                  labels: trends.map((t) => {
                    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    return `${months[t._id.month - 1]}`;
                  }),
                  datasets: [
                    { label: 'Safe', data: trends.map((t) => t.safeCount), backgroundColor: '#2d6a4f' },
                    { label: 'Caution', data: trends.map((t) => t.cautionCount), backgroundColor: '#e09f3e' },
                    { label: 'Unsafe', data: trends.map((t) => t.unsafeCount), backgroundColor: '#ae2012' },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: { x: { stacked: true }, y: { stacked: true } },
                  plugins: { legend: { position: 'bottom' } },
                }}
              />
            ) : (
              <div className="empty-state"><p>No data available</p></div>
            )}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-header">
          <h2>Recent Test Results</h2>
          <Link to="/water-tests" className="btn btn-sm btn-primary">View All</Link>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Source</th>
                <th>pH</th>
                <th>TDS</th>
                <th>Status</th>
                <th>Tested By</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentTests?.map((test) => (
                <tr key={test._id}>
                  <td>{new Date(test.testDate).toLocaleDateString()}</td>
                  <td>{test.sourceName}</td>
                  <td>{test.ph ?? '-'}</td>
                  <td>{test.tds ? `${test.tds} ppm` : '-'}</td>
                  <td><span className={`badge badge-${test.overallStatus}`}>{test.overallStatus}</span></td>
                  <td>{test.userId?.name || 'Unknown'}</td>
                </tr>
              ))}
              {(!stats?.recentTests || stats.recentTests.length === 0) && (
                <tr><td colSpan="6" style={{ textAlign: 'center' }}>No tests recorded yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
