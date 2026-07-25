import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContextObject';
import { authService } from '../services/authService';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authService.getUser());
  const [token, setToken] = useState(() => authService.getToken());
  const [isAuthenticated, setIsAuthenticated] = useState(() => authService.isAuthenticated());
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Validate session on initial load
  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        const verifiedUser = await authService.verifySession();
        if (verifiedUser) {
          setUser(verifiedUser);
          setIsAuthenticated(true);
        } else {
          // Token invalid or expired
          logout();
        }
      }
    };
    checkAuth();
  }, []);

  // Perform login API call & update state
  const login = async (email, password) => {
    setIsLoading(true);
    setAuthError('');

    try {
      // Try real backend API login
      const res = await authService.login(email, password);
      setUser(res.user);
      setToken(res.token);
      setIsAuthenticated(true);
      setIsLoading(false);
      return { success: true };
    } catch (err) {
      console.warn('API connection error or invalid credentials:', err.message);
      
      // Fallback demo mock if backend server is not running during local UI testing
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        const mockUser = {
          id: 'demo-user-1',
          name: 'Sunita Sharma',
          email: email,
          role: 'Health_Worker',
          village: 'Rampur Village'
        };
        // Simple demo JWT structure header.payload.signature
        const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ id: mockUser.id, role: mockUser.role, exp: Math.floor(Date.now() / 1000) + 86400 }))}.mock_signature`;
        
        authService.setSession(mockToken, mockUser);
        setUser(mockUser);
        setToken(mockToken);
        setIsAuthenticated(true);
        setIsLoading(false);
        return { success: true };
      }

      setAuthError(err.message || 'Authentication failed');
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Perform logout & clear storage
  const logout = () => {
    authService.clearSession();
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    setAuthError('');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        authError,
        login,
        logout,
        setAuthError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

