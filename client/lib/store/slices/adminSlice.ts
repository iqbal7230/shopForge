import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  compare_price?: number;
  category_id?: string;
  stock_qty: number;
  images?: Record<string, unknown> | null;
  is_deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  price: number;
  product_snapshot: Record<string, unknown>;
  createdAt: string;
}

interface Order {
  id: string;
  user_id?: number;
  cart_id?: string;
  order_number: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  payment_status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  coupon_id?: string;
  shipping_address: Record<string, unknown>;
  tracking_number?: string;
  notes?: string;
  stripe_payment_id?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

interface AdminStats {
  total_orders: number;
  revenue: number;
  low_stock_count: number;
  active_users: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
}

interface AdminFilters {
  status?: string;
  search?: string;
  category?: string;
  payment_status?: string;
}

interface AdminState {
  stats: AdminStats | null;
  products: Product[];
  orders: Order[];
  pagination: Pagination;
  filters: AdminFilters;
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  stats: null,
  products: [],
  orders: [],
  pagination: { page: 1, limit: 20, total: 0 },
  filters: {},
  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setStats: (state, action: PayloadAction<AdminStats>) => {
      state.stats = action.payload;
    },
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
    },
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload;
    },
    updateProduct: (state, action: PayloadAction<Product>) => {
      const index = state.products.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
    },
    deleteProduct: (state, action: PayloadAction<string>) => {
      state.products = state.products.filter(p => p.id !== action.payload);
    },
    updateOrderStatus: (state, action: PayloadAction<{ id: string; status: string }>) => {
      const order = state.orders.find(o => o.id === action.payload.id);
      if (order) {
        order.status = action.payload.status as any;
      }
    },
    setPagination: (state, action: PayloadAction<Pagination>) => {
      state.pagination = action.payload;
    },
    setFilters: (state, action: PayloadAction<AdminFilters>) => {
      state.filters = action.payload;
      state.pagination.page = 1;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setStats,
  setProducts,
  setOrders,
  updateProduct,
  deleteProduct,
  updateOrderStatus,
  setPagination,
  setFilters,
  setLoading,
  setError,
} = adminSlice.actions;
export default adminSlice.reducer;
