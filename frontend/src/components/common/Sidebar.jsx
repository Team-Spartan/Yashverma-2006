import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, ClipboardPlus, AlertTriangle, Users } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

export default function Sidebar() {
  const { user } = useContext(AuthContext);

  const links = [
    { to: '/', label: 'Overview Dashboard', icon: LayoutDashboard },
    { to: '/test-logs', label: 'Test Records Table', icon: FileText },
    { to: '/log-test', label: 'Log Water Test', icon: ClipboardPlus },
    { to: '/issues', label: 'Reported Issues', icon: AlertTriangle },
  ];

  if (user && user.role === 'admin') {
    links.push({ to: '/users', label: 'User Directory', icon: Users });
  }

  return (
    <aside style={{ width: 260, background: 'rgba(11, 19, 43, 0.95)', borderRight: '1px solid var(--border-color)', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ padding: '0.5rem 1rem', marginBottom: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Navigation Menu
      </div>
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.to}
            to={link.to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.8rem 1rem',
              borderRadius: 'var(--radius-md)',
              color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)',
              background: isActive ? 'rgba(76, 201, 240, 0.1)' : 'transparent',
              textDecoration: 'none',
              fontWeight: isActive ? 600 : 400,
              transition: 'all 0.2s ease'
            })}
          >
            <Icon size={18} />
            <span>{link.label}</span>
          </NavLink>
        );
      })}
    </aside>
  );
}
