import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import DashboardPage from './pages/DashboardPage';
import TestLogsPage from './pages/TestLogsPage';
import LogTestPage from './pages/LogTestPage';
import IssuesPage from './pages/IssuesPage';
import LoginPage from './pages/LoginPage';
import UsersPage from './pages/UsersPage';
import AuditLogsPage from './pages/AuditLogsPage';
import ProtectedRoute from './components/common/ProtectedRoute';

export default function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <main className="page-wrapper">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route
              path="/test-logs"
              element={
                <ProtectedRoute>
                  <TestLogsPage />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/log-test"
              element={
                <ProtectedRoute>
                  <LogTestPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/issues"
              element={
                <ProtectedRoute>
                  <IssuesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audit"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AuditLogsPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}
