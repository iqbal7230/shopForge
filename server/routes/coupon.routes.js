import express from 'express';
import { verifyAdmin } from '../middleware/auth.middleware.js';
import { couponSchemas } from '../utils/schemas.js';

const router = express.Router();

router.get('/', (req, res) => res.json({ message: 'Get coupons - to be implemented' }));
router.post('/', verifyAdmin, (req, res, next) => {
  const { error } = couponSchemas.create.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message, code: 'VALIDATION_ERROR' });
  res.json({ message: 'Create coupon - to be implemented' });
});
router.post('/validate', (req, res) => res.json({ message: 'Validate coupon - to be implemented' }));
router.delete('/:id', verifyAdmin, (req, res) => res.json({ message: 'Delete coupon - to be implemented' }));

export default router;
