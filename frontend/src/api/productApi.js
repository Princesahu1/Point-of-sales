import api from './axios';

/** GET /api/products?page=0&size=20&sort=name */
export const getProducts = (params = {}) =>
  api.get('/products', { params });

/** GET /api/products/{id} */
export const getProductById = (id) =>
  api.get(`/products/${id}`);

/** GET /api/products/barcode/{barcode} */
export const getProductByBarcode = (barcode) =>
  api.get(`/products/barcode/${barcode}`);

/** POST /api/products */
export const createProduct = (product) =>
  api.post('/products', product);

/** PUT /api/products/{id} */
export const updateProduct = (id, product) =>
  api.put(`/products/${id}`, product);

/** DELETE /api/products/{id} */
export const deleteProduct = (id) =>
  api.delete(`/products/${id}`);

/** GET /api/products/search?q=query */
export const searchProducts = (query) =>
  api.get('/products/search', { params: { q: query } });
