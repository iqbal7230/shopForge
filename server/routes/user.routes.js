import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { addressSchemas, userSchemas } from '../utils/schemas.js';

const router = express.Router();

router.get('/profile', verifyToken, (req, res) => res.json({ message: 'Get profile - to be implemented' }));
router.put('/profile', verifyToken, (req, res, next) => {
  const { error } = userSchemas.updateProfile.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message, code: 'VALIDATION_ERROR' });
  res.json({ message: 'Update profile - to be implemented' });
});

router.get('/addresses', verifyToken, (req, res) => res.json({ message: 'Get addresses - to be implemented' }));
router.post('/addresses', verifyToken, (req, res, next) => {
  const { error } = addressSchemas.create.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message, code: 'VALIDATION_ERROR' });
  res.json({ message: 'Add address - to be implemented' });
});
router.put('/addresses/:id', verifyToken, (req, res, next) => {
  const { error } = addressSchemas.update.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message, code: 'VALIDATION_ERROR' });
  res.json({ message: 'Update address - to be implemented' });
});
router.delete('/addresses/:id', verifyToken, (req, res) => res.json({ message: 'Delete address - to be implemented' }));

export default router;
