import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Custom hooks for convenience
export const useAuth = () => useAppSelector(state => state.auth);
export const useCart = () => useAppSelector(state => state.cart);
export const useUser = () => useAppSelector(state => state.user);
export const useProduct = () => useAppSelector(state => state.product);
export const useOrder = () => useAppSelector(state => state.order);
