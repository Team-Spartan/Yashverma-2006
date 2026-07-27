import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { loginUser } from '../services/authService';
import { Droplet, LogIn } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { loginSuccess } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await loginUser({ email, password });
      loginSuccess(res.token, res.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-card" style={{ width: 420, padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Droplet size={40} style={{ color: 'var(--accent-cyan)', marginBottom: '0.5rem' }} />
          <h2 style={{ fontSize: '1.6rem' }}>Portal Sign In</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
            Village Representative & Health Worker Portal
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', color: '#f87171', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Registered Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="ramesh@village.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
            <LogIn size={18} /> {loading ? 'Signing in...' : 'Sign In to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
