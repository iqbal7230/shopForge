import express from 'express';
import { verifyToken, verifyAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', verifyToken, (req, res) => res.json({ message: 'Get orders - to be implemented' }));
router.get('/:id', verifyToken, (req, res) => res.json({ message: 'Get order details - to be implemented' }));
router.patch('/:id/status', verifyAdmin, (req, res) => res.json({ message: 'Update order status - to be implemented' }));

export default router;
