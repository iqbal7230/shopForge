import client from './client';

export const authAPI = {
  register: (data: { fullname: string; email: string; password: string }) =>
    client.post('/auth/register', data),

  login: (data: { email: string; password: string; guest_session_id?: string }) =>
    client.post('/auth/login', data),

  verifyEmail: (data: { token: string }) =>
    client.post('/auth/verify-email', data),

  forgotPassword: (data: { email: string }) =>
    client.post('/auth/forgot-password', data),

  resetPassword: (data: { token: string; password: string }) =>
    client.post('/auth/reset-password', data),

  changePassword: (data: { current_password: string; new_password: string }) =>
    client.post('/auth/change-password', data),

  logout: () =>
    client.post('/auth/logout', {}),

  refreshToken: (refreshToken: string) =>
    client.post('/auth/refresh-token', { refreshToken }),
};

export const productAPI = {
  getProducts: (params?: { page?: number; limit?: number; category_id?: string; min_price?: number; max_price?: number; sort?: string }) =>
    client.get('/products', { params }),

  searchProducts: (query: string, params?: { page?: number; limit?: number }) =>
    client.get('/products/search', { params: { q: query, ...params } }),

  getProductById: (id: string) =>
    client.get(`/products/${id}`),

  getCategories: () =>
    client.get('/categories'),
};

export const cartAPI = {
  addItem: (data: { product_id: string; variant_id?: string; quantity: number }) =>
    client.post('/cart/add', data),

  removeItem: (itemId: string) =>
    client.delete(`/cart/items/${itemId}`),

  updateItem: (itemId: string, data: { quantity: number }) =>
    client.put(`/cart/items/${itemId}`, data),

  getCart: () =>
    client.get('/cart'),

  clearCart: () =>
    client.delete('/cart/clear'),
};

export const checkoutAPI = {
  initiateCheckout: (data: any) =>
    client.post('/checkout', data),

  confirmPayment: (data: any) =>
    client.post('/checkout/confirm-payment', data),
};

export const orderAPI = {
  getOrders: (params?: { page?: number; limit?: number }) =>
    client.get('/orders', { params }),

  getOrderById: (id: string) =>
    client.get(`/orders/${id}`),

  updateOrderStatus: (id: string, data: { status: string }) =>
    client.patch(`/orders/${id}/status`, data),
};

export const userAPI = {
  getProfile: () =>
    client.get('/user/profile'),

  updateProfile: (data: any) =>
    client.put('/user/profile', data),

  getAddresses: () =>
    client.get('/user/addresses'),

  addAddress: (data: any) =>
    client.post('/user/addresses', data),

  updateAddress: (id: string, data: any) =>
    client.put(`/user/addresses/${id}`, data),

  deleteAddress: (id: string) =>
    client.delete(`/user/addresses/${id}`),
};

export const wishlistAPI = {
  getWishlist: () =>
    client.get('/wishlist'),

  addToWishlist: (productId: string) =>
    client.post(`/wishlist/${productId}`),

  removeFromWishlist: (productId: string) =>
    client.delete(`/wishlist/${productId}`),
};

export const couponAPI = {
  validateCoupon: (code: string) =>
    client.post('/coupons/validate', { coupon_code: code }),
};

export const adminAPI = {
  getAnalytics: (params?: { start_date?: string; end_date?: string }) =>
    client.get('/admin/analytics', { params }),

  getAllOrders: (params?: { page?: number; limit?: number; status?: string }) =>
    client.get('/admin/orders', { params }),

  getAllProducts: (params?: { page?: number; limit?: number }) =>
    client.get('/admin/products', { params }),

  createProduct: (data: FormData) =>
    client.post('/products', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  updateProduct: (id: string, data: FormData) =>
    client.put(`/products/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  deleteProduct: (id: string) =>
    client.delete(`/products/${id}`),
};
