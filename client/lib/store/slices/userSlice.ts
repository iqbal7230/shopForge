import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Address {
  id: string;
  full_name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

interface UserState {
  profile: {
    id: number;
    email: string;
    full_name: string;
    phone?: string;
    avatar_url?: string;
  } | null;
  addresses: Address[];
  wishlist: string[];
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  addresses: [],
  wishlist: [],
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<UserState['profile']>) => {
      state.profile = action.payload;
    },
    updateProfile: (state, action: PayloadAction<Partial<UserState['profile']>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
    setAddresses: (state, action: PayloadAction<Address[]>) => {
      state.addresses = action.payload;
    },
    addAddress: (state, action: PayloadAction<Address>) => {
      state.addresses.push(action.payload);
    },
    updateAddress: (state, action: PayloadAction<Address>) => {
      const index = state.addresses.findIndex(a => a.id === action.payload.id);
      if (index !== -1) state.addresses[index] = action.payload;
    },
    deleteAddress: (state, action: PayloadAction<string>) => {
      state.addresses = state.addresses.filter(a => a.id !== action.payload);
    },
    setWishlist: (state, action: PayloadAction<string[]>) => {
      state.wishlist = action.payload;
    },
    toggleWishlist: (state, action: PayloadAction<string>) => {
      const index = state.wishlist.indexOf(action.payload);
      if (index > -1) {
        state.wishlist.splice(index, 1);
      } else {
        state.wishlist.push(action.payload);
      }
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
  setProfile,
  updateProfile,
  setAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setWishlist,
  toggleWishlist,
  setLoading,
  setError,
} = userSlice.actions;
export default userSlice.reducer;
