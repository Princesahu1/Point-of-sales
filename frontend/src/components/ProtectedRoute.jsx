import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wraps routes that require authentication.
 * Optionally enforces role-based access.
 *
 * Usage:
 *   <ProtectedRoute roles={['ADMIN', 'STORE_MANAGER']}>
 *     <MyPage />
 *   </ProtectedRoute>
 */
export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login, preserving target path for redirect-after-login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(user?.role)) {
    // Authenticated but wrong role
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
