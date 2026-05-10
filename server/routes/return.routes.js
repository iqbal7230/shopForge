import express from 'express';
import { verifyToken, verifyAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', verifyToken, (req, res) => res.json({ message: 'Get returns - to be implemented' }));
router.post('/', verifyToken, (req, res) => res.json({ message: 'Create return request - to be implemented' }));
router.get('/admin/all', verifyAdmin, (req, res) => res.json({ message: 'Get all returns - to be implemented' }));
router.patch('/:id/status', verifyAdmin, (req, res) => res.json({ message: 'Update return status - to be implemented' }));

export default router;
