import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend, Filler);

const AdminPanel = () => {
  const [dashboard, setDashboard] = useState(null);
  const [villages, setVillages] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, villageRes, userRes] = await Promise.all([
          adminAPI.getDashboard(),
          adminAPI.getVillages(),
          adminAPI.getUsers({ limit: 50 }),
        ]);
        setDashboard(dashRes.data);
        setVillages(villageRes.data.villages);
        setUsers(userRes.data.users);
      } catch (err) {
        console.error('Failed to load admin data:', err);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleToggleUser = async (userId) => {
    try {
      const res = await adminAPI.toggleUserStatus(userId);
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId
            ? { ...u, isActive: !u.isActive }
            : u
        )
      );
      showToast(res.data.message);
    } catch (err) {
      showToast('Failed to update user', 'error');
    }
  };

  if (loading) {
    return <div className="loading-screen"><div className="spinner" /></div>;
  }

  const villageChartData = villages.slice(0, 10).map((v) => ({
    label: v.village,
    safetyRate: parseFloat(v.safetyRate),
    tests: v.totalTests,
    openIssues: v.openIssues,
  }));

  return (
    <div>
      <div className="page-header">
        <h1>Admin Panel</h1>
        <p>Manage villages, users, and oversee water quality across the region</p>
      </div>

      <div className="filter-bar">
        <button
          className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`btn ${activeTab === 'villages' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('villages')}
        >
          Villages
        </button>
        <button
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
      </div>

      {activeTab === 'overview' && dashboard && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">&#127968;</div>
              <div className="stat-value">{dashboard.stats.villageCount}</div>
              <div className="stat-label">Villages</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">&#128101;</div>
              <div className="stat-value">{dashboard.stats.totalUsers}</div>
              <div className="stat-label">Active Users</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">&#128167;</div>
              <div className="stat-value">{dashboard.stats.totalTests}</div>
              <div className="stat-label">Total Tests</div>
            </div>
            <div className="stat-card danger">
              <div className="stat-icon">&#9888;&#65039;</div>
              <div className="stat-value">{dashboard.stats.openIssues}</div>
              <div className="stat-label">Open Issues</div>
            </div>
            <div className="stat-card warning">
              <div className="stat-icon">&#10060;</div>
              <div className="stat-value">{dashboard.stats.unsafeTests}</div>
              <div className="stat-label">Unsafe Tests</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">&#128202;</div>
              <div className="stat-value">{dashboard.stats.totalIssues}</div>
              <div className="stat-label">Total Issues</div>
            </div>
          </div>

          <div className="charts-grid">
            <div className="card">
              <div className="card-header">
                <h2>Village Safety Rates</h2>
              </div>
              <div className="chart-container">
                {villageChartData.length > 0 ? (
                  <Bar
                    data={{
                      labels: villageChartData.map((v) => v.label),
                      datasets: [{
                        label: 'Safety Rate %',
                        data: villageChartData.map((v) => v.safetyRate),
                        backgroundColor: villageChartData.map((v) =>
                          v.safetyRate >= 80 ? '#2d6a4f' : v.safetyRate >= 50 ? '#e09f3e' : '#ae2012'
                        ),
                      }],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: { y: { beginAtZero: true, max: 100 } },
                      plugins: { legend: { display: false } },
                    }}
                  />
                ) : (
                  <div className="empty-state"><p>No village data</p></div>
                )}
              </div>
            </div>
            <div className="card">
              <div className="card-header">
                <h2>Issues by Village</h2>
              </div>
              <div className="chart-container">
                {villageChartData.filter((v) => v.openIssues > 0).length > 0 ? (
                  <Bar
                    data={{
                      labels: villageChartData.filter((v) => v.openIssues > 0).map((v) => v.label),
                      datasets: [{
                        label: 'Open Issues',
                        data: villageChartData.filter((v) => v.openIssues > 0).map((v) => v.openIssues),
                        backgroundColor: '#ae2012',
                      }],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                    }}
                  />
                ) : (
                  <div className="empty-state"><p>No open issues</p></div>
                )}
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: 24 }}>
            <div className="card-header">
              <h2>Recent Reports</h2>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Source</th>
                    <th>Village</th>
                    <th>pH</th>
                    <th>Status</th>
                    <th>Tested By</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.recentTests?.map((test) => (
                    <tr key={test._id}>
                      <td>{new Date(test.testDate).toLocaleDateString()}</td>
                      <td>{test.sourceName}</td>
                      <td>{test.village}</td>
                      <td>{test.ph ?? '-'}</td>
                      <td><span className={`badge badge-${test.overallStatus}`}>{test.overallStatus}</span></td>
                      <td>{test.userId?.name || 'Unknown'}</td>
                    </tr>
                  ))}
                  {(!dashboard.recentTests || dashboard.recentTests.length === 0) && (
                    <tr><td colSpan="6" style={{ textAlign: 'center' }}>No recent tests</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'villages' && (
        <div className="card">
          <div className="card-header">
            <h2>Village Overview</h2>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Village</th>
                  <th>Total Tests</th>
                  <th>Avg pH</th>
                  <th>Avg TDS</th>
                  <th>Safety Rate</th>
                  <th>Unsafe</th>
                  <th>Open Issues</th>
                  <th>Critical</th>
                  <th>Last Test</th>
                </tr>
              </thead>
              <tbody>
                {villages.map((v) => (
                  <tr key={v.village}>
                    <td><strong>{v.village}</strong></td>
                    <td>{v.totalTests}</td>
                    <td>{v.avgPh ?? '-'}</td>
                    <td>{v.avgTds ? `${v.avgTds} ppm` : '-'}</td>
                    <td>
                      <span className={`badge ${parseFloat(v.safetyRate) >= 80 ? 'badge-safe' : parseFloat(v.safetyRate) >= 50 ? 'badge-caution' : 'badge-unsafe'}`}>
                        {v.safetyRate}%
                      </span>
                    </td>
                    <td>{v.unsafeCount}</td>
                    <td>{v.openIssues}</td>
                    <td>{v.criticalIssues > 0 ? <span className="badge badge-unsafe">{v.criticalIssues}</span> : 0}</td>
                    <td>{v.lastTest ? new Date(v.lastTest).toLocaleDateString() : 'Never'}</td>
                  </tr>
                ))}
                {villages.length === 0 && (
                  <tr><td colSpan="9" style={{ textAlign: 'center' }}>No village data available</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="card">
          <div className="card-header">
            <h2>Users</h2>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Village</th>
                  <th>District</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td style={{ textTransform: 'capitalize' }}>{u.role?.replace('_', ' ')}</td>
                    <td>{u.village}</td>
                    <td>{u.district || '-'}</td>
                    <td>
                      <span className={`badge ${u.isActive ? 'badge-safe' : 'badge-unsafe'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => handleToggleUser(u._id)}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan="7" style={{ textAlign: 'center' }}>No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
};

export default AdminPanel;
