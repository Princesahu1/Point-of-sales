import api from './axios';

/** GET /api/reports/daily?date=YYYY-MM-DD */
export const getDailyReport = (date) =>
  api.get('/reports/daily', { params: { date } });

/** GET /api/reports/monthly?year=YYYY&month=MM */
export const getMonthlyReport = (year, month) =>
  api.get('/reports/monthly', { params: { year, month } });

/** GET /api/reports/inventory */
export const getInventoryReport = () =>
  api.get('/reports/inventory');

/** GET /api/reports/top-products?limit=10 */
export const getTopProducts = (limit = 10) =>
  api.get('/reports/top-products', { params: { limit } });

/** GET /api/reports/summary */
export const getDashboardSummary = () =>
  api.get('/reports/summary');
