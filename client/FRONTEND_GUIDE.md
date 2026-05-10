# ShopForge Frontend - Implementation Progress & Guide

## ✅ Completed Infrastructure

### Redux Store Setup
- ✅ Store configured with 5 slices (auth, cart, user, product, order)
- ✅ All Redux hooks created for easy component access
- ✅ Redux Provider integrated into root layout

### API Client
- ✅ Axios instance with baseURL pointing to backend
- ✅ Request interceptor adds JWT token to all requests
- ✅ Response interceptor handles 401 with token refresh
- ✅ Auto-redirect to login on auth failure

### API Modules Created
- ✅ `authAPI` - register, login, logout, verify email, password reset
- ✅ `productAPI` - getProducts, searchProducts, getProductById, getCategories
- ✅ `cartAPI` - add, remove, update items, getCart, clearCart
- ✅ `checkoutAPI` - initiateCheckout, confirmPayment
- ✅ `orderAPI` - getOrders, getOrderById, updateOrderStatus
- ✅ `userAPI` - getProfile, updateProfile, address management
- ✅ `wishlistAPI` - add/remove from wishlist
- ✅ `couponAPI` - validateCoupon
- ✅ `adminAPI` - admin operations

### Configuration
- ✅ Environment variables (.env.local)
- ✅ API constants and status values
- ✅ Route constants
- ✅ Error and success messages

---

## 📋 Redux Slices Structure

### authSlice
```typescript
{
  user: User | null,
  token: string | null,
  refreshToken: string | null,
  isAuthenticated: boolean,
  loading: boolean,
  error: string | null
}
```

### cartSlice
```typescript
{
  items: CartItem[],
  subtotal: number,
  shipping: number,
  discount: number,
  total: number,
  coupon_code: string | null,
  loading: boolean
}
```

### userSlice
```typescript
{
  profile: User | null,
  addresses: Address[],
  wishlist: string[],
  loading: boolean,
  error: string | null
}
```

### productSlice
```typescript
{
  products: Product[],
  currentProduct: Product | null,
  filters: {...},
  pagination: {page, limit, total},
  loading: boolean,
  error: string | null
}
```

### orderSlice
```typescript
{
  orders: Order[],
  currentOrder: Order | null,
  pagination: {page, limit, total},
  loading: boolean,
  error: string | null
}
```

---

## 🚀 Next Steps: Building Pages

### 1. Authentication Pages (High Priority)

**Login Page** (`app/(auth)/login/page.tsx`)
```typescript
- Email + Password input
- Remember me checkbox
- Submit button
- Link to register & forgot password
- Call authAPI.login()
- Store tokens in Redux & localStorage
- Redirect to home or checkout (if cart)
```

**Register Page** (`app/(auth)/register/page.tsx`)
```typescript
- Full name, email, password, confirm password
- Form validation with Zod
- Call authAPI.register()
- Success: Show verification message
- Error: Display error message
```

**Forgot Password** (`app/(auth)/forgot-password/page.tsx`)
```typescript
- Email input
- Submit button
- Call authAPI.forgotPassword()
- Show success message
```

**Reset Password** (`app/(auth)/reset-password/page.tsx`)
```typescript
- Extract token from URL
- New password + confirm password
- Call authAPI.resetPassword()
- Redirect to login
```

**Verify Email** (`app/(auth)/verify-email/page.tsx`)
```typescript
- Extract token from URL
- Show verification status
- Call authAPI.verifyEmail()
- Resend option
```

### 2. Product Pages (High Priority)

**Home Page** (`app/page.tsx`)
```typescript
- Featured products carousel
- Category showcase
- Search bar
- Call productAPI.getProducts()
- Call productAPI.getCategories()
```

**Products List** (`app/(shop)/products/page.tsx`)
```typescript
- Product grid with filters
- Category dropdown filter
- Price range slider
- Sort dropdown
- Pagination
- Call productAPI.getProducts() with params
- Show loading state
```

**Product Detail** (`app/(shop)/products/[slug]/page.tsx`)
```typescript
- Product gallery (multiple images)
- Product info (name, price, description)
- Variants dropdown (size, color)
- Stock status
- Add to cart button
- Add to wishlist button
- Reviews section
- Related products
- Call productAPI.getProductById()
```

**Search Results** (`app/(shop)/search/page.tsx`)
```typescript
- Display search query
- Product results grid
- Filters
- Call productAPI.searchProducts()
```

### 3. Cart & Checkout (High Priority)

**Cart Page** (`app/(shop)/cart/page.tsx`)
```typescript
- List cart items (from Redux)
- Update quantity per item
- Remove item button
- Subtotal display
- Discount section (apply coupon)
- Shipping selector
- Proceed to checkout button
- Empty cart message
```

**Checkout Page** (`app/(shop)/checkout/page.tsx`)
```typescript
Step 1: Review cart
Step 2: Shipping address form
  - Select saved address OR enter new address
Step 3: Shipping method selection
  - FLAT: ₹100
  - WEIGHT: ₹50 (or calculation)
Step 4: Apply coupon code
  - Input field + Apply button
  - Call couponAPI.validateCoupon()
Step 5: Order review
  - Display totals
  - Razorpay payment button
  - Call checkoutAPI.initiateCheckout()
  - Show Razorpay form
  - On success: Call checkoutAPI.confirmPayment()
```

**Order Confirmation** (`app/order/confirmation/[id]/page.tsx`)
```typescript
- Order details (number, date, total)
- Items ordered
- Shipping address
- Payment method
- Tracking button (if available)
- Continue shopping button
- Call orderAPI.getOrderById()
```

### 4. User Account Pages

**Profile** (`app/(account)/profile/page.tsx`)
```typescript
- Display user info
- Edit form (name, email, phone, avatar)
- Change password section
- Call userAPI.getProfile()
- Call userAPI.updateProfile()
```

**Addresses** (`app/(account)/addresses/page.tsx`)
```typescript
- List saved addresses
- Add new address button
- Edit/Delete buttons per address
- Mark as default
- Call userAPI.getAddresses()
- Call userAPI.addAddress()
- Call userAPI.updateAddress()
- Call userAPI.deleteAddress()
```

**Orders** (`app/(account)/orders/page.tsx`)
```typescript
- List user's orders
- Order cards showing:
  - Order number
  - Date
  - Status badge
  - Total amount
- Pagination
- Click to view details
- Call orderAPI.getOrders()
```

**Order Details** (`app/(account)/orders/[id]/page.tsx`)
```typescript
- Order info (number, date, status)
- Items ordered with details
- Shipping address
- Payment info
- Order timeline (status progression)
- Request return button (if eligible)
- Call orderAPI.getOrderById()
```

**Wishlist** (`app/(account)/wishlist/page.tsx`)
```typescript
- Display wishlisted products
- Remove from wishlist button
- Add to cart button per product
- Empty wishlist message
- Show current price
```

### 5. Admin Dashboard Pages

**Admin Dashboard** (`app/(admin)/dashboard/page.tsx`)
```typescript
- Key metrics (revenue, orders, avg value)
- Revenue chart (Recharts)
- Recent orders
- Top products
- Call adminAPI.getAnalytics()
```

**Products Management** (`app/(admin)/products/page.tsx`)
```typescript
- Products table with pagination
- Search/filter
- Create button (form modal)
- Edit button per row
- Delete button with confirmation
- Call adminAPI.getAllProducts()
- Call adminAPI.createProduct()
- Call adminAPI.updateProduct()
- Call adminAPI.deleteProduct()
```

**Orders Management** (`app/(admin)/orders/page.tsx`)
```typescript
- Orders table
- Filter by status
- Update status dropdown
- View details button
- Call adminAPI.getAllOrders()
- Call orderAPI.updateOrderStatus()
```

**Analytics** (`app/(admin)/analytics/page.tsx`)
```typescript
- Revenue chart (line/bar)
- Date range picker
- Top products card
- Top customers card
- Order count card
- Call adminAPI.getAnalytics() with date range
```

---

## 🛠️ Component Architecture

### Shared Components
```
components/
├── layout/
│   ├── Navbar.tsx          - Header with logo, search, links, cart icon
│   ├── Footer.tsx          - Footer with links, newsletter
│   ├── Sidebar.tsx         - Mobile menu
│   └── AdminLayout.tsx     - Admin sidebar + layout
├── auth/
│   ├── ProtectedRoute.tsx  - Middleware to check authentication
│   ├── LoginForm.tsx       - Reusable login form
│   └── RegisterForm.tsx    - Reusable register form
├── products/
│   ├── ProductCard.tsx     - Single product display
│   ├── ProductGrid.tsx     - Grid of products
│   ├── ProductFilters.tsx  - Filter sidebar
│   └── ProductGallery.tsx  - Image gallery
├── cart/
│   ├── CartItem.tsx        - Cart item row
│   ├── CartSummary.tsx     - Cart totals
│   └── CartSidebar.tsx     - Mini cart
├── checkout/
│   ├── CheckoutSteps.tsx   - Step indicator
│   ├── ShippingForm.tsx    - Address form
│   └── RazorpayForm.tsx    - Payment form
├── forms/
│   ├── AddressForm.tsx
│   ├── ProfileForm.tsx
│   └── ProductForm.tsx
└── common/
    ├── Button.tsx
    ├── Input.tsx
    ├── Select.tsx
    ├── Modal.tsx
    ├── Toast.tsx
    └── LoadingSpinner.tsx
```

---

## 📦 Installation & Setup Complete

### Already Done ✅
- Dependencies installed (Redux Toolkit, Axios, etc.)
- Redux store configured
- API client with interceptors
- Environment variables set
- All API modules created
- Layout updated with Providers

### Ready to Build
Each page and component can now be built independently using:
- Redux hooks for state management
- API modules for backend calls
- Tailwind CSS for styling
- TypeScript for type safety

---

## 🎯 Implementation Priority

**Week 1**: Auth pages (login, register, verify email)
**Week 2**: Products (listing, details, search)
**Week 3**: Cart & Checkout with Razorpay
**Week 4**: User Account pages
**Week 5**: Admin Dashboard

---

## 💡 Key Implementation Tips

1. **Protected Routes**: Use `useAuth()` hook to check `isAuthenticated`
2. **API Calls**: Use Redux dispatch for async operations with thunks
3. **Form Validation**: Use Zod schemas for validation
4. **Loading States**: Show spinner while `loading` is true
5. **Error Handling**: Display `error` message if present
6. **Redirects**: Use `useRouter` from next/navigation
7. **Styling**: Use Tailwind CSS classes directly in components

---

## 📝 Example Component Template

```typescript
'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { productAPI } from '@/lib/api';
import { setProducts, setLoading } from '@/lib/store/slices/productSlice';

export default function ProductsPage() {
  const dispatch = useAppDispatch();
  const { products, loading } = useAppSelector(state => state.product);

  useEffect(() => {
    const fetchProducts = async () => {
      dispatch(setLoading(true));
      try {
        const response = await productAPI.getProducts();
        dispatch(setProducts({ 
          products: response.data.data, 
          total: response.data.pagination.total 
        }));
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchProducts();
  }, [dispatch]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map(product => (
        <div key={product.id} className="border rounded-lg p-4">
          <h3 className="font-semibold">{product.name}</h3>
          <p className="text-lg font-bold">₹{product.price}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 🚀 Next Steps

1. Build Login/Register pages with authentication flow
2. Build Product Listing page with filters and search
3. Implement Cart management
4. Build Checkout with Razorpay integration
5. Build User Account pages
6. Build Admin Dashboard
7. Test complete flow end-to-end

All infrastructure is ready. Start building pages!

---

**Status**: Frontend infrastructure complete and ready for page implementation
**Technology**: Next.js 16 + React 19 + Redux Toolkit + Tailwind CSS
**Backend**: Connected via Axios with automatic token management
