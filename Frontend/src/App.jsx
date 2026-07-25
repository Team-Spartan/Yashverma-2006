import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import LoginForm from './components/LoginForm';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './components/Dashboard';

function MainAppContent() {
  const { isAuthenticated, login, authError, isLoading } = useAuth();

  const handleLoginSubmit = async (credentials) => {
    await login(credentials.email, credentials.password);
  };

  if (!isAuthenticated) {
    return (
      <LoginForm
        onLoginSubmit={handleLoginSubmit}
        serverError={authError}
        isLoading={isLoading}
      />
    );
  }

  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
