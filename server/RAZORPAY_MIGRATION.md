# Razorpay Migration Summary

## ✅ Changes Made

### 1. Payment Configuration
- **File**: `config/stripe.js` → Now contains Razorpay SDK
- **Changes**:
  - Replaced `Stripe` SDK with `Razorpay` SDK
  - Implemented Razorpay payment functions:
    - `createOrder(amount, notes)` - Create payment order
    - `verifyPayment(paymentData)` - Verify payment signature (HMAC-SHA256)
    - `capturePayment(paymentId, amount)` - Capture authorized payment
    - `refundPayment(paymentId, amount)` - Process refunds
    - `getPaymentDetails(paymentId)` - Fetch payment info
    - `getOrderDetails(orderId)` - Fetch order info

### 2. Environment Variables
- **File**: `.env`
- **Removed**:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_WEBHOOK_SECRET`
- **Added**:
  - `RAZORPAY_KEY_ID` (rzp_test_xxx or rzp_live_xxx)
  - `RAZORPAY_KEY_SECRET`

### 3. Checkout Implementation
- **File**: `controller/checkout.controller.js` (NEW)
- **Features Implemented**:
  - `initiateCheckout()` - Creates Razorpay order
  - `confirmPayment()` - Verifies payment signature and creates order
  - Cart validation and stock checking
  - Coupon/discount application
  - Order creation and email confirmation
  - Inventory management

### 4. Checkout Routes
- **File**: `routes/checkout.routes.js` (UPDATED)
- **Endpoints**:
  - `POST /` - Initiate checkout (creates Razorpay order)
  - `POST /confirm-payment` - Verify payment and create order

### 5. Database Updates
- **Payment Status Enum**: Updated to use Razorpay states
  - `PENDING`, `CREATED`, `AUTHORIZED`, `CAPTURED`, `FAILED`, `REFUNDED`
- **Order Model**: `stripe_payment_id` field stores Razorpay `payment_id`

### 6. Validation Schemas
- **File**: `utils/schemas.js`
- **Added**: `confirmPayment` schema for Razorpay signature validation
  - `razorpay_order_id`
  - `razorpay_payment_id`
  - `razorpay_signature`

### 7. Documentation
- **NEW**: `RAZORPAY_GUIDE.md` - Complete Razorpay integration guide
  - Setup instructions
  - Test cards and testing procedures
  - Payment flow explanation
  - Error handling
  - Refund process
  - Webhook setup

### 8. API Documentation Updates
- **File**: `API_DOCUMENTATION.md`
- Changed all Stripe references to Razorpay
- Updated environment variables section
- Added Razorpay-specific payment flow

---

## 🔄 Payment Flow (Razorpay)

### Step 1: Initiate Checkout
```
Frontend → POST /api/v1/checkout
→ Backend creates Razorpay order
← Returns: razorpay_order_id, key_id, amount
```

### Step 2: Frontend Payment Form
```
Frontend displays Razorpay payment form
User enters payment details
Razorpay processes payment
Returns: payment_id, signature
```

### Step 3: Verify & Create Order
```
Frontend → POST /api/v1/checkout/confirm-payment
→ Backend verifies signature (HMAC-SHA256)
→ Creates order in database
→ Updates inventory
→ Sends confirmation email
← Returns: order created
```

---

## 💡 Key Differences: Razorpay vs Stripe

| Feature | Stripe | Razorpay |
|---------|--------|----------|
| **Currency** | Multiple (USD, EUR, INR, etc.) | Primarily INR |
| **Payment Intent** | Async confirmation via webhook | Sync verification via signature |
| **Verification** | Webhook signature verification | HMAC-SHA256 signature |
| **Refunds** | Via API call | Via API or Dashboard |
| **Test Cards** | 4242... (Visa), 4000... (failures) | 4111..., 4242..., 5555... |
| **Local Payments** | Limited | UPI, Netbanking, Wallets |
| **Best for** | Global | India-focused |

---

## 🧪 Testing Razorpay

### 1. Setup Test Keys
- Use test keys from Razorpay dashboard (start with `rzp_test_`)
- Add to `.env`:
  ```
  RAZORPAY_KEY_ID=rzp_test_xxx
  RAZORPAY_KEY_SECRET=test_secret_xxx
  ```

### 2. Test Payment Flow
1. Add products to cart
2. Go to checkout
3. Enter test card: **4111111111111111**
4. Enter any future expiry and any 3-digit CVV
5. Verify payment succeeds

### 3. Test Refunds
- Create an order successfully
- Use `/admin/returns` to initiate return
- System calls Razorpay refund API
- Money returned to test card

---

## 🚀 Migration to Live

When ready for production:

1. **Get Live Keys**
   - Complete KYC on Razorpay
   - Generate live API keys
   - Keys start with `rzp_live_`

2. **Update Environment**
   ```env
   RAZORPAY_KEY_ID=rzp_live_xxxxx
   RAZORPAY_KEY_SECRET=xxxxx
   ```

3. **Test Thoroughly**
   - Process small test transaction
   - Verify order in database
   - Check email confirmation
   - Test refund process

4. **Monitor**
   - Check Razorpay dashboard for transactions
   - Monitor order creation logs
   - Set up alerts for failed payments

---

## 📋 Checkout Implementation Status

### ✅ Completed
- Order initiation with Razorpay
- Payment signature verification
- Order creation & storage
- Cart management
- Coupon/discount application
- Inventory updates
- Email confirmations
- Shipping cost calculation
- Input validation

### 🔄 Still To Implement
- Cart add/remove/update endpoints
- Product variant CRUD
- Reviews & ratings
- Admin analytics
- Refund request workflow
- Webhook handler (optional)
- Return processing

---

## 📚 Files Modified/Created

### Modified
- `config/stripe.js` → Now Razorpay config
- `.env` → Razorpay keys
- `routes/checkout.routes.js` → Checkout endpoints
- `utils/schemas.js` → Payment schemas
- `utils/constants.js` → Payment statuses
- `API_DOCUMENTATION.md` → Razorpay docs
- `SETUP.md` → Razorpay setup

### Created
- `controller/checkout.controller.js` → Payment logic
- `RAZORPAY_GUIDE.md` → Complete integration guide

---

## 🔐 Security Measures

### Implemented
- ✅ HMAC-SHA256 signature verification
- ✅ Backend payment verification (not frontend)
- ✅ Secure key storage in .env
- ✅ Amount validation (no frontend trust)
- ✅ Stock validation before checkout
- ✅ Coupon validation
- ✅ Rate limiting on checkout endpoint
- ✅ CORS protection

### Recommendations
- Use HTTPS only in production
- Keep API secrets secure
- Monitor for failed payment attempts
- Log all payment transactions
- Set up fraud alerts
- Regular security audits

---

## 🎯 Next Steps

1. **Configure Razorpay Account**
   - Sign up on razorpay.com
   - Complete KYC
   - Get API keys

2. **Add to Environment**
   - Add keys to `.env`
   - Test with test keys first

3. **Implement Remaining Features**
   - Cart endpoints
   - Product variants
   - Reviews
   - Admin features
   - Returns/refunds

4. **Deploy to Production**
   - Use live Razorpay keys
   - Set up webhooks (recommended)
   - Monitor payments
   - Configure alerts

---

## 💬 Support

For Razorpay-specific questions:
- Refer to `RAZORPAY_GUIDE.md`
- Visit razorpay.com/docs
- Check test card list
- Review payment flow diagrams

For API implementation:
- Check `API_DOCUMENTATION.md`
- Review `checkout.controller.js`
- Check `SETUP.md` Priority 1 section

---

**Status**: ✅ Razorpay integration ready for testing and implementation
**Last Updated**: 2024-05-10
