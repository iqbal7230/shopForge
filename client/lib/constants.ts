// API base URL and endpoints
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Order Status
export const ORDER_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  CREATED: 'CREATED',
  AUTHORIZED: 'AUTHORIZED',
  CAPTURED: 'CAPTURED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
};

// Pagination
export const PAGINATION = {
  PRODUCTS_PER_PAGE: 12,
  ORDERS_PER_PAGE: 10,
  ADDRESSES_PER_PAGE: 5,
};

// Messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized. Please login.',
  FORBIDDEN: 'You do not have permission.',
  NOT_FOUND: 'Resource not found.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  USER_EXISTS: 'User already exists.',
  CART_EMPTY: 'Your cart is empty.',
  PAYMENT_FAILED: 'Payment failed. Please try again.',
};

export const SUCCESS_MESSAGES = {
  LOGIN: 'Logged in successfully.',
  REGISTER: 'Account created successfully. Please verify your email.',
  LOGOUT: 'Logged out successfully.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  ADDRESS_ADDED: 'Address added successfully.',
  ORDER_CREATED: 'Order placed successfully.',
};

// Routes
export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  SEARCH: '/products',
  CART: '/cart',
  CHECKOUT: '/checkout',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  PROFILE: '/profile',
  ADDRESSES: '/addresses',
  ORDERS: '/orders',
  WISHLIST: '/wishlist',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_ANALYTICS: '/admin/analytics',
  ORDER_CONFIRMATION: '/order/confirmation',
};
