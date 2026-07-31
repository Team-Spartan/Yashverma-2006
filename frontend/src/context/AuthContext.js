import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('aquawatch_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await authAPI.getMe();
      setUser(res.data.user);
    } catch {
      localStorage.removeItem('aquawatch_token');
      localStorage.removeItem('aquawatch_user');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    localStorage.setItem('aquawatch_token', res.data.token);
    localStorage.setItem('aquawatch_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    localStorage.setItem('aquawatch_token', res.data.token);
    localStorage.setItem('aquawatch_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('aquawatch_token');
    localStorage.removeItem('aquawatch_user');
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('aquawatch_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
