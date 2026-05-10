export const OrderStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED'
};

export const PaymentStatus = {
  PENDING: 'PENDING',
  CREATED: 'CREATED',
  AUTHORIZED: 'AUTHORIZED',
  CAPTURED: 'CAPTURED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED'
};

export const CouponType = {
  PERCENT: 'PERCENT',
  FIXED: 'FIXED'
};

export const ReturnStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  REFUNDED: 'REFUNDED'
};

export const UserRole = {
  USER: 'USER',
  ADMIN: 'ADMIN'
};

export const SHIPPING_RATES = {
  FLAT: 10,
  WEIGHT_RATE: 2
};

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100
};

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'Resource not found',
  VALIDATION_FAILED: 'Validation failed',
  INTERNAL_ERROR: 'Internal server error',
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_ALREADY_EXISTS: 'User with this email already exists',
  EMAIL_ALREADY_VERIFIED: 'Email already verified',
  INVALID_TOKEN: 'Invalid or expired token',
  PRODUCT_NOT_FOUND: 'Product not found',
  CATEGORY_NOT_FOUND: 'Category not found',
  CART_EMPTY: 'Cart is empty',
  INSUFFICIENT_STOCK: 'Insufficient stock available',
  COUPON_INVALID: 'Invalid coupon code',
  COUPON_EXPIRED: 'Coupon has expired',
  COUPON_USAGE_LIMIT_EXCEEDED: 'Coupon usage limit exceeded',
  ORDER_NOT_FOUND: 'Order not found',
  PAYMENT_FAILED: 'Payment failed',
  RETURN_NOT_FOUND: 'Return request not found'
};

export const JWT_CONFIG = {
  ACCESS_EXPIRY: '15m',
  REFRESH_EXPIRY: '7d'
};
