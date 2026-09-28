import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { NetworkTopologyPage } from './pages/NetworkTopologyPage';
import { DiagnosticsPage } from './pages/DiagnosticsPage';
import { ReportsPage } from './pages/ReportsPage';
import { NewReportPage } from './pages/NewReportPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { AIAdminPage } from './pages/AIAdminPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { LiveMonitorPage } from './pages/LiveMonitorPage';
import { RegisterPage } from './pages/RegisterPage';

export const App: React.FC = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Student / Faculty Routes */}
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/monitor" element={<LiveMonitorPage />} />
        <Route path="/network" element={<NetworkTopologyPage />} />
        <Route path="/diagnostics" element={<DiagnosticsPage />} />
        <Route path="/reports" element={<ReportsPage adminView={false} />} />
        <Route path="/reports/new" element={<NewReportPage />} />
        <Route path="/incidents" element={<IncidentsPage adminView={false} />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Admin Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/monitor" element={<LiveMonitorPage />} />
          <Route path="/admin/network" element={<NetworkTopologyPage />} />
          <Route path="/admin/locations" element={<NetworkTopologyPage />} />
          <Route path="/admin/incidents" element={<IncidentsPage adminView={true} />} />
          <Route path="/admin/reports" element={<ReportsPage adminView={true} />} />
          <Route path="/admin/analytics" element={<AnalyticsPage />} />
          <Route path="/admin/thresholds" element={<AdminDashboard />} />
          <Route path="/admin/simulator" element={<SimulatorPage />} />
          <Route path="/admin/ai" element={<AIAdminPage />} />
        </Route>

        {/* 404 Routes */}
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  );
};
export default App;
