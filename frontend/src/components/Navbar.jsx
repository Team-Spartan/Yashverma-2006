import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Droplets, ShieldCheck, Languages, UserCheck, RefreshCw, LogIn, LogOut, Award, Bell, X, CheckCheck, ExternalLink } from 'lucide-react';

export const Navbar = ({ selectedVillage, setSelectedVillage, villages, onOpenAuth, onResetData, notifications = [], unreadCount = 0, onMarkRead, onMarkAllRead, onViewAll }) => {
  const { user, logout, switchRole } = useAuth();
  const { lang, toggleLanguage, t } = useLanguage();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.85rem 1.75rem',
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-color)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      {/* Brand Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 15px rgba(6, 182, 212, 0.4)'
        }}>
          <Droplets size={24} color="#ffffff" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800, background: 'linear-gradient(90deg, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {t('appTitle')}
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            {t('appSubtitle')}
          </p>
        </div>
      </div>

      {/* Village Filter & Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(15, 23, 42, 0.6)', padding: '0.4rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Village Focus:</span>
          <select
            value={selectedVillage}
            onChange={(e) => setSelectedVillage(e.target.value)}
            style={{ background: 'transparent', color: 'var(--text-primary)', border: 'none', outline: 'none', fontWeight: 600, cursor: 'pointer' }}
          >
            <option value="All">All Districts / Villages (Overview)</option>
            {villages.map(v => (
              <option key={v.id} value={v.name}>{v.name} ({v.district})</option>
            ))}
          </select>
        </div>

        {/* Language Toggle */}
        <button
          onClick={toggleLanguage}
          className="btn-secondary"
          style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
          title="Toggle Language (English / Hindi)"
        >
          <Languages size={16} />
          {t('language')}
        </button>

        {/* Reset Data Button */}
        <button
          onClick={onResetData}
          className="btn-secondary"
          style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
          title="Reset sample logs and issues"
        >
          <RefreshCw size={16} />
          Reset Demo
        </button>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="btn-secondary"
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem', position: 'relative' }}
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: '-4px', right: '-4px',
                background: '#ef4444', color: '#fff', fontSize: '0.65rem',
                fontWeight: 800, width: '18px', height: '18px',
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid var(--bg-card)'
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div style={{
              position: 'absolute', right: 0, top: '110%', width: '360px',
              background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
              borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              zIndex: 200, overflow: 'hidden'
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)'
              }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                  Notifications {unreadCount > 0 && <span style={{ color: '#38bdf8' }}>({unreadCount} new)</span>}
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {unreadCount > 0 && (
                    <button onClick={onMarkAllRead} style={{ background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <CheckCheck size={14} /> Mark All Read
                    </button>
                  )}
                  <button onClick={() => setShowNotifDropdown(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                {notifications.filter(n => !n.read).length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <Bell size={24} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                    <div>No new notifications</div>
                  </div>
                ) : (
                  notifications.filter(n => !n.read).slice(0, 5).map(n => (
                    <div
                      key={n.id}
                      onClick={() => { if (onMarkRead) onMarkRead(n.id); }}
                      style={{
                        padding: '0.75rem 1rem', cursor: 'pointer',
                        borderBottom: '1px solid var(--border-color)',
                        background: 'rgba(6,182,212,0.05)',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(6,182,212,0.12)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(6,182,212,0.05)'}
                    >
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.2rem' }}>{n.issueTitle}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{n.message}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', padding: '0.5rem', textAlign: 'center' }}>
                <button
                  onClick={() => { setShowNotifDropdown(false); onViewAll(); }}
                  style={{ background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  <ExternalLink size={14} /> View Notification History
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Role Switcher & User Profile */}
        {user ? (
          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                background: 'rgba(6, 182, 212, 0.12)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <ShieldCheck size={18} color="#06b6d4" />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{user.name}</div>
                <div style={{ fontSize: '0.7rem', color: '#06b6d4', textTransform: 'uppercase', fontWeight: 700 }}>
                  {user.role === 'admin' ? t('roleAdmin') : user.role === 'health_worker' ? t('roleWorker') : t('roleMember')}
                </div>
              </div>
            </div>

            {showRoleDropdown && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: '110%',
                width: '240px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '0.75rem',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                zIndex: 100
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  {t('switchRole')} (Demo Simulation):
                </div>
                <button
                  onClick={() => { switchRole('admin'); setShowRoleDropdown(false); }}
                  style={{ width: '100%', textAlign: 'left', padding: '0.45rem 0.65rem', borderRadius: '6px', background: user.role === 'admin' ? 'rgba(6,182,212,0.2)' : 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.25rem' }}
                >
                  🛡️ Admin / District Officer
                </button>
                <button
                  onClick={() => { switchRole('health_worker'); setShowRoleDropdown(false); }}
                  style={{ width: '100%', textAlign: 'left', padding: '0.45rem 0.65rem', borderRadius: '6px', background: user.role === 'health_worker' ? 'rgba(6,182,212,0.2)' : 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.25rem' }}
                >
                  🩺 Health Worker / Rep
                </button>
                <button
                  onClick={() => { switchRole('community_member'); setShowRoleDropdown(false); }}
                  style={{ width: '100%', textAlign: 'left', padding: '0.45rem 0.65rem', borderRadius: '6px', background: user.role === 'community_member' ? 'rgba(6,182,212,0.2)' : 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.5rem' }}
                >
                  👥 Community Resident
                </button>
                <hr style={{ borderColor: 'var(--border-color)', margin: '0.35rem 0' }} />
                <button
                  onClick={() => { logout(); setShowRoleDropdown(false); }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem 0.65rem', borderRadius: '6px', background: 'rgba(239,68,68,0.15)', border: 'none', color: '#fca5a5', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button onClick={onOpenAuth} className="btn-primary" style={{ padding: '0.5rem 1rem' }}>
            <LogIn size={16} /> Sign In
          </button>
        )}
      </div>
    </header>
  );
};
