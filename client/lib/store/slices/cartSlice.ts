import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartItem {
  id: string;
  product_id: string;
  product: {
    id: string;
    name: string;
    price: number;
    images?: any;
  };
  variant_id?: string;
  variant?: {
    size?: string;
    color?: string;
    price?: number;
  };
  quantity: number;
  price: number;
}

interface CartState {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  coupon_code: string | null;
  loading: boolean;
}

const initialState: CartState = {
  items: [],
  subtotal: 0,
  shipping: 0,
  discount: 0,
  total: 0,
  coupon_code: null,
  loading: false,
};

const calculateTotals = (items: CartItem[], shipping: number, discount: number) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { subtotal, total: subtotal + shipping - discount };
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<CartItem>) => {
      const exists = state.items.find(item => item.product_id === action.payload.product_id && item.variant_id === action.payload.variant_id);
      if (exists) {
        exists.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      const { subtotal, total } = calculateTotals(state.items, state.shipping, state.discount);
      state.subtotal = subtotal;
      state.total = total;
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      const { subtotal, total } = calculateTotals(state.items, state.shipping, state.discount);
      state.subtotal = subtotal;
      state.total = total;
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const item = state.items.find(item => item.id === action.payload.id);
      if (item) {
        item.quantity = Math.max(1, action.payload.quantity);
      }
      const { subtotal, total } = calculateTotals(state.items, state.shipping, state.discount);
      state.subtotal = subtotal;
      state.total = total;
    },
    setShipping: (state, action: PayloadAction<number>) => {
      state.shipping = action.payload;
      const { subtotal, total } = calculateTotals(state.items, state.shipping, state.discount);
      state.total = total;
    },
    setDiscount: (state, action: PayloadAction<{ discount: number; coupon_code: string | null }>) => {
      state.discount = action.payload.discount;
      state.coupon_code = action.payload.coupon_code;
      const { subtotal, total } = calculateTotals(state.items, state.shipping, state.discount);
      state.total = total;
    },
    clearCart: (state) => {
      state.items = [];
      state.subtotal = 0;
      state.shipping = 0;
      state.discount = 0;
      state.total = 0;
      state.coupon_code = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    initCartFromLocalStorage: (state) => {
      if (typeof window !== 'undefined') {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          const parsed = JSON.parse(savedCart);
          state.items = parsed.items || [];
          state.subtotal = parsed.subtotal || 0;
          state.total = parsed.total || 0;
        }
      }
    },
    saveCartToLocalStorage: (state) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('cart', JSON.stringify({
          items: state.items,
          subtotal: state.subtotal,
          total: state.total,
        }));
      }
    },
  },
});

export const {
  addItem,
  removeItem,
  updateQuantity,
  setShipping,
  setDiscount,
  clearCart,
  setLoading,
  initCartFromLocalStorage,
  saveCartToLocalStorage,
} = cartSlice.actions;
export default cartSlice.reducer;
