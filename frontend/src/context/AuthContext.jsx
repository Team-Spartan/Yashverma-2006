import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    id: 'u1',
    name: 'Yash Sharma',
    email: 'yash.leader@jaldrishti.org',
    role: 'admin',
    village: 'Rampur',
    district: 'Varanasi',
    phone: '+91 98765 43210'
  });
  const [token, setToken] = useState(localStorage.getItem('jaldrishti_token') || 'demo-token-active');

  const login = async (email, password) => {
    const res = await api.login(email, password);
    if (res.success) {
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('jaldrishti_token', res.token);
    }
    return res;
  };

  const register = async (name, email, password, role, village, district, phone) => {
    const res = await api.register(name, email, password, role, village, district, phone);
    if (res.success) {
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('jaldrishti_token', res.token);
    }
    return res;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('jaldrishti_token');
  };

  const switchRole = (newRole) => {
    const rolePresets = {
      admin: {
        id: 'u1',
        name: 'Yash Sharma (Team Leader)',
        email: 'yash.leader@jaldrishti.org',
        role: 'admin',
        village: 'Rampur',
        district: 'Varanasi',
        phone: '+91 98765 43210'
      },
      health_worker: {
        id: 'u2',
        name: 'Ankit Kumar (Health Representative)',
        email: 'ankit.worker@jaldrishti.org',
        role: 'health_worker',
        village: 'Rampur',
        district: 'Varanasi',
        phone: '+91 98123 45678'
      },
      community_member: {
        id: 'u4',
        name: 'Rohit Verma (Village Resident)',
        email: 'rohit.citizen@jaldrishti.org',
        role: 'community_member',
        village: 'Devgarh',
        district: 'Sonbhadra',
        phone: '+91 95999 88776'
      }
    };

    if (rolePresets[newRole]) {
      setUser(rolePresets[newRole]);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
