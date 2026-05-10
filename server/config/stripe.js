import Razorpay from 'razorpay';
import crypto from 'crypto';

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

export const createOrder = async (amount, notes = {}) => {
  try {
    const options = {
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `order_${Date.now()}`,
      notes: {
        ...notes
      }
    };

    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};

export const verifyPayment = (paymentData) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;

    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    return generated_signature === razorpay_signature;
  } catch (error) {
    console.error('Error verifying payment:', error);
    return false;
  }
};

export const capturePayment = async (paymentId, amount) => {
  try {
    const payment = await razorpay.payments.capture(paymentId, Math.round(amount * 100), 'INR');
    return payment;
  } catch (error) {
    console.error('Error capturing payment:', error);
    throw error;
  }
};

export const refundPayment = async (paymentId, amount = null) => {
  try {
    const refund = await razorpay.payments.refund(paymentId, amount ? Math.round(amount * 100) : undefined);
    return refund;
  } catch (error) {
    console.error('Error processing refund:', error);
    throw error;
  }
};

export const getPaymentDetails = async (paymentId) => {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error('Error fetching payment details:', error);
    throw error;
  }
};

export const getOrderDetails = async (orderId) => {
  try {
    const order = await razorpay.orders.fetch(orderId);
    return order;
  } catch (error) {
    console.error('Error fetching order details:', error);
    throw error;
  }
};

