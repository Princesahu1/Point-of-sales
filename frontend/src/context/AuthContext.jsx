import React, { createContext, useContext, useState, useCallback } from 'react';
import { login as loginApi, register as registerApi } from '../api/authApi';

/**
 * AuthContext — provides JWT authentication state and actions across the app.
 * Token and user are persisted in localStorage for page refreshes.
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('pos_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('pos_user');
    try { return saved ? JSON.parse(saved) : null; } catch { return null; }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /** Decode basic claims from JWT payload without a library */
  const decodeToken = (jwt) => {
    try {
      const base64 = jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(base64));
    } catch {
      return {};
    }
  };

  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await loginApi(credentials);
      // data = { token, username, role, ... }
      const decoded = decodeToken(data.token);
      const userInfo = {
        username: data.username || decoded.sub,
        role: data.role || (decoded.roles?.[0]?.authority?.replace('ROLE_', ''))
      };
      localStorage.setItem('pos_token', data.token);
      localStorage.setItem('pos_user', JSON.stringify(userInfo));
      setToken(data.token);
      setUser(userInfo);
      return userInfo;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await registerApi(userData);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('pos_token');
    localStorage.removeItem('pos_user');
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = !!token;
  const hasRole = (role) => user?.role === role;
  const hasAnyRole = (...roles) => roles.includes(user?.role);

  return (
    <AuthContext.Provider value={{
      token, user, loading, error,
      login, logout, register,
      isAuthenticated, hasRole, hasAnyRole
    }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Hook to consume auth context */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
