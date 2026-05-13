import client from './client';

export const adminAPI = {
  // Stats & Dashboard
  getAdminStats: () =>
    client.get('/admin/analytics'),

  // Product Management (extends productAPI)
  getAdminProducts: (params?: { page?: number; limit?: number; search?: string; category_id?: string; status?: string }) =>
    client.get('/products', { params }),

  createProduct: (data: FormData) =>
    client.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),

  updateProduct: (id: string, data: FormData) =>
    client.put(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),

  deleteProduct: (id: string) =>
    client.delete(`/products/${id}`),

  // Order Management
  getAdminOrders: (params?: { page?: number; limit?: number; status?: string; payment_status?: string }) =>
    client.get('/admin/orders', { params }),

  getOrderDetails: (id: string) =>
    client.get(`/orders/${id}`),

  updateOrderStatus: (id: string, data: { status: string }) =>
    client.patch(`/orders/${id}/status`, data),

  // Customers
  getCustomers: (params?: { page?: number; limit?: number; search?: string }) =>
    client.get('/admin/customers', { params }),

  // Low Stock Inventory
  getLowStockProducts: (params?: { limit?: number }) =>
    client.get('/admin/inventory/low-stock', { params }),
};
