import express from 'express';
import { cartSchemas } from '../utils/schemas.js';
import { verifyToken, optionalToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', optionalToken, async (req, res) => {
  res.json({ message: 'Get cart - to be implemented' });
});

router.post('/add', optionalToken, async (req, res, next) => {
  try {
    const { error } = cartSchemas.addItem.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        code: 'VALIDATION_ERROR'
      });
    }
    res.json({ message: 'Add to cart - to be implemented' });
  } catch (err) {
    next(err);
  }
});

router.put('/items/:itemId', optionalToken, async (req, res, next) => {
  try {
    const { error } = cartSchemas.updateItem.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        code: 'VALIDATION_ERROR'
      });
    }
    res.json({ message: 'Update cart item - to be implemented' });
  } catch (err) {
    next(err);
  }
});

router.delete('/items/:itemId', optionalToken, async (req, res) => {
  res.json({ message: 'Remove from cart - to be implemented' });
});

router.delete('/clear', verifyToken, async (req, res) => {
  res.json({ message: 'Clear cart - to be implemented' });
});

export default router;
