import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  subtotal: number;
  shipping_cost: number;
  discount_amount: number;
  total_amount: number;
  items: OrderItem[];
  shipping_address: any;
  createdAt: string;
}

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  pagination: { page: 1, limit: 10, total: 0 },
  loading: false,
  error: null,
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<{ orders: Order[]; total: number }>) => {
      state.orders = action.payload.orders;
      state.pagination.total = action.payload.total;
    },
    setCurrentOrder: (state, action: PayloadAction<Order | null>) => {
      state.currentOrder = action.payload;
    },
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.unshift(action.payload);
    },
    updateOrderStatus: (state, action: PayloadAction<{ id: string; status: string }>) => {
      const order = state.orders.find(o => o.id === action.payload.id);
      if (order) {
        order.status = action.payload.status;
      }
      if (state.currentOrder?.id === action.payload.id) {
        state.currentOrder.status = action.payload.status;
      }
    },
    setPagination: (state, action: PayloadAction<{ page: number }>) => {
      state.pagination.page = action.payload.page;
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
  setOrders,
  setCurrentOrder,
  addOrder,
  updateOrderStatus,
  setPagination,
  setLoading,
  setError,
} = orderSlice.actions;
export default orderSlice.reducer;
