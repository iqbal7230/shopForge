import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', verifyToken, (req, res) => res.json({ message: 'Get wishlist - to be implemented' }));
router.post('/:product_id', verifyToken, (req, res) => res.json({ message: 'Add to wishlist - to be implemented' }));
router.delete('/:product_id', verifyToken, (req, res) => res.json({ message: 'Remove from wishlist - to be implemented' }));

export default router;
