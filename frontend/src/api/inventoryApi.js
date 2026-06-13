import api from './axios';

/** GET /api/inventory — all inventory items */
export const getInventory = (params = {}) =>
  api.get('/inventory', { params });

/** GET /api/inventory/low-stock — items below reorder threshold */
export const getLowStockItems = () =>
  api.get('/inventory/low-stock');

/** PUT /api/inventory/{productId} — update stock quantity */
export const adjustStock = (productId, payload) =>
  api.put(`/inventory/${productId}`, payload);

/** GET /api/inventory/alerts — unresolved replenishment alerts */
export const getAlerts = () =>
  api.get('/inventory/alerts');

/** PUT /api/inventory/alerts/{alertId}/resolve */
export const resolveAlert = (alertId) =>
  api.put(`/inventory/alerts/${alertId}/resolve`);
