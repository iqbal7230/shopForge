import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  images?: any;
  category_id?: string;
  stock_qty: number;
  average_rating?: number;
  review_count?: number;
}

interface ProductState {
  products: Product[];
  currentProduct: Product | null;
  filters: {
    category?: string;
    min_price?: number;
    max_price?: number;
    sort?: string;
    search?: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  currentProduct: null,
  filters: {},
  pagination: { page: 1, limit: 12, total: 0 },
  loading: false,
  error: null,
};

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<{ products: Product[]; total: number }>) => {
      state.products = action.payload.products;
      state.pagination.total = action.payload.total;
    },
    setCurrentProduct: (state, action: PayloadAction<Product | null>) => {
      state.currentProduct = action.payload;
    },
    setFilters: (state, action: PayloadAction<ProductState['filters']>) => {
      state.filters = action.payload;
      state.pagination.page = 1;
    },
    setPagination: (state, action: PayloadAction<{ page: number; limit?: number }>) => {
      state.pagination.page = action.payload.page;
      if (action.payload.limit) state.pagination.limit = action.payload.limit;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetFilters: (state) => {
      state.filters = {};
      state.pagination.page = 1;
    },
  },
});

export const {
  setProducts,
  setCurrentProduct,
  setFilters,
  setPagination,
  setLoading,
  setError,
  resetFilters,
} = productSlice.actions;
export default productSlice.reducer;
