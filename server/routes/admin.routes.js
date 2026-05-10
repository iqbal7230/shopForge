import express from 'express';
import { verifyAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/analytics', verifyAdmin, (req, res) => res.json({ message: 'Get analytics - to be implemented' }));
router.get('/orders', verifyAdmin, (req, res) => res.json({ message: 'Get all orders - to be implemented' }));
router.get('/customers', verifyAdmin, (req, res) => res.json({ message: 'Get customers - to be implemented' }));
router.get('/inventory/low-stock', verifyAdmin, (req, res) => res.json({ message: 'Get low stock products - to be implemented' }));

export default router;
