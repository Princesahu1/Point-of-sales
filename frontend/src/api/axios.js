import axios from 'axios';

/**
 * Base Axios instance.
 * All API calls to the Spring Boot backend go through this instance.
 * The Vite proxy (vite.config.js) routes /api/* → http://localhost:8080/api/*
 */
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ── Request Interceptor ─────────────────────────────────────────────────────
// Attach JWT token to every request (except /auth endpoints which don't need it)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pos_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ────────────────────────────────────────────────────
// Globally handle 401 (expired/invalid token) by clearing auth and redirecting to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('pos_token');
      localStorage.removeItem('pos_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
