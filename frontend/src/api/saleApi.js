import api from './axios';

/** POST /api/sales — create a new sale */
export const createSale = (saleRequest) =>
  api.post('/sales', saleRequest);

/** GET /api/sales — paginated sale history */
export const getSales = (params = {}) =>
  api.get('/sales', { params });

/** GET /api/sales/{id} */
export const getSaleById = (id) =>
  api.get(`/sales/${id}`);

/** POST /api/sales/{id}/refund */
export const refundSale = (id) =>
  api.post(`/sales/${id}/refund`);
