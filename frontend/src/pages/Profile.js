import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      setMessage({ type: 'error', text: 'Please fill in all password fields' });
      return;
    }

    if (passwords.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters' });
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    setLoading(true);
    try {
      await authAPI.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setMessage({ type: 'success', text: 'Password updated successfully' });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update password' });
    }
    setLoading(false);
  };

  const roleLabel = (role) => {
    const labels = {
      health_worker: 'Health Worker',
      official: 'Official',
      admin: 'Admin',
    };
    return labels[role] || role;
  };

  return (
    <div>
      <div className="page-header">
        <h1>My Profile</h1>
        <p>View your information and manage your password</p>
      </div>

      <div className="profile-grid">
        <div className="card profile-info-card">
          <div className="card-header">
            <h2>Profile Information</h2>
          </div>
          <div className="profile-avatar">
            <div className="avatar-circle">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="profile-details">
            <div className="profile-field">
              <span className="field-label">Name</span>
              <span className="field-value">{user?.name}</span>
            </div>
            <div className="profile-field">
              <span className="field-label">Email</span>
              <span className="field-value">{user?.email}</span>
            </div>
            <div className="profile-field">
              <span className="field-label">Role</span>
              <span className="field-value">
                <span className="badge badge-role">{roleLabel(user?.role)}</span>
              </span>
            </div>
            <div className="profile-field">
              <span className="field-label">Village</span>
              <span className="field-value">{user?.village}</span>
            </div>
            {user?.district && (
              <div className="profile-field">
                <span className="field-label">District</span>
                <span className="field-value">{user.district}</span>
              </div>
            )}
            {user?.phone && (
              <div className="profile-field">
                <span className="field-label">Phone</span>
                <span className="field-value">{user.phone}</span>
              </div>
            )}
          </div>
        </div>

        <div className="card profile-password-card">
          <div className="card-header">
            <h2>Change Password</h2>
          </div>
          {message.text && (
            <div className={`alert alert-${message.type}`}>
              {message.text}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                name="currentPassword"
                className="form-control"
                value={passwords.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Enter current password"
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                className="form-control"
                value={passwords.newPassword}
                onChange={handlePasswordChange}
                placeholder="Enter new password (min 6 characters)"
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-control"
                value={passwords.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Re-enter new password"
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="btn-spinner" />
                  Updating...
                </>
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
