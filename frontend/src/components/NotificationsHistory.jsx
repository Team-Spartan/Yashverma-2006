import React, { useState, useEffect, useCallback } from 'react';
import { Bell, X, CheckCheck, Trash2, Loader, Info, AlertTriangle, CheckCircle, AlertOctagon, Filter } from 'lucide-react';

const NOTIFICATION_TYPES = {
  info: { icon: Info, color: '#38bdf8', bg: 'rgba(56,189,248,0.12)' },
  warning: { icon: AlertTriangle, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  success: { icon: CheckCircle, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  error: { icon: AlertOctagon, color: '#ef4444', bg: 'rgba(239,68,68,0.12)' }
};

export const NotificationsHistory = ({ isOpen, onClose, notifications, onFetch, onMarkRead, onMarkAllRead, onDelete, loading }) => {
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (isOpen && onFetch) {
      onFetch();
    }
  }, [isOpen, onFetch]);

  useEffect(() => {
    if (!isOpen) {
      setFilter('all');
    }
  }, [isOpen]);

  const handleMarkAllRead = useCallback(() => {
    if (onMarkAllRead) onMarkAllRead();
  }, [onMarkAllRead]);

  if (!isOpen) return null;

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatTime = (dateStr) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diff = Math.floor((now - d) / 1000);
      if (diff < 60) return 'just now';
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Bell color="#38bdf8" size={22} />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Notifications</h2>
            {unreadCount > 0 && (
              <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '0.15rem 0.45rem', borderRadius: '9999px' }}>
                {unreadCount}
              </span>
            )}
          </div>
          <button onClick={onClose} className="btn-icon" style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '8px', padding: '0.45rem', cursor: 'pointer' }}>
            <X size={20} color="var(--text-secondary)" />
          </button>
        </div>

        <div style={{ padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '0.35rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0.2rem' }}>
            <button
              onClick={() => setFilter('all')}
              style={{
                padding: '0.35rem 0.85rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem',
                background: filter === 'all' ? '#06b6d4' : 'transparent', color: filter === 'all' ? '#fff' : 'var(--text-secondary)'
              }}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              style={{
                padding: '0.35rem 0.85rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem',
                background: filter === 'unread' ? '#06b6d4' : 'transparent', color: filter === 'unread' ? '#fff' : 'var(--text-secondary)'
              }}
            >
              Unread ({unreadCount})
            </button>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="btn-secondary"
              style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <CheckCheck size={15} /> Mark All Read
            </button>
          )}
        </div>

        <div style={{ padding: '1rem 1.5rem', overflowY: 'auto', flex: 1 }}>
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
              <Loader size={28} className="pulse" color="#38bdf8" />
            </div>
          )}

          {!loading && filteredNotifications.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
              <Bell size={40} style={{ opacity: 0.25, marginBottom: '0.75rem' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </h3>
              <p style={{ fontSize: '0.85rem', marginTop: '0.3rem' }}>
                {filter === 'unread' ? 'You\'re all caught up!' : 'Notifications will appear here when issues are reported or updated.'}
              </p>
            </div>
          )}

          {!loading && filteredNotifications.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {filteredNotifications.map(notif => {
                const type = NOTIFICATION_TYPES[notif.type] || NOTIFICATION_TYPES.info;
                const Icon = type.icon;
                return (
                  <div
                    key={notif.id}
                    onClick={() => { if (!notif.read && onMarkRead) onMarkRead(notif.id); }}
                    style={{
                      display: 'flex', gap: '0.85rem', padding: '0.85rem 1rem', borderRadius: '10px', cursor: 'pointer',
                      background: notif.read ? 'var(--bg-primary)' : type.bg,
                      border: notif.read ? '1px solid var(--border-color)' : `1px solid ${type.color}33`,
                      transition: 'all 0.15s', opacity: notif.read ? 0.7 : 1
                    }}
                  >
                    <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: type.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={18} color={type.color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: notif.read ? 500 : 700, color: 'var(--text-primary)', marginBottom: '0.15rem' }}>
                        {notif.title}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>{notif.message}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>{formatTime(notif.createdAt)}</span>
                        {onDelete && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onDelete(notif.id); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.2rem', borderRadius: '4px', opacity: 0.5, transition: 'opacity 0.15s' }}
                            title="Delete notification"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
