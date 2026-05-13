import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import userReducer from './slices/userSlice';
import productReducer from './slices/productSlice';
import orderReducer from './slices/orderSlice';
import adminReducer from './slices/adminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    user: userReducer,
    product: productReducer,
    order: orderReducer,
    admin: adminReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
