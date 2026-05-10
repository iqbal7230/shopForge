# ShopForge Backend API Documentation

## Overview
ShopForge is a full-featured ecommerce platform backend built with Express.js, Prisma ORM, PostgreSQL, and integrated payment processing with Stripe.

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication
Most endpoints require JWT authentication. Include token in Authorization header:
```
Authorization: Bearer <access_token>
```

---

## API Endpoints

### Authentication (`/auth`)

#### Register User
```
POST /auth/register
Body: { fullname, email, password }
Response: { user, token }
Notes: Password must be min 6 chars. Email verification link sent.
```

#### Login User
```
POST /auth/login
Body: { email, password, guest_session_id? }
Response: { user, accessToken, refreshToken }
Notes: Auto-merges guest cart on login if session_id provided
```

#### Refresh Access Token
```
POST /auth/refresh-token
Body: { refreshToken }
Response: { accessToken }
```

#### Logout
```
POST /auth/logout
Headers: Authorization: Bearer <token>
Body: { refreshToken }
```

#### Verify Email
```
POST /auth/verify-email
Body: { token }
Notes: Token from email verification link, valid 24h
```

#### Forgot Password
```
POST /auth/forgot-password
Body: { email }
Notes: Sends reset link to email, valid 1 hour
```

#### Reset Password
```
POST /auth/reset-password
Body: { token, password }
Notes: Use token from forgot-password email
```

#### Change Password
```
POST /auth/change-password
Headers: Authorization: Bearer <token>
Body: { current_password, new_password }
```

---

### Products (`/products`)

#### Get All Products (Paginated & Filtered)
```
GET /products?page=1&limit=10&category_id=&min_price=&max_price=&sort=newest
Query Params:
  - page: Page number (default: 1)
  - limit: Items per page (default: 10, max: 100)
  - category_id: Filter by category UUID
  - min_price: Minimum price filter
  - max_price: Maximum price filter
  - sort: newest|price_low|price_high (default: newest)
Response: { data: [products], pagination: {page, limit, total, pages} }
```

#### Search Products
```
GET /products/search?q=shirt&page=1&limit=10
Query Params:
  - q: Search query (required)
  - page, limit: Pagination
Response: { data: [products], pagination }
```

#### Get Product Details
```
GET /products/:id
Response: { data: {product, variants, reviews, average_rating, review_count} }
```

#### Create Product (Admin Only)
```
POST /products
Headers: Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
Body:
  - name: string (required)
  - slug: string (required, unique)
  - description: string
  - price: number (required)
  - compare_price: number
  - category_id: UUID
  - stock_qty: number
  - images: files (up to 5)
Response: { data: product }
```

#### Update Product (Admin Only)
```
PUT /products/:id
Headers: Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
Body: Same as create product (all optional)
Response: { data: product }
```

#### Delete Product (Admin Only, Soft Delete)
```
DELETE /products/:id
Headers: Authorization: Bearer <admin_token>
Response: { data: null, message: "Product deleted" }
```

---

### Categories (`/categories`)

#### Get All Categories
```
GET /categories?page=1&limit=10
Response: { data: [categories], pagination }
```

#### Get Category By ID
```
GET /categories/:id
Response: { data: {category, children, parent, products} }
```

#### Create Category (Admin Only)
```
POST /categories
Headers: Authorization: Bearer <admin_token>
Body: { name, slug, parent_id? }
Response: { data: category }
```

#### Update Category (Admin Only)
```
PUT /categories/:id
Headers: Authorization: Bearer <admin_token>
Body: { name?, slug?, parent_id? }
Response: { data: category }
```

#### Delete Category (Admin Only)
```
DELETE /categories/:id
Headers: Authorization: Bearer <admin_token>
Notes: Cannot delete if products exist
Response: { data: null }
```

---

### Cart (`/cart`) - To Be Implemented
- `GET /` - Get cart items
- `POST /add` - Add item to cart
- `PUT /items/:itemId` - Update item quantity
- `DELETE /items/:itemId` - Remove item
- `DELETE /clear` - Clear entire cart

---

### Checkout (`/checkout`) - Razorpay Integration

#### Initiate Checkout (Create Razorpay Order)
```
POST /checkout
Headers: Authorization: Bearer <token>
Body: {
  full_name: string,
  phone: string,
  street: string,
  city: string,
  state: string,
  postal_code: string,
  country: string,
  shipping_method: 'FLAT' | 'WEIGHT',
  coupon_code?: string
}

Response: {
  data: {
    razorpay_order_id: string,
    key_id: string,
    amount: number (in paise),
    currency: 'INR',
    checkout_summary: {
      subtotal,
      shipping_cost,
      discount_amount,
      total_amount
    }
  }
}

Notes:
- Returns Razorpay order details to proceed with payment on frontend
- Use razorpay_order_id and key_id in frontend payment form
- Amount is in paise (multiply by 100)
```

#### Confirm Payment (Verify & Create Order)
```
POST /checkout/confirm-payment
Headers: Authorization: Bearer <token>
Body: {
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string,
  full_name: string,
  phone: string,
  street: string,
  city: string,
  state: string,
  postal_code: string,
  country: string,
  coupon_code?: string
}

Response: {
  data: {
    order_id: UUID,
    order_number: string,
    status: 'PROCESSING',
    payment_status: 'CAPTURED',
    total_amount: number
  },
  message: "Order placed successfully"
}

Notes:
- Signature verification ensures payment authenticity
- Cart is cleared after successful order
- Stock is updated
- Order confirmation email is sent
- On failure, returns payment verification error
```

---

### Orders (`/orders`) - To Be Implemented
- `GET /` - Get user's orders
- `GET /:id` - Get order details
- `PATCH /:id/status` - Update order status (Admin only)

---

### User Profile (`/user`)
- `GET /profile` - Get user profile
- `PUT /profile` - Update profile
- `GET /addresses` - Get saved addresses
- `POST /addresses` - Add new address
- `PUT /addresses/:id` - Update address
- `DELETE /addresses/:id` - Delete address

---

### Admin Dashboard (`/admin`) - To Be Implemented
- `GET /analytics` - Get sales analytics
- `GET /orders` - Get all orders
- `GET /customers` - Get customer list
- `GET /inventory/low-stock` - Get low stock products

---

### Coupons (`/coupons`) - To Be Implemented
- `GET /` - List coupons
- `POST /` - Create coupon (Admin only)
- `POST /validate` - Validate coupon code
- `DELETE /:id` - Delete coupon (Admin only)

---

### Wishlist (`/wishlist`)
- `GET /` - Get user's wishlist
- `POST /:product_id` - Add product to wishlist
- `DELETE /:product_id` - Remove from wishlist

---

### Returns (`/returns`) - To Be Implemented
- `GET /` - Get user's returns
- `POST /` - Create return request
- `GET /admin/all` - Get all returns (Admin only)
- `PATCH /:id/status` - Update return status (Admin only)

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "code": "ERROR_CODE",
  "errors": []
}
```

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| VALIDATION_ERROR | 400 | Input validation failed |
| UNAUTHORIZED | 401 | No token or invalid token |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| USER_EXISTS | 400 | User already registered |
| INVALID_CREDENTIALS | 400 | Wrong email/password |
| INVALID_TOKEN | 401 | Token invalid or expired |
| PRODUCT_NOT_FOUND | 404 | Product doesn't exist |
| INSUFFICIENT_STOCK | 400 | Not enough stock |
| INTERNAL_ERROR | 500 | Server error |

---

## Environment Variables Required

```env
# Server
PORT=8000
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://...

# JWT
SECRETKEY=your_jwt_secret
JWT_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Cloudinary (Images)
CLOUDNAME=your_cloudinary_name
APIKEY=your_cloudinary_key
APISECRET=your_cloudinary_secret

# Razorpay Payment Gateway
RAZORPAY_KEY_ID=rzp_live_your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# Email (Nodemailer SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@shopforge.com
```

---

## Implementation Status

### Completed ✅
- Authentication system (register, login, JWT, password reset, email verification)
- Product CRUD with image uploads
- Category management with hierarchy
- Prisma database schema
- Middleware (auth, error handling)
- Email service setup
- Stripe config

### In Progress 🔄
- Cart management
- Checkout process
- Order creation and tracking

### Pending ⏳
- Admin dashboard & analytics
- Coupon/discount system
- Returns & refunds
- Reviews & ratings
- Wishlist
- Order confirmation emails
- Payment webhook handling

---

## Development Tips

### Running Server
```bash
cd server
npm run dev
```

### Database Migrations (when DB is accessible)
```bash
npx prisma migrate dev --name migration_name
npx prisma studio  # GUI database browser
```

### Testing Stripe
Use test card: `4242 4242 4242 4242`

### Testing Emails
Configure SMTP or use Mailhog for local email testing

---

## Security Notes
- Never commit .env files
- All passwords hashed with bcrypt (salt 12)
- JWT tokens validated on protected routes
- Admin endpoints require ADMIN role
- CORS configured for frontend URL only
- Rate limiting on auth endpoints

---

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **ORM**: Prisma
- **Database**: PostgreSQL (Neon)
- **Authentication**: JWT
- **Payments**: Stripe
- **File Storage**: Cloudinary
- **Email**: Nodemailer
- **Validation**: Joi
- **Security**: Helmet, bcrypt
