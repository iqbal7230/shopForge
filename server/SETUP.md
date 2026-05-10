# ShopForge Backend - Setup & Implementation Guide

## Initial Setup

### 1. Prerequisites
- Node.js 18+
- PostgreSQL database (or use Neon - already configured)
- npm/yarn

### 2. Environment Configuration
Update `.env` file with your actual credentials:

```env
# Database - Already configured with Neon
DATABASE_URL=postgresql://...

# JWT - Change to strong secret
SECRETKEY=change_this_to_strong_secret_key
JWT_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Razorpay - Add your live keys from dashboard
RAZORPAY_KEY_ID=rzp_live_YOUR_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET

# Email - Configure SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password  # Gmail: Use App Password
SMTP_FROM=noreply@shopforge.com

# Frontend
FRONTEND_URL=http://localhost:3000
```

### 3. Database Setup
When PostgreSQL is accessible:

```bash
cd server
# Apply all migrations
npx prisma migrate dev

# View database in GUI
npx prisma studio
```

### 4. Run Development Server
```bash
npm run dev
```

Server will start at `http://localhost:8000`

---

## Implementation Roadmap

### Priority 1: Core E-commerce Flow
These features are essential for MVP.

#### Cart System
**Files**: `controller/cart.controller.js`, `routes/cart.routes.js`

**Features to implement**:
1. Create/get cart for authenticated user or guest (session-based)
2. Add item to cart (check stock availability)
3. Update item quantity
4. Remove item from cart
5. Calculate subtotal and apply discounts
6. Cart merging: On login, merge guest cart into user cart

**Database**: Use Cart and CartItem tables

**Key logic**:
- Guest carts use session_id, user carts use user_id
- Check variant stock before adding
- Validate quantity doesn't exceed stock
- Calculate totals with applied coupons

---

#### Checkout System
**Files**: `controller/checkout.controller.js`, `routes/checkout.routes.js`

**Features to implement**:
1. Validate cart items (stock, pricing)
2. Calculate shipping costs (flat or weight-based)
3. Apply coupon discount
4. Create Stripe PaymentIntent
5. Return client_secret for frontend payment confirmation

**Database**: Use Order and OrderItem tables

**Integration points**:
- Stripe config: `config/stripe.js` (createPaymentIntent function)
- Uses createPaymentIntent from stripe config
- Store payment_intent_id in Order.stripe_payment_id

**Key logic**:
```javascript
// 1. Validate cart
// 2. Calculate totals
const subtotal = cartItems.sum(item => item.price * item.quantity);
const shipping = calculateShipping(shippingMethod, weight);
const discount = applyCoupon(couponCode);
const total = subtotal + shipping - discount;

// 3. Create payment intent
const paymentIntent = await createPaymentIntent(total, orderId);

// 4. Return client_secret
return { clientSecret: paymentIntent.client_secret };
```

---

#### Order Management
**Files**: `controller/order.controller.js`, `routes/order.routes.js`

**Features to implement**:
1. Create order from checkout data
2. Get user's orders (paginated, with filters)
3. Get order details (with items, shipping, timeline)
4. Admin: Update order status (pending → processing → shipped → delivered)
5. Send order confirmation email

**Database**: Order, OrderItem, ReturnRequest tables

**Key logic**:
```javascript
// Create order
const order = await prisma.order.create({
  data: {
    user_id: userId,
    order_number: generateOrderNumber(),
    status: OrderStatus.PENDING,
    payment_status: PaymentStatus.PENDING,
    subtotal,
    shipping_cost,
    total_amount,
    shipping_address: JSON.stringify(address),
    coupon_id,
    stripe_payment_id
  }
});

// Create order items (copy from cart)
for (const item of cartItems) {
  await prisma.orderItem.create({
    data: {
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
      product_snapshot: JSON.stringify(product) // Snapshot for history
    }
  });
}

// Send confirmation email
await sendEmail(user.email, 'Order Confirmation', 
  emailTemplates.orderConfirmation(order));
```

**Admin endpoint**:
```javascript
// PATCH /admin/orders/:id/status
// Body: { status: 'SHIPPED', notes?: '' }
```

---

### Priority 2: Payments & Webhooks
#### Razorpay Webhook Handler (Optional - for async confirmations)
**Files**: Add webhook endpoint in `server.js`

**Implementation** (if async webhook processing is needed):
```javascript
app.post('/webhooks/razorpay', express.raw({type: 'application/json'}), async (req, res) => {
  const event = req.body;
  
  if (event.event === 'payment.authorized') {
    const paymentId = event.payload.payment.entity.id;
    const orderId = event.payload.payment.entity.notes.order_id;
    
    // Update order status if payment succeeds asynchronously
    await prisma.order.update({
      where: { stripe_payment_id: paymentId },
      data: { payment_status: 'CAPTURED' }
    });
  }
  
  if (event.event === 'payment.failed') {
    const paymentId = event.payload.payment.entity.id;
    
    // Handle payment failure
  }
  
  res.json({ received: true });
});
```

**Setup in Razorpay Dashboard**:
1. Go to Settings → Webhooks
2. Add webhook URL: `https://yourdomain.com/webhooks/razorpay`
3. Select events: payment.authorized, payment.failed, payment.refunded
4. Add webhook secret to verify signatures

**Note**: Current implementation uses synchronous verification (recommend for simpler flow)


### Priority 3: User & Product Features

#### Product Variants
**Files**: `controller/variant.controller.js`, new routes

**Features**:
- Create variant (sku, size, color, stock, price)
- Get variants for product
- Update variant stock
- Delete variant

**Database**: ProductVariant table

**API Endpoints**:
```
POST /products/:id/variants - Create
GET /products/:id/variants - List
PUT /variants/:id - Update
DELETE /variants/:id - Delete
```

---

#### Product Reviews
**Files**: `controller/review.controller.js`, new routes

**Features**:
- Create review (only post-purchase)
- Get product reviews (paginated)
- One review per user per product

**Database**: Review table

**Validation**:
```javascript
// Check user purchased this product
const order = await prisma.order.findFirst({
  where: {
    user_id: userId,
    items: { some: { product_id } }
  }
});

// Check no existing review
const existing = await prisma.review.findUnique({
  where: {
    product_id_user_id: { product_id, user_id }
  }
});
```

---

#### User Profile
**Files**: `controller/user.controller.js` (expand)

**Features**:
- Get profile
- Update profile (name, email, avatar)
- Delete account
- View saved addresses

---

#### Wishlist
**Files**: `controller/wishlist.controller.js`

**Features**:
- Add product to wishlist
- Remove from wishlist
- Get wishlist items (with current pricing)

**Database**: Wishlist table

---

### Priority 4: Admin Features

#### Admin Analytics Dashboard
**Files**: `controller/analytics.controller.js`, routes

**Metrics to track**:
- Total revenue (date range)
- Total orders
- Average order value
- Top 10 products
- Top 10 customers
- Revenue by category
- Orders by status
- Monthly/weekly trends

**Sample endpoint**:
```javascript
GET /admin/analytics?start_date=2024-01-01&end_date=2024-12-31

Response: {
  revenue: 50000,
  order_count: 500,
  avg_order_value: 100,
  top_products: [{product, revenue, units_sold}],
  orders_by_status: {PENDING: 10, PROCESSING: 20, ...},
  trends: {daily: [...], weekly: [...]}
}
```

---

#### Coupon Management
**Files**: `controller/coupon.controller.js`, routes

**Features**:
- Create coupon (percent or fixed discount)
- List active/expired coupons
- Validate coupon
- Track usage
- Deactivate coupon

**Database**: Coupon table

**Validation logic**:
```javascript
// When applying coupon
const coupon = await prisma.coupon.findUnique({
  where: { code: couponCode }
});

if (!coupon?.is_active) throw new Error('Invalid coupon');
if (new Date() > coupon.expires_at) throw new Error('Expired');
if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) 
  throw new Error('Limit reached');
if (orderTotal < coupon.min_purchase) throw new Error('Min purchase not met');

const discount = coupon.type === 'PERCENT' 
  ? (orderTotal * coupon.value) / 100 
  : coupon.value;
```

---

#### Inventory Management
**Files**: `controller/inventory.controller.js`

**Features**:
- Get low stock products
- Update stock manually
- Automatic stock reduction on order
- Stock alerts

**Low stock endpoint**:
```javascript
GET /admin/inventory/low-stock?threshold=5

// Returns products where stock < threshold
```

---

### Priority 5: Returns & Refunds

#### Return Requests
**Files**: `controller/return.controller.js`, routes

**Workflow**:
1. User creates return request from order
2. Admin reviews and approves/rejects
3. If approved, process refund
4. Update order status to REFUNDED

**Database**: ReturnRequest table

**Endpoints**:
```
POST /returns - Create return request
GET /returns - Get user's returns
GET /admin/returns - Get all returns (admin)
PATCH /returns/:id/status - Update status (admin)
```

---

## Testing the Backend

### Using Postman/Insomnia
1. Import endpoints from API_DOCUMENTATION.md
2. Set variables:
   - `base_url`: http://localhost:8000/api/v1
   - `access_token`: From login response
   - `refresh_token`: From login response

### Test Flow
1. **Register**: POST /auth/register
2. **Verify Email**: POST /auth/verify-email (with token from email)
3. **Login**: POST /auth/login
4. **Browse Products**: GET /products
5. **Add to Cart**: POST /cart/add (need to implement)
6. **Checkout**: POST /checkout (need to implement)
7. **Create Order**: After payment confirmed (need to implement)

### Database Testing
```bash
# GUI browser
npx prisma studio

# Query examples
# Select * FROM "User" limit 10;
# Select * FROM "Product" where is_deleted = false;
```

---

## Next Steps for User

1. **Verify Stripe keys** - Get from Stripe Dashboard, update .env
2. **Test database connection** - Run `npx prisma migrate dev` when DB is accessible
3. **Implement Priority 1 features** - Cart, Checkout, Orders (core flow)
4. **Integrate with Next.js frontend** - Update FRONTEND_URL in .env
5. **Add webhook handler** - For Stripe payment confirmations
6. **Complete Priority 2-5 features** - Based on business needs

---

## Common Issues & Solutions

### "Cannot reach database"
- Ensure DATABASE_URL is correct
- Check firewall/network access to PostgreSQL
- Verify Neon account status

### Email not sending
- Verify SMTP credentials (Gmail requires App Password, not regular password)
- Check email is verified on SMTP provider
- Enable "Less Secure Apps" if using Gmail

### Stripe errors
- Verify SECRET_KEY is in .env (not PUBLISHABLE)
- For testing, use test keys (sk_test_..., pk_test_...)
- Check webhook secret is set

### Import errors
- Run `npm install` to ensure all packages present
- Check file paths are relative correctly
- Clear node_modules and reinstall if issues persist: `rm -rf node_modules && npm install`

---

## Performance Optimization (Future)

- Add database indexing on frequently queried fields
- Implement caching (Redis) for product lists
- Add pagination defaults to prevent large queries
- Use database query optimization (avoid N+1 queries)
- Compress images before Cloudinary upload
- Implement API rate limiting per user

---

## Security Checklist

- [ ] Change JWT_SECRET to strong random value
- [ ] Use HTTPS in production
- [ ] Set secure CORS origin (not *)
- [ ] Enable CSRF protection
- [ ] Validate all user inputs
- [ ] Sanitize outputs to prevent XSS
- [ ] Use environment variables, never hardcode secrets
- [ ] Enable database encryption
- [ ] Set up regular backups
- [ ] Monitor error logs
- [ ] Implement rate limiting
- [ ] Use HTTPS only for Stripe
