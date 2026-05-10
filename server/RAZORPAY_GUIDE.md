# Razorpay Payment Integration Guide

## Overview
ShopForge uses Razorpay for payment processing. This guide explains how to set up and test Razorpay integration.

## Getting Started with Razorpay

### 1. Create Razorpay Account
1. Visit [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Sign up or log in
3. Complete KYC verification (required for live payments)

### 2. Get API Keys
1. Go to **Settings → API Keys**
2. Copy **Key ID** and **Key Secret**
3. Keep these secure, add to `.env` file:
```env
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=xxxxxxx
```

### 3. Test vs Live Keys
- **Test Mode**: Use test keys to simulate payments without real transactions
- **Live Mode**: Use live keys for actual payment processing
- Test keys always start with `rzp_test_`, live keys start with `rzp_live_`

---

## Payment Flow

### Frontend Checkout Flow

1. **User adds items to cart and proceeds to checkout**
   - Call `/api/v1/checkout` with order details

2. **Backend creates Razorpay order**
   - Returns `razorpay_order_id`, `key_id`, amount

3. **Frontend opens Razorpay payment form**
   ```javascript
   // Example React code
   const options = {
     key: response.data.key_id,
     amount: response.data.amount,
     currency: "INR",
     name: "ShopForge",
     description: "Purchase from ShopForge",
     order_id: response.data.razorpay_order_id,
     handler: function(response) {
       // Send to backend for verification
       confirmPayment(response);
     }
   };
   
   const rzp = new window.Razorpay(options);
   rzp.open();
   ```

4. **User completes payment**
   - Razorpay returns: order_id, payment_id, signature

5. **Frontend sends to backend for verification**
   - Call `POST /api/v1/checkout/confirm-payment`

6. **Backend verifies signature**
   - Confirms payment authenticity
   - Creates order and sends confirmation email
   - Clears cart and updates inventory

---

## Implementation Details

### Checkout Initiation - `POST /checkout`

**Request**:
```json
{
  "full_name": "John Doe",
  "phone": "9999999999",
  "street": "123 Main St",
  "city": "Mumbai",
  "state": "Maharashtra",
  "postal_code": "400001",
  "country": "India",
  "shipping_method": "FLAT",
  "coupon_code": "SAVE10"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "razorpay_order_id": "order_IluGWxBm9U8zJ9",
    "key_id": "rzp_live_xxxxxx",
    "user_email": "user@example.com",
    "user_name": "John Doe",
    "amount": 99900,
    "currency": "INR",
    "checkout_summary": {
      "subtotal": 999,
      "shipping_cost": 100,
      "discount_amount": 99,
      "total_amount": 1000
    }
  }
}
```

### Payment Confirmation - `POST /checkout/confirm-payment`

**Request**:
```json
{
  "razorpay_order_id": "order_IluGWxBm9U8zJ9",
  "razorpay_payment_id": "pay_IluGWxBm9U8zJ9",
  "razorpay_signature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d",
  "full_name": "John Doe",
  "phone": "9999999999",
  "street": "123 Main St",
  "city": "Mumbai",
  "state": "Maharashtra",
  "postal_code": "400001",
  "country": "India",
  "coupon_code": "SAVE10"
}
```

**Response** (on success):
```json
{
  "success": true,
  "data": {
    "order_id": "550e8400-e29b-41d4-a716-446655440000",
    "order_number": "ORD-1707123456-789",
    "status": "PROCESSING",
    "payment_status": "CAPTURED",
    "total_amount": 1000
  },
  "message": "Order placed successfully"
}
```

---

## Testing Razorpay Payments

### Test Cards

| Card Number | Expiry | CVV | Result |
|-------------|--------|-----|--------|
| 4111111111111111 | Any future | Any 3 digits | Success |
| 4242424242424242 | Any future | Any 3 digits | Success |
| 5555555555554444 | Any future | Any 3 digits | Success |
| 5200828282828210 | Any future | Any 3 digits | Success |
| 5105105105105100 | Any future | Any 3 digits | Success |

### Testing Payment Failure

Use test card: **4000000000000002**
- This will always fail, useful for testing error handling

### Test UPI

- Virtual ID: `success@razorpay`, `failure@razorpay`
- Use these to test UPI payments in test mode

---

## Payment Verification Logic

### Signature Verification (HMAC-SHA256)

```javascript
// Backend verification
const hmac = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET);
hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
const generated_signature = hmac.digest('hex');

// Compare
if (generated_signature === razorpay_signature) {
  // Payment is genuine
}
```

This ensures:
- Payment came from Razorpay
- Data wasn't tampered with
- Order amount matches what was paid

---

## Refunds

### Automatic Refund on Return Request

When a customer creates a return request and it's approved:

```javascript
// In return controller
const refund = await razorpay.payments.refund(paymentId, amountInPaise);

// Update order
await prisma.order.update({
  where: { id: orderId },
  data: { 
    payment_status: 'REFUNDED',
    status: 'REFUNDED'
  }
});
```

### Manual Refunds

From Razorpay Dashboard:
1. Go to **Transactions → Payments**
2. Find the payment
3. Click → **Refund**
4. Enter amount and reason

---

## Webhook Setup (Optional)

For async payment processing, set up webhooks in Razorpay Dashboard:

**Events to listen for**:
- `payment.authorized` - Payment successful
- `payment.failed` - Payment failed
- `payment.refunded` - Refund issued
- `invoice.paid` - Invoice marked paid

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| Invalid signature | Wrong secret key | Verify RAZORPAY_KEY_SECRET in .env |
| Order not found | Order ID doesn't exist | Check razorpay_order_id is correct |
| Payment mismatch | Amount doesn't match | Verify checkout calculation |
| Cart empty | Items removed before checkout | Handle concurrency in frontend |
| Coupon invalid | Invalid coupon code | Validate before checkout |

---

## Best Practices

### Security
- ✅ Always verify signature on backend
- ✅ Never expose key secret to frontend
- ✅ Use HTTPS only
- ✅ Validate amounts on backend
- ✅ Never trust frontend amount calculations

### User Experience
- ✅ Show order summary before payment
- ✅ Send confirmation emails
- ✅ Handle payment timeouts gracefully
- ✅ Provide clear error messages
- ✅ Allow retry on payment failure

### Payment Processing
- ✅ Create order first, then request payment
- ✅ Verify signature before creating order
- ✅ Update inventory after payment confirmation
- ✅ Send invoice/receipt immediately
- ✅ Log all payment transactions

---

## Monitoring & Analytics

### Razorpay Dashboard Metrics
- **Total Payments**: Sum of all transactions
- **Success Rate**: Percentage of successful payments
- **Refunds**: Amount and count
- **Customer Count**: Unique payers
- **Average Order Value**: Total revenue / payment count

### Custom Analytics (via backend)
```javascript
// Get order stats
const stats = await prisma.order.aggregate({
  where: { payment_status: 'CAPTURED' },
  _sum: { total_amount: true },
  _count: { id: true }
});

console.log(`Total Revenue: ₹${stats._sum.total_amount}`);
console.log(`Total Orders: ${stats._count.id}`);
```

---

## Migration from Test to Live

### Checklist

- [ ] Complete KYC verification on Razorpay
- [ ] Generate live API keys
- [ ] Update RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in production .env
- [ ] Test with small transaction on live account
- [ ] Monitor first few transactions closely
- [ ] Set up email notifications
- [ ] Configure webhook (optional but recommended)
- [ ] Document support process for payment issues
- [ ] Set up refund policy
- [ ] Train support team on refund process

---

## Support & Resources

### Razorpay Docs
- [API Reference](https://razorpay.com/docs/api/)
- [Checkout Integration](https://razorpay.com/docs/checkout/integration/)
- [Payment Verification](https://razorpay.com/docs/payments/verify-payments/)
- [Refunds](https://razorpay.com/docs/refunds/)

### Troubleshooting
- Check Razorpay Dashboard for failed payments
- Verify API keys in .env
- Check server logs for errors
- Test with test cards first
- Verify HTTPS is enabled
- Check CORS settings if frontend/backend on different domains

---

## Contact
- **Razorpay Support**: support@razorpay.com
- **Documentation**: https://razorpay.com/docs
- **Status Page**: https://status.razorpay.com
