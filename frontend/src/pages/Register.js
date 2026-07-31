import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    village: '', district: '', phone: '', role: 'health_worker',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.village) {
      setError('Please fill in all required fields');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword, ...data } = form;
      await register(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>AquaWatch</h1>
        <p className="subtitle">Create your account</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your name"
              />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select name="role" className="form-control" value={form.role} onChange={handleChange}>
                <option value="health_worker">Health Worker</option>
                <option value="official">Official</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={form.email}
              onChange={handleChange}
              placeholder="your@email.com"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                name="password"
                className="form-control"
                value={form.password}
                onChange={handleChange}
                placeholder="Min 6 characters"
              />
            </div>
            <div className="form-group">
              <label>Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-control"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat password"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Village *</label>
              <input
                type="text"
                name="village"
                className="form-control"
                value={form.village}
                onChange={handleChange}
                placeholder="Your village name"
              />
            </div>
            <div className="form-group">
              <label>District</label>
              <input
                type="text"
                name="district"
                className="form-control"
                value={form.district}
                onChange={handleChange}
                placeholder="District name"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              className="form-control"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone number"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p className="auth-link">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
