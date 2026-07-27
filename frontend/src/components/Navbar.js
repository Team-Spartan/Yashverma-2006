import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="15" fill="rgba(255,255,255,0.15)" />
          <path d="M16 6C16 6 10 13 10 18C10 21.3 12.7 24 16 24C19.3 24 22 21.3 22 18C22 13 16 6 16 6Z" fill="white" />
          <path d="M14 18C14 16.9 14.9 16 16 16C17.1 16 18 16.9 18 18" stroke="rgba(0,119,182,0.8)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        AquaWatch
      </div>
      <div className="navbar-links">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
          Dashboard
        </NavLink>
        <NavLink to="/water-tests" className={({ isActive }) => isActive ? 'active' : ''}>
          Water Tests
        </NavLink>
        <NavLink to="/issues" className={({ isActive }) => isActive ? 'active' : ''}>
          Issues
        </NavLink>
        {(user?.role === 'admin' || user?.role === 'official') && (
          <NavLink to="/admin" className={({ isActive }) => isActive ? 'active' : ''}>
            Admin
          </NavLink>
        )}
      </div>
      <div className="navbar-user">
        <span>{user?.name}</span>
        <button className="btn-logout" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
