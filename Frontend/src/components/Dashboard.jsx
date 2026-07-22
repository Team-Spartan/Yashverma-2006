import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Droplets, LogOut, ShieldCheck, Activity, AlertTriangle, UserCheck, MapPin } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
  const { user, token, logout } = useAuth();

  return (
    <div className="dashboard-container">
      {/* Protected Header Navigation */}
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <Droplets size={24} color="#38bdf8" />
          <span>Jal Suraksha Portal</span>
        </div>

        <div className="nav-user-profile">
          <div className="user-info">
            <span className="user-name">{user?.name || 'Authenticated Representative'}</span>
            <span className="user-role-badge">
              {user?.role?.replace('_', ' ') || 'Village Representative'}
            </span>
          </div>

          <button className="logout-btn" onClick={logout} title="Sign Out">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </nav>

      {/* Protected Dashboard Main Content */}
      <main className="dashboard-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Rural Water Quality Monitoring</h1>
          <p className="dashboard-subtitle">
            Welcome back! Real-time water test logs, contamination alerts, and community reports.
          </p>
        </div>

        {/* JWT Session Information Card */}
        <div className="session-badge-card">
          <div className="session-info-title">
            <ShieldCheck size={20} color="#38bdf8" />
            <span>Active JWT Session Authenticated</span>
          </div>
          <div className="session-details">
            <div>
              <strong>User Email:</strong> {user?.email}
            </div>
            <div>
              <strong>Assigned Village:</strong> {user?.village || 'Rampur Central'}
            </div>
            <div>
              <strong>JWT Status:</strong> <span style={{ color: '#10b981', fontWeight: 600 }}>Active (Stored in LocalStorage)</span>
            </div>
          </div>
        </div>

        {/* Monitoring Overview Metrics */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon water">
              <Droplets size={24} />
            </div>
            <div>
              <div className="metric-label">Water Quality Index</div>
              <div className="metric-val" style={{ color: '#38bdf8' }}>92 / 100</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon ph">
              <Activity size={24} />
            </div>
            <div>
              <div className="metric-label">Average pH Level</div>
              <div className="metric-val" style={{ color: '#10b981' }}>7.2 pH (Optimal)</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon alerts">
              <AlertTriangle size={24} />
            </div>
            <div>
              <div className="metric-label">Active Contamination Alerts</div>
              <div className="metric-val" style={{ color: '#f59e0b' }}>0 Pending</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
