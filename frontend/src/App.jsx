import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import { useLanguage } from './context/LanguageContext.jsx';
import { api } from './services/api';
import { Navbar } from './components/Navbar.jsx';
import { Sidebar } from './components/Sidebar.jsx';
import { OverviewDashboard } from './components/OverviewDashboard.jsx';
import { WaterLogsTable } from './components/WaterLogsTable.jsx';
import { WaterLogModal } from './components/WaterLogModal.jsx';
import { IssueReportList } from './components/IssueReportList.jsx';
import { IssueReportModal } from './components/IssueReportModal.jsx';
import { TrendVisualization } from './components/TrendVisualization.jsx';
import { AdminDashboard } from './components/AdminDashboard.jsx';
import { BrandView } from './components/BrandView.jsx';
import { AuthModal } from './components/AuthModal.jsx';
import { NotificationsHistory } from './components/NotificationsHistory.jsx';

export function App() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedVillage, setSelectedVillage] = useState('All');

  const [waterLogs, setWaterLogs] = useState([]);
  const [villages, setVillages] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [stats, setStats] = useState({
    totalLogs: 0, safeCount: 0, safePercentage: 0,
    pendingIssues: 0, avgWQI: 80
  });
  const [trendsData, setTrendsData] = useState({
    monthlyData: [
      { month: 'Jan 2026', avgpH: 7.3, avgTDS: 340 },
      { month: 'Feb 2026', avgpH: 7.4, avgTDS: 355 },
      { month: 'Mar 2026', avgpH: 7.2, avgTDS: 390 },
      { month: 'Apr 2026', avgpH: 7.1, avgTDS: 420 },
      { month: 'May 2026', avgpH: 6.9, avgTDS: 460 },
      { month: 'Jun 2026', avgpH: 6.8, avgTDS: 495 },
      { month: 'Jul 2026', avgpH: 7.2, avgTDS: 430 }
    ]
  });

  const [issues, setIssues] = useState([]);
  const [issuesLoading, setIssuesLoading] = useState(false);
  const [issuesError, setIssuesError] = useState(null);
  const [issuesPage, setIssuesPage] = useState(1);
  const [issuesTotalPages, setIssuesTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNotifHistoryOpen, setIsNotifHistoryOpen] = useState(false);
  const [isLogSubmitting, setIsLogSubmitting] = useState(false);
  const [isNotifLoading, setIsNotifLoading] = useState(false);

  // Admin dashboard state
  const [adminData, setAdminData] = useState(null);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState(null);
  const [adminTimeRange, setAdminTimeRange] = useState(30);
  const [adminGranularity, setAdminGranularity] = useState('daily');

  const fetchIssues = useCallback(async (page = 1, status = statusFilter, severity = severityFilter) => {
    setIssuesLoading(true);
    setIssuesError(null);
    const params = { page, limit: 6 };
    if (status !== 'All') params.status = status;
    if (severity !== 'All') params.severity = severity;
    const res = await api.getIssues(params);
    if (res.success) {
      setIssues(res.data);
      setIssuesTotalPages(res.totalPages || 1);
      setIssuesPage(res.page || 1);
    } else {
      setIssuesError(res.message || 'Failed to load issues');
    }
    setIssuesLoading(false);
  }, [statusFilter, severityFilter]);

  const fetchAllData = useCallback(async () => {
    const [logsRes, vilRes, statsRes, trendsRes, usersRes, notifRes] = await Promise.all([
      api.getWaterLogs(),
      api.getVillages(),
      api.getDashboardStats(),
      api.getTrends(),
      api.getUsers(),
      api.getNotifications()
    ]);
    if (logsRes.success) setWaterLogs(logsRes.data);
    if (vilRes.success) setVillages(vilRes.data);
    if (statsRes.success) setStats(statsRes.data);
    if (trendsRes.success) setTrendsData(trendsRes.data);
    if (usersRes.success) setUsersList(usersRes.data);
    if (notifRes.success) {
      setNotifications(notifRes.data);
      setUnreadCount(notifRes.data.filter(n => !n.read).length);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    const res = await api.getNotifications(true);
    if (res.success) setUnreadCount(res.count);
  }, []);

  const fetchNotifications = useCallback(async () => {
    setIsNotifLoading(true);
    const res = await api.getNotifications();
    if (res.success) {
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.read).length);
    }
    setIsNotifLoading(false);
  }, []);

  const fetchAdminData = useCallback(async (range) => {
    setAdminLoading(true);
    setAdminError(null);
    try {
      const res = await api.getAdminActivityStats({ days: range || adminTimeRange });
      if (res.success) {
        setAdminData(res.data);
      } else {
        setAdminError(res.message || 'Failed to load analytics');
      }
    } catch (err) {
      setAdminError(err.message || 'Failed to load analytics');
    }
    setAdminLoading(false);
  }, [adminTimeRange]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    fetchIssues(1, statusFilter, severityFilter);
  }, [statusFilter, severityFilter, fetchIssues]);

  const handleIssuePageChange = (page) => {
    setIssuesPage(page);
    fetchIssues(page, statusFilter, severityFilter);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setIssuesPage(1);
  };

  const handleSeverityFilterChange = (severity) => {
    setSeverityFilter(severity);
    setIssuesPage(1);
  };

  const handleSaveLog = async (logData) => {
    setIsLogSubmitting(true);
    let res = await api.createWaterLog(logData);
    if (!res.success) {
      setIsLogSubmitting(false);
      throw new Error(res.message || 'Failed to save water test log');
    }
    setIsLogSubmitting(false);
    fetchAllData();
  };

  const handleDeleteLog = async (id) => {
    if (window.confirm("Are you sure you want to delete this water test log?")) {
      await api.deleteWaterLog(id);
      fetchAllData();
    }
  };

  const handleSaveIssue = async (issueData) => {
    await api.createIssue(issueData);
    setIsIssueModalOpen(false);
    fetchAllData();
    fetchUnreadCount();
  };

  const handleUpdateIssueStatus = async (id, status) => {
    const res = await api.updateIssue(id, { status });
    if (!res.success) throw new Error(res.message || 'Failed to update status');
    fetchAllData();
    fetchUnreadCount();
  };

  const handleMarkNotificationRead = async (id) => {
    await api.markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleDeleteNotification = async (id) => {
    await api.deleteNotification(id);
    setNotifications(prev => {
      const filtered = prev.filter(n => n.id !== id);
      setUnreadCount(filtered.filter(n => !n.read).length);
      return filtered;
    });
  };

  const handleDeleteIssue = async (id) => {
    if (window.confirm("Are you sure you want to delete this issue report?")) {
      await api.deleteIssue(id);
      fetchAllData();
    }
  };

  const handleResetData = async () => {
    if (window.confirm("Reset all test logs and issues to default demonstration data?")) {
      await api.resetData();
      fetchAllData();
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)' }}>
      <Navbar
        selectedVillage={selectedVillage}
        setSelectedVillage={setSelectedVillage}
        villages={villages}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onResetData={handleResetData}
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkRead={handleMarkNotificationRead}
        onMarkAllRead={handleMarkAllRead}
        onViewAll={() => setIsNotifHistoryOpen(true)}
      />

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAddLog={() => { setIsLogModalOpen(true); }}
          onOpenReportIssue={() => setIsIssueModalOpen(true)}
        />

        <main style={{ flex: 1, padding: '1.75rem 2rem', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
          {activeTab === 'overview' && (
            <OverviewDashboard
              stats={stats}
              waterLogs={waterLogs}
              issues={issues}
              villages={villages}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onSelectLog={(log) => { setIsLogModalOpen(true); }}
              onSelectIssue={() => setActiveTab('issues')}
            />
          )}

          {activeTab === 'logs' && (
            <WaterLogsTable
              waterLogs={waterLogs}
              onOpenAddModal={() => { setIsLogModalOpen(true); }}
              onDeleteLog={handleDeleteLog}
            />
          )}

          {activeTab === 'issues' && (
            <IssueReportList
              issues={issues}
              onOpenReportModal={() => setIsIssueModalOpen(true)}
              onUpdateStatus={handleUpdateIssueStatus}
              onDeleteIssue={handleDeleteIssue}
              loading={issuesLoading}
              error={issuesError}
              onRetry={() => fetchIssues(issuesPage, statusFilter, severityFilter)}
              page={issuesPage}
              totalPages={issuesTotalPages}
              onPageChange={handleIssuePageChange}
              statusFilter={statusFilter}
              severityFilter={severityFilter}
              onStatusFilterChange={handleStatusFilterChange}
              onSeverityFilterChange={handleSeverityFilterChange}
            />
          )}

          {activeTab === 'trends' && (
            <TrendVisualization
              trendsData={trendsData}
              waterLogs={waterLogs}
              issues={issues}
              villages={villages}
            />
          )}

          {activeTab === 'admin' && (
            <AdminDashboard
              data={adminData}
              loading={adminLoading}
              error={adminError}
              onFetch={(days) => fetchAdminData(days)}
              timeRange={adminTimeRange}
              onTimeRangeChange={(val) => { setAdminTimeRange(val); }}
              granularity={adminGranularity}
              onGranularityChange={(val) => { setAdminGranularity(val); }}
            />
          )}

          {activeTab === 'brand' && (
            <BrandView />
          )}
        </main>
      </div>

      <WaterLogModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onSubmit={handleSaveLog}
        submitting={isLogSubmitting}
      />

      <IssueReportModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        onSave={handleSaveIssue}
        user={user}
        villages={villages}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode="login"
      />

      <NotificationsHistory
        isOpen={isNotifHistoryOpen}
        onClose={() => setIsNotifHistoryOpen(false)}
        notifications={notifications}
        onFetch={fetchNotifications}
        onMarkRead={handleMarkNotificationRead}
        onMarkAllRead={handleMarkAllRead}
        onDelete={handleDeleteNotification}
        loading={isNotifLoading}
      />
    </div>
  );
}
