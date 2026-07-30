import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { LayoutDashboard, TestTube2, AlertTriangle, LineChart, Shield, Info, PlusCircle, AlertOctagon, Bell } from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab, onOpenAddLog, onOpenReportIssue }) => {
  const { t } = useLanguage();

  const navItems = [
    { id: 'overview', label: t('overview'), icon: LayoutDashboard },
    { id: 'logs', label: t('waterLogs'), icon: TestTube2 },
    { id: 'issues', label: t('issueReports'), icon: AlertTriangle },
    { id: 'trends', label: t('trends'), icon: LineChart },
    { id: 'admin', label: t('adminPanel'), icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'brand', label: t('brandDetails'), icon: Info }
  ];

  return (
    <aside style={{
      width: '260px',
      background: 'var(--bg-card)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '1.25rem 0.85rem',
      minHeight: 'calc(100vh - 70px)'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <div style={{ padding: '0 0.75rem 0.75rem 0.75rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Navigation Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: 'none',
                background: isActive ? 'linear-gradient(90deg, rgba(6,182,212,0.25), rgba(59,130,246,0.15))' : 'transparent',
                color: isActive ? '#38bdf8' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.9rem',
                cursor: 'pointer',
                textAlign: 'left',
                borderLeft: isActive ? '3px solid #06b6d4' : '3px solid transparent',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={20} color={isActive ? '#38bdf8' : 'var(--text-secondary)'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Quick Action Cards in Sidebar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '1.5rem', padding: '0.5rem' }}>
        <button
          onClick={onOpenAddLog}
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem', padding: '0.65rem' }}
        >
          <PlusCircle size={18} />
          {t('addLog')}
        </button>

        <button
          onClick={onOpenReportIssue}
          style={{
            width: '100%',
            justifyContent: 'center',
            fontSize: '0.85rem',
            padding: '0.65rem',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <AlertOctagon size={18} />
          {t('reportIssue')}
        </button>
      </div>
    </aside>
  );
};
