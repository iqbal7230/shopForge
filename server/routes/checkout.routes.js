import express from 'express';
import { checkoutSchemas } from '../utils/schemas.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { initiateCheckout, confirmPayment } from '../controller/checkout.controller.js';

const router = express.Router();

router.post('/', verifyToken, async (req, res, next) => {
  try {
    const { error } = checkoutSchemas.create.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        code: 'VALIDATION_ERROR'
      });
    }
    initiateCheckout(req, res);
  } catch (err) {
    next(err);
  }
});

router.post('/confirm-payment', verifyToken, async (req, res, next) => {
  try {
    const { error } = checkoutSchemas.confirmPayment.validate({
      razorpay_order_id: req.body.razorpay_order_id,
      razorpay_payment_id: req.body.razorpay_payment_id,
      razorpay_signature: req.body.razorpay_signature
    });
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        code: 'VALIDATION_ERROR'
      });
    }
    confirmPayment(req, res);
  } catch (err) {
    next(err);
  }
});

export default router;

