import express from 'express';
import { categorySchemas } from '../utils/schemas.js';
import { verifyAdmin } from '../middleware/auth.middleware.js';
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} from '../controller/category.controller.js';

const router = express.Router();

router.get('/', getCategories);
router.get('/:id', getCategoryById);

router.post('/', verifyAdmin, async (req, res, next) => {
  try {
    const { error } = categorySchemas.create.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        code: 'VALIDATION_ERROR'
      });
    }
    createCategory(req, res);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', verifyAdmin, async (req, res, next) => {
  try {
    const { error } = categorySchemas.update.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        code: 'VALIDATION_ERROR'
      });
    }
    updateCategory(req, res);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', verifyAdmin, deleteCategory);

export default router;
