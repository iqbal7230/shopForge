import { prisma } from '../config/db.js';
import { successResponse, errorResponse, createdResponse } from '../utils/response.js';
import { ERROR_MESSAGES, OrderStatus, PaymentStatus } from '../utils/constants.js';
import { createOrder, verifyPayment } from '../config/stripe.js';
import { sendEmail, emailTemplates } from '../config/email.js';
import { v4 as uuidv4 } from 'uuid';

export const initiateCheckout = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { address_id, full_name, phone, street, city, state, postal_code, country, shipping_method, coupon_code } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const cart = await prisma.cart.findFirst({
      where: { user_id: userId },
      include: { items: { include: { product: true, variant: true } } }
    });

    if (!cart || cart.items.length === 0) {
      return errorResponse(res, 400, ERROR_MESSAGES.CART_EMPTY, 'CART_EMPTY');
    }

    let subtotal = 0;
    for (const item of cart.items) {
      const price = item.variant?.price || item.product.price;
      subtotal += parseFloat(price) * item.quantity;

      if (item.product.stock_qty < item.quantity) {
        return errorResponse(res, 400, `Insufficient stock for ${item.product.name}`, 'INSUFFICIENT_STOCK');
      }
    }

    const shippingCost = shipping_method === 'FLAT' ? 100 : 50;
    let discountAmount = 0;

    if (coupon_code) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: coupon_code }
      });

      if (!coupon || !coupon.is_active) {
        return errorResponse(res, 400, ERROR_MESSAGES.COUPON_INVALID, 'COUPON_INVALID');
      }

      if (coupon.expires_at && new Date() > coupon.expires_at) {
        return errorResponse(res, 400, ERROR_MESSAGES.COUPON_EXPIRED, 'COUPON_EXPIRED');
      }

      if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
        return errorResponse(res, 400, ERROR_MESSAGES.COUPON_USAGE_LIMIT_EXCEEDED, 'LIMIT_EXCEEDED');
      }

      if (coupon.min_purchase && subtotal < coupon.min_purchase) {
        return errorResponse(res, 400, `Minimum purchase of ₹${coupon.min_purchase} required`, 'MIN_PURCHASE_NOT_MET');
      }

      if (coupon.type === 'PERCENT') {
        discountAmount = (subtotal * coupon.value) / 100;
      } else {
        discountAmount = coupon.value;
      }

      if (coupon.max_discount && discountAmount > coupon.max_discount) {
        discountAmount = coupon.max_discount;
      }
    }

    const totalAmount = subtotal + shippingCost - discountAmount;

    try {
      const razorpayOrder = await createOrder(totalAmount, {
        user_id: userId,
        user_email: user.email,
        user_name: user.full_name
      });

      createdResponse(res, {
        razorpay_order_id: razorpayOrder.id,
        key_id: process.env.RAZORPAY_KEY_ID,
        user_email: user.email,
        user_name: user.full_name,
        amount: totalAmount * 100,
        currency: 'INR',
        checkout_summary: {
          subtotal,
          shipping_cost: shippingCost,
          discount_amount: discountAmount,
          total_amount: totalAmount
        },
        shipping_address: {
          full_name,
          phone,
          street,
          city,
          state,
          postal_code,
          country
        }
      }, 'Checkout initiated. Proceed to payment.');
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      errorResponse(res, 500, 'Failed to initiate payment', 'PAYMENT_INIT_ERROR');
    }
  } catch (error) {
    console.error('Checkout error:', error);
    errorResponse(res, 500, ERROR_MESSAGES.INTERNAL_ERROR, 'CHECKOUT_ERROR');
  }
};

export const confirmPayment = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, address_id, full_name, phone, street, city, state, postal_code, country, coupon_code } = req.body;

    const isPaymentValid = verifyPayment({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    });

    if (!isPaymentValid) {
      return errorResponse(res, 400, 'Payment verification failed', 'PAYMENT_VERIFICATION_FAILED');
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const cart = await prisma.cart.findFirst({
      where: { user_id: userId },
      include: { items: { include: { product: true, variant: true } } }
    });

    if (!cart || cart.items.length === 0) {
      return errorResponse(res, 400, ERROR_MESSAGES.CART_EMPTY, 'CART_EMPTY');
    }

    let subtotal = 0;
    let couponId = null;
    let discountAmount = 0;

    for (const item of cart.items) {
      const price = item.variant?.price || item.product.price;
      subtotal += parseFloat(price) * item.quantity;
    }

    const shippingCost = 100;

    if (coupon_code) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: coupon_code }
      });

      if (coupon) {
        couponId = coupon.id;
        if (coupon.type === 'PERCENT') {
          discountAmount = (subtotal * coupon.value) / 100;
        } else {
          discountAmount = coupon.value;
        }

        if (coupon.max_discount && discountAmount > coupon.max_discount) {
          discountAmount = coupon.max_discount;
        }

        await prisma.coupon.update({
          where: { id: coupon.id },
          data: { usage_count: coupon.usage_count + 1 }
        });
      }
    }

    const totalAmount = subtotal + shippingCost - discountAmount;
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const order = await prisma.order.create({
      data: {
        user_id: userId,
        order_number: orderNumber,
        status: OrderStatus.PROCESSING,
        payment_status: PaymentStatus.CAPTURED,
        subtotal: parseFloat(subtotal.toFixed(2)),
        shipping_cost: shippingCost,
        tax_amount: 0,
        discount_amount: parseFloat(discountAmount.toFixed(2)),
        total_amount: parseFloat(totalAmount.toFixed(2)),
        coupon_id: couponId,
        shipping_address: JSON.stringify({
          full_name,
          phone,
          street,
          city,
          state,
          postal_code,
          country
        }),
        stripe_payment_id: razorpay_payment_id
      }
    });

    for (const item of cart.items) {
      const price = item.variant?.price || item.product.price;
      await prisma.orderItem.create({
        data: {
          order_id: order.id,
          product_id: item.product_id,
          variant_id: item.variant_id,
          quantity: item.quantity,
          price: parseFloat(price),
          product_snapshot: JSON.stringify({
            name: item.product.name,
            slug: item.product.slug,
            image: item.product.images ? item.product.images.urls?.[0] : null
          })
        }
      });

      await prisma.product.update({
        where: { id: item.product_id },
        data: { stock_qty: { decrement: item.quantity } }
      });

      if (item.variant) {
        await prisma.productVariant.update({
          where: { id: item.variant_id },
          data: { stock: { decrement: item.quantity } }
        });
      }
    }

    await prisma.cart.delete({ where: { id: cart.id } });

    const orderData = {
      order_number: order.order_number,
      total_amount: order.total_amount,
      items: cart.items.map(item => ({
        product_name: item.product.name,
        quantity: item.quantity,
        price: item.variant?.price || item.product.price
      }))
    };

    await sendEmail(user.email, 'Order Confirmation', emailTemplates.orderConfirmation(orderData));

    successResponse(res, 201, {
      order_id: order.id,
      order_number: order.order_number,
      status: order.status,
      payment_status: order.payment_status,
      total_amount: order.total_amount,
      message: 'Payment successful. Order created.'
    }, 'Order placed successfully');
  } catch (error) {
    console.error('Payment confirmation error:', error);
    errorResponse(res, 500, ERROR_MESSAGES.INTERNAL_ERROR, 'PAYMENT_CONFIRMATION_ERROR');
  }
};
