# Razorpay Integration - Quick Start

## ✅ What's Been Done

### Payment Infrastructure
- ✅ Razorpay SDK installed and configured
- ✅ Payment verification logic implemented (HMAC-SHA256)
- ✅ Checkout flow fully implemented
- ✅ Order creation after payment
- ✅ Inventory management integrated
- ✅ Email confirmations on order

### Code Ready to Use

**Endpoints**:
```
POST /api/v1/checkout
- Creates Razorpay order
- Returns order_id, key_id, amount for frontend

POST /api/v1/checkout/confirm-payment  
- Verifies payment signature
- Creates order in database
- Sends confirmation email
```

**Key Files**:
- `config/stripe.js` - Razorpay SDK and utilities
- `controller/checkout.controller.js` - Payment logic
- `routes/checkout.routes.js` - Checkout endpoints
- `RAZORPAY_GUIDE.md` - Complete integration guide

---

## 🚀 Quick Setup

### 1. Add Razorpay Keys to .env
```env
RAZORPAY_KEY_ID=rzp_test_xxxx  # Get from Razorpay dashboard
RAZORPAY_KEY_SECRET=xxxxx      # Get from Razorpay dashboard
```

### 2. Test with Postman/Insomnia

**Request 1: Initiate Checkout**
```
POST http://localhost:8000/api/v1/checkout
Authorization: Bearer <your_token>

{
  "full_name": "John Doe",
  "phone": "9999999999",
  "street": "123 Main St",
  "city": "Mumbai",
  "state": "Maharashtra",
  "postal_code": "400001",
  "country": "India",
  "shipping_method": "FLAT",
  "coupon_code": null
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "razorpay_order_id": "order_xxx",
    "key_id": "rzp_test_xxx",
    "amount": 100000,
    "currency": "INR",
    "checkout_summary": {
      "subtotal": 999,
      "shipping_cost": 100,
      "discount_amount": 0,
      "total_amount": 1000
    }
  }
}
```

### 3. Frontend Integration
Use the returned data to initialize Razorpay on frontend:
```javascript
const options = {
  key: response.key_id,
  amount: response.amount,
  currency: "INR",
  order_id: response.razorpay_order_id,
  handler: function(response) {
    // Send response to backend for verification
    confirmPayment({
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature
    });
  }
};

const rzp = new window.Razorpay(options);
rzp.open();
```

### 4. Verify Payment
```
POST http://localhost:8000/api/v1/checkout/confirm-payment
Authorization: Bearer <token>

{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "sig_xxx",
  "full_name": "John Doe",
  "phone": "9999999999",
  "street": "123 Main St",
  "city": "Mumbai",
  "state": "Maharashtra",
  "postal_code": "400001",
  "country": "India"
}
```

---

## 🧪 Test Cards

Use these to test in sandbox mode:

| Card | Expiry | CVV | Result |
|------|--------|-----|--------|
| 4111111111111111 | Any future | Any 3 | ✅ Success |
| 4242424242424242 | Any future | Any 3 | ✅ Success |
| 4000000000000002 | Any future | Any 3 | ❌ Failure |

---

## 📊 Payment Flow Diagram

```
User
  ↓
[Add to cart] → Cart items stored
  ↓
[Checkout page]
  ↓
POST /api/v1/checkout → Backend validates
  ↓
← Returns razorpay_order_id + key_id
  ↓
[Razorpay Payment Form]
  ↓
User enters card details
  ↓
POST /api/v1/checkout/confirm-payment → Backend verifies signature
  ↓
✅ Payment verified
  ↓
Create Order + OrderItems in DB
  ↓
Update Product Stock
  ↓
Clear Cart
  ↓
Send Confirmation Email
  ↓
← Return order confirmation to user
```

---

## 🎯 What's Still Needed

### Cart System
```
POST   /api/v1/cart/add          - Add item to cart
PUT    /api/v1/cart/items/:id    - Update quantity
DELETE /api/v1/cart/items/:id    - Remove item
GET    /api/v1/cart              - Get cart
DELETE /api/v1/cart/clear        - Clear cart
```

### Orders
```
GET    /api/v1/orders            - Get user's orders
GET    /api/v1/orders/:id        - Get order details
PATCH  /api/v1/orders/:id/status - Update status (admin)
```

### Admin Features
```
GET    /api/v1/admin/analytics           - Sales analytics
GET    /api/v1/admin/orders              - All orders
GET    /api/v1/admin/inventory/low-stock - Low stock alerts
```

---

## 🔐 Security Notes

✅ **Already Implemented**:
- Payment signature verification (backend only)
- Amount validation (never trust frontend)
- Cart validation
- Stock checking
- JWT authentication
- Rate limiting

**To Remember**:
- Never expose RAZORPAY_KEY_SECRET on frontend
- Always verify signature on backend
- Test thoroughly with test keys first
- Monitor payment failures
- Log all transactions

---

## 📚 Documentation

1. **RAZORPAY_GUIDE.md** - Complete Razorpay setup guide
2. **RAZORPAY_MIGRATION.md** - What changed from Stripe
3. **API_DOCUMENTATION.md** - Full API endpoint reference
4. **SETUP.md** - Implementation roadmap

---

## ✨ Features Implemented

### ✅ Done
- User authentication
- Product catalog
- Category management
- Cart structure (DB ready)
- **Checkout & Payment** ← NEW
- **Order Creation** ← NEW
- **Payment Verification** ← NEW
- **Email Confirmations** ← NEW
- **Inventory Updates** ← NEW

### 🔄 Pending
- Cart endpoints (add/remove/update)
- Product variants
- Reviews & ratings
- Admin dashboard
- Returns & refunds
- Wishlist

---

## 📞 Next Steps

1. **Get Razorpay Keys**
   - Visit https://dashboard.razorpay.com
   - Sign up / Log in
   - Settings → API Keys
   - Copy key_id and key_secret

2. **Update .env**
   ```
   RAZORPAY_KEY_ID=your_key_id
   RAZORPAY_KEY_SECRET=your_key_secret
   ```

3. **Test Locally**
   - Start backend: `npm run dev`
   - Use Postman to test endpoints
   - Use test card: 4111111111111111

4. **Build Frontend Cart**
   - Implement cart UI
   - Call checkout endpoint
   - Show Razorpay form
   - Send payment confirmation

5. **Go Live**
   - Get live keys from Razorpay
   - Update .env
   - Deploy backend
   - Deploy frontend
   - Monitor first transactions

---

## 🎓 Learning Resources

### Official
- [Razorpay Docs](https://razorpay.com/docs/)
- [Checkout Integration](https://razorpay.com/docs/checkout/integration/)
- [API Reference](https://razorpay.com/docs/api/)

### In This Project
- `RAZORPAY_GUIDE.md` - Full integration guide
- `API_DOCUMENTATION.md` - All endpoints
- `checkout.controller.js` - Implementation example

---

## 💡 Pro Tips

1. **Test Mode First**: Always test with `rzp_test_` keys before going live
2. **Monitor Dashboard**: Keep Razorpay dashboard open during testing
3. **Signature Verification**: Never skip signature verification
4. **Error Handling**: Show users friendly error messages, not raw errors
5. **Logging**: Log all payment attempts for debugging
6. **Refunds**: Test refund process thoroughly before going live

---

## ✅ Checklist

- [ ] Get Razorpay account at razorpay.com
- [ ] Copy API keys from dashboard
- [ ] Add keys to `.env` file
- [ ] Start backend server
- [ ] Test checkout endpoint with Postman
- [ ] Test payment verification
- [ ] Build frontend cart system
- [ ] Integrate Razorpay form on frontend
- [ ] Test complete payment flow
- [ ] Get live keys from Razorpay
- [ ] Switch to live keys
- [ ] Deploy to production
- [ ] Monitor first few transactions

---

**Status**: Ready to test and integrate with frontend
**Updated**: 2024-05-10
**Technology**: Razorpay + Express.js + Prisma
