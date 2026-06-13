import api from './axios';

/** POST /api/auth/login */
export const login = (credentials) => api.post('/auth/login', credentials);

/** POST /api/auth/register */
export const register = (userData) => api.post('/auth/register', userData);

/** POST /api/auth/forgot-password  { mobileNumber } */
export const forgotPassword = (mobileNumber) =>
  api.post('/auth/forgot-password', { mobileNumber });

/** POST /api/auth/verify-otp  { mobileNumber, otp } */
export const verifyOtp = (mobileNumber, otp) =>
  api.post('/auth/verify-otp', { mobileNumber, otp });

/** POST /api/auth/reset-password  { mobileNumber, otp, newPassword } */
export const resetPassword = (mobileNumber, otp, newPassword) =>
  api.post('/auth/reset-password', { mobileNumber, otp, newPassword });

/** GET /api/admin/pending-users */
export const getPendingUsers = () => api.get('/admin/pending-users');

/** PUT /api/admin/users/{id}/approve */
export const approveUser = (id) => api.put(`/admin/users/${id}/approve`);

/** PUT /api/admin/users/{id}/reject */
export const rejectUser = (id, reason) =>
  api.put(`/admin/users/${id}/reject`, { reason });
