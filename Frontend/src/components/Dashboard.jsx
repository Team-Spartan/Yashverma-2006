import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import { Droplets, LogOut, ShieldCheck, PlusCircle, ListFilter, Users } from 'lucide-react';
import UserRoleManagement from './UserRoleManagement';
import IssueReportingForm from './IssueReportingForm';
import IssueList from './IssueList';
import StatsWidget from './StatsWidget';
import { issueService } from '../services/issueService';
import './Dashboard.css';

export default function Dashboard() {
  const { user, logout } = useAuth();

  // Tab navigation state: 'report-form' | 'stats' | 'reports' | 'user-roles'
  const [activeTab, setActiveTab] = useState('report-form');

  // Issues state
  const [issues, setIssues] = useState([]);
  const [loadingIssues, setLoadingIssues] = useState(true);

  // Fetch initial issues list
  const loadIssues = async () => {
    setLoadingIssues(true);
    try {
      const data = await issueService.getIssues();
      setIssues(data);
    } catch (err) {
      console.error('Failed to load issues:', err);
    } finally {
      setLoadingIssues(false);
    }
  };

  useEffect(() => {
    loadIssues();
  }, []);

  // Callback when a new issue is reported via form
  const handleIssueCreated = (newIssue) => {
    setIssues((prev) => [newIssue, ...prev]);
    // Switch tab to view the live list feed
    setActiveTab('reports');
  };

  // Callback when an issue is deleted
  const handleIssueDeleted = (deletedId) => {
    setIssues((prev) => prev.filter((i) => (i._id || i.id) !== deletedId));
  };

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
            Welcome back! Real-time water test logs, contamination alerts, summary statistics, and community reports.
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

        {/* Primary Statistics Widget Component displaying summary values */}
        <StatsWidget issues={issues} onRefresh={loadIssues} />

        {/* Section Navigation Tabs */}
        <div className="dashboard-tabs">
          <button
            className={`tab-btn ${activeTab === 'report-form' ? 'active' : ''}`}
            onClick={() => setActiveTab('report-form')}
          >
            <PlusCircle size={18} />
            <span>Report Water Issue</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <ListFilter size={18} />
            <span>View All Reports ({issues.length})</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'user-roles' ? 'active' : ''}`}
            onClick={() => setActiveTab('user-roles')}
          >
            <Users size={18} />
            <span>User Role Management</span>
          </button>
        </div>

        {/* Tab 1: Issue Reporting Form */}
        {activeTab === 'report-form' && (
          <div>
            <IssueReportingForm onIssueCreated={handleIssueCreated} />
            <IssueList
              issues={issues}
              loading={loadingIssues}
              onIssueDeleted={handleIssueDeleted}
            />
          </div>
        )}

        {/* Tab 2: Issue List Feed */}
        {activeTab === 'reports' && (
          <IssueList
            issues={issues}
            loading={loadingIssues}
            onIssueDeleted={handleIssueDeleted}
          />
        )}

        {/* Tab 3: User Role Management Panel */}
        {activeTab === 'user-roles' && (
          <UserRoleManagement />
        )}
      </main>
    </div>
  );
}
