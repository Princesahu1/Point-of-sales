import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Pages
import Login          from './pages/Login';
import Register       from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard      from './pages/Dashboard';
import Products       from './pages/Products';
import POS            from './pages/POS';
import Inventory      from './pages/Inventory';
import Reports        from './pages/Reports';
import Bills          from './pages/Bills';
import PendingUsers   from './pages/PendingUsers';

// Role constants
const ALL_ROLES    = ['ADMIN','STORE_MANAGER','CASHIER','INVENTORY_CLERK','BUSINESS_ANALYST'];
const MANAGER_PLUS = ['ADMIN','STORE_MANAGER'];
const POS_ACCESS   = ['ADMIN','STORE_MANAGER','CASHIER'];
const INV_ACCESS   = ['ADMIN','STORE_MANAGER','INVENTORY_CLERK'];
const REP_ACCESS   = ['ADMIN','STORE_MANAGER','BUSINESS_ANALYST'];

/**
 * AppShell — the authenticated layout (sidebar + navbar + content area).
 */
function AppShell() {
  return (
    <div className="flex min-h-screen bg-dark-200">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64">
        <Navbar />
        <main className="flex-1 p-6 mt-16 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/**
 * Unauthorized page.
 */
function Unauthorized() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-dark-300 flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-6xl">🚫</p>
        <h1 className="text-2xl font-bold text-white">Access Denied</h1>
        <p className="text-gray-400">
          Your role <span className="text-primary-400">({user?.role})</span> doesn't have
          permission to view this page.
        </p>
        <a href="/dashboard" className="btn-primary inline-flex mx-auto">
          Back to Dashboard
        </a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <CurrencyProvider>
    <AuthProvider>
      {/* Toast notification system */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e2130',
            color: '#f3f4f6',
            border: '1px solid #374151',
            borderRadius: '12px',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#1e2130' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#1e2130' } },
        }}
      />

      <Router>
        <Routes>
          {/* ── Public routes ── */}
          <Route path="/login"           element={<Login />} />
          <Route path="/register"        element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/unauthorized"    element={<Unauthorized />} />

          {/* ── Authenticated routes (AppShell with sidebar) ── */}
          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={
              <ProtectedRoute roles={ALL_ROLES}><Dashboard /></ProtectedRoute>
            } />
            <Route path="/products" element={
              <ProtectedRoute roles={ALL_ROLES}><Products /></ProtectedRoute>
            } />
            <Route path="/pos" element={
              <ProtectedRoute roles={POS_ACCESS}><POS /></ProtectedRoute>
            } />
            <Route path="/bills" element={
              <ProtectedRoute roles={POS_ACCESS}><Bills /></ProtectedRoute>
            } />
            <Route path="/inventory" element={
              <ProtectedRoute roles={INV_ACCESS}><Inventory /></ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute roles={REP_ACCESS}><Reports /></ProtectedRoute>
            } />
            <Route path="/admin/pending-users" element={
              <ProtectedRoute roles={['ADMIN']}><PendingUsers /></ProtectedRoute>
            } />
          </Route>

          {/* ── Catch-all ── */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
    </CurrencyProvider>
  );
}
