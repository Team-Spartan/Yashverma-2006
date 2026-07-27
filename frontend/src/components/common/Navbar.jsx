import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Droplet, User, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="glass-card" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Droplet style={{ color: 'var(--accent-cyan)', width: 28, height: 28 }} />
        <h2 style={{ fontSize: '1.25rem' }}>
          Jal<span className="title-gradient">Drishti</span>
        </h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {user ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User style={{ color: 'var(--text-muted)', width: 18, height: 18 }} />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.villageName} ({user.role})</div>
              </div>
            </div>
            <button onClick={logout} className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', background: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
              <LogOut size={16} /> Logout
            </button>
          </>
        ) : (
          <a href="/login" className="btn-primary" style={{ textDecoration: 'none' }}>
            Login / Register
          </a>
        )}
      </div>
    </header>
  );
}
