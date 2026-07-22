import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { Shield, UserCheck, CheckCircle2, AlertCircle, RefreshCw, Save } from 'lucide-react';
import './UserRoleManagement.css';

const ROLE_OPTIONS = [
  { value: 'Village_Representative', label: 'Village Representative' },
  { value: 'Health_Worker', label: 'Health Worker' },
  { value: 'Authority', label: 'Local Authority' },
  { value: 'Admin', label: 'System Admin' }
];

export default function UserRoleManagement() {
  const [users, setUsers] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState({});
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [notification, setNotification] = useState(null);

  // Fetch registered user list
  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await userService.getUsers();
      setUsers(data);
      // Initialize selected role dropdown state
      const roleMap = {};
      data.forEach((u) => {
        roleMap[u._id || u.id] = u.role;
      });
      setSelectedRoles(roleMap);
    } catch (err) {
      console.error('Failed to load user list:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Handle dropdown selection change
  const handleRoleSelect = (userId, newRole) => {
    setSelectedRoles((prev) => ({
      ...prev,
      [userId]: newRole
    }));
  };

  // Submit role update & refresh UI state immediately
  const handleSaveRole = async (user) => {
    const userId = user._id || user.id;
    const newRole = selectedRoles[userId];

    if (newRole === user.role) return;

    setUpdatingId(userId);
    setNotification(null);

    try {
      await userService.updateUserRole(userId, newRole);

      // Immediately update local UI state to reflect new role
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          (u._id || u.id) === userId ? { ...u, role: newRole } : u
        )
      );

      setNotification({
        type: 'success',
        message: `Role for ${user.name} updated to ${newRole.replace('_', ' ')} successfully!`
      });

      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to update user role'
      });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="role-mgmt-container">
      <div className="role-mgmt-header">
        <div className="role-mgmt-title">
          <Shield size={22} color="#38bdf8" />
          <span>User Role Management Controls</span>
        </div>
        <button
          className="save-role-btn"
          onClick={loadUsers}
          disabled={loadingUsers}
          title="Refresh User List"
          style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)' }}
        >
          <RefreshCw size={14} className={loadingUsers ? 'spinner' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {notification && (
        <div className={`role-alert ${notification.type}`}>
          {notification.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{notification.message}</span>
        </div>
      )}

      {loadingUsers ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
          <div className="spinner" style={{ margin: '0 auto 0.5rem auto' }}></div>
          <p>Loading registered user directory...</p>
        </div>
      ) : (
        <div className="user-table-wrapper">
          <table className="user-table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Village</th>
                <th>Current Role</th>
                <th>Role Edit Controls</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const uId = u._id || u.id;
                const currentSelected = selectedRoles[uId] || u.role;
                const isModified = currentSelected !== u.role;
                const isUpdating = updatingId === uId;

                return (
                  <tr key={uId}>
                    <td>
                      <div className="user-profile-cell">
                        <div className="user-avatar">{u.name?.charAt(0) || 'U'}</div>
                        <div>
                          <div className="user-display-name">{u.name}</div>
                          <div className="user-display-email">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{u.village || 'Rampur Central'}</td>
                    <td>
                      <span className={`role-badge ${u.role}`}>
                        <UserCheck size={13} />
                        {u.role ? u.role.replace('_', ' ') : 'Village Representative'}
                      </span>
                    </td>
                    <td>
                      <div className="role-select-controls">
                        <select
                          className="role-dropdown"
                          value={currentSelected}
                          onChange={(e) => handleRoleSelect(uId, e.target.value)}
                          disabled={isUpdating}
                        >
                          {ROLE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>

                        <button
                          className="save-role-btn"
                          onClick={() => handleSaveRole(u)}
                          disabled={!isModified || isUpdating}
                        >
                          {isUpdating ? (
                            <span className="spinner" style={{ width: '12px', height: '12px' }}></span>
                          ) : (
                            <Save size={14} />
                          )}
                          <span>{isUpdating ? 'Saving...' : 'Update Role'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
