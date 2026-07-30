import React, { useState, useEffect } from 'react';
import { X, User, KeyRound, Loader, CheckCircle, AlertTriangle, Mail, Phone, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const initialForm = {
  name: '', email: '', mobile: '', password: '', confirmPassword: '', role: 'viewer'
};

const validateField = (field, value, formData = {}) => {
  switch (field) {
    case 'name':
      return value.trim().length < 2 ? 'Name must be at least 2 characters' : '';
    case 'email':
      return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Enter a valid email address' : '';
    case 'mobile':
      return !/^[6-9]\d{9}$/.test(value) ? 'Enter a valid 10-digit Indian mobile number' : '';
    case 'password':
      return value.length < 6 ? 'Password must be at least 6 characters' : '';
    case 'confirmPassword':
      return value !== formData.password ? 'Passwords do not match' : '';
    case 'role':
      return '';
    default:
      return '';
  }
};

export const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [formData, setFormData] = useState(initialForm);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setFormData(initialForm);
      setTouched({});
      setErrors({});
      setError('');
      setSuccess(false);
    }
  }, [isOpen, initialMode]);

  const resetState = () => {
    setFormData(initialForm);
    setTouched({});
    setErrors({});
    setError('');
    setSuccess(false);
  };

  const switchMode = () => {
    resetState();
    setMode(prev => prev === 'login' ? 'register' : 'login');
  };

  if (!isOpen) return null;

  const handleChange = (field) => (e) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, [field]: val }));
    if (touched[field]) {
      const err = validateField(field, val, { ...formData, [field]: val });
      setErrors(prev => ({ ...prev, [field]: err }));
    }
  };

  const handleBlur = (field) => () => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const err = validateField(field, formData[field], formData);
    setErrors(prev => ({ ...prev, [field]: err }));
  };

  const validateAll = () => {
    const fields = mode === 'register'
      ? ['name', 'email', 'mobile', 'password', 'confirmPassword']
      : ['email', 'password'];
    const newTouched = {};
    const newErrors = {};
    let valid = true;
    fields.forEach(f => { newTouched[f] = true; });
    setTouched(newTouched);
    fields.forEach(f => {
      const err = validateField(f, formData[f], formData);
      if (err) valid = false;
      newErrors[f] = err;
    });
    setErrors(prev => ({ ...prev, ...newErrors }));
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateAll()) return;
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(formData.email, formData.password);
        setSuccess(true);
        setTimeout(onClose, 800);
      } else {
        const { name, email, mobile, password, role } = formData;
        await register(name, email, password, role, '', '', mobile);
        setSuccess(true);
        setTimeout(() => {
          resetState();
          setMode('login');
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Authentication failed. Please try again.');
    }
    setSubmitting(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div className="modal-header" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {mode === 'login' ? <KeyRound color="#38bdf8" size={22} /> : <User color="#38bdf8" size={22} />}
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{mode === 'login' ? 'Sign In' : 'Register'}</h2>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '8px', padding: '0.45rem', cursor: 'pointer' }}>
            <X size={20} color="var(--text-secondary)" />
          </button>
        </div>

        <div style={{ padding: '1.25rem 1.5rem 1.5rem' }}>
          {success && (
            <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', padding: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CheckCircle size={22} color="#10b981" />
              <span style={{ fontWeight: 700, color: '#6ee7b7' }}>
                {mode === 'login' ? 'Signed in successfully!' : 'Account created! Redirecting to sign in...'}
              </span>
            </div>
          )}

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <AlertTriangle size={22} color="#ef4444" />
              <span style={{ fontWeight: 600, color: '#fca5a5' }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <>
                <div className="form-group">
                  <label><User size={14} /> Full Name</label>
                  <input
                    type="text" value={formData.name} onChange={handleChange('name')} onBlur={handleBlur('name')}
                    placeholder="e.g., V. Suresh" disabled={submitting}
                    style={{ borderColor: touched.name && errors.name ? '#ef4444' : undefined }}
                  />
                  {touched.name && errors.name && <p className="field-error">{errors.name}</p>}
                </div>
                <div className="form-group">
                  <label><Phone size={14} /> Mobile Number</label>
                  <input
                    type="tel" value={formData.mobile} onChange={handleChange('mobile')} onBlur={handleBlur('mobile')}
                    placeholder="e.g., 9876543210" maxLength={10} disabled={submitting}
                    style={{ borderColor: touched.mobile && errors.mobile ? '#ef4444' : undefined }}
                  />
                  {touched.mobile && errors.mobile && <p className="field-error">{errors.mobile}</p>}
                </div>
                <div className="form-group">
                  <label><Shield size={14} /> Role</label>
                  <select
                    value={formData.role} onChange={handleChange('role')} disabled={submitting}
                    style={{ background: 'rgba(15,23,42,0.6)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '0.6rem 0.85rem', borderRadius: '8px', outline: 'none', fontWeight: 600, cursor: 'pointer', width: '100%' }}
                  >
                    <option value="viewer">Viewer (Read-only)</option>
                    <option value="reporter">Reporter (Can report issues)</option>
                    <option value="analyst">Analyst (Can view analytics)</option>
                    <option value="admin">Admin (Full access)</option>
                  </select>
                </div>
              </>
            )}
            <div className="form-group">
              <label><Mail size={14} /> Email</label>
              <input
                type="email" value={formData.email} onChange={handleChange('email')} onBlur={handleBlur('email')}
                placeholder="e.g., user@example.com" disabled={submitting}
                style={{ borderColor: touched.email && errors.email ? '#ef4444' : undefined }}
              />
              {touched.email && errors.email && <p className="field-error">{errors.email}</p>}
            </div>
            <div className="form-group">
              <label><KeyRound size={14} /> Password</label>
              <input
                type="password" value={formData.password} onChange={handleChange('password')} onBlur={handleBlur('password')}
                placeholder={mode === 'register' ? 'At least 6 characters' : 'Enter your password'} disabled={submitting}
                style={{ borderColor: touched.password && errors.password ? '#ef4444' : undefined }}
              />
              {touched.password && errors.password && <p className="field-error">{errors.password}</p>}
            </div>
            {mode === 'register' && (
              <div className="form-group">
                <label><KeyRound size={14} /> Confirm Password</label>
                <input
                  type="password" value={formData.confirmPassword} onChange={handleChange('confirmPassword')} onBlur={handleBlur('confirmPassword')}
                  placeholder="Re-enter password" disabled={submitting}
                  style={{ borderColor: touched.confirmPassword && errors.confirmPassword ? '#ef4444' : undefined }}
                />
                {touched.confirmPassword && errors.confirmPassword && <p className="field-error">{errors.confirmPassword}</p>}
              </div>
            )}
            <button
              type="submit" disabled={submitting}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '1rem', marginTop: '0.75rem' }}
            >
              {submitting ? <><Loader size={18} className="pulse" /> Processing...</> : (mode === 'login' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {mode === 'login' ? (
              <>Don't have an account? <button onClick={switchMode} style={{ background: 'none', border: 'none', color: '#38bdf8', fontWeight: 700, cursor: 'pointer' }}>Register here</button></>
            ) : (
              <>Already have an account? <button onClick={switchMode} style={{ background: 'none', border: 'none', color: '#38bdf8', fontWeight: 700, cursor: 'pointer' }}>Sign in</button></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
