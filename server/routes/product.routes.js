import express from 'express';
import { productSchemas } from '../utils/schemas.js';
import { verifyAdmin } from '../middleware/auth.middleware.js';
import { uploadMiddleware } from '../middleware/upload.middleware.js';
import {
  getProducts,
  getProductById,
  productSearch,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controller/product.controller.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/search', productSearch);
router.get('/:id', getProductById);

router.post('/', verifyAdmin, uploadMiddleware.array('images', 5), async (req, res, next) => {
  try {
    const { error } = productSchemas.create.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        code: 'VALIDATION_ERROR'
      });
    }
    createProduct(req, res);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', verifyAdmin, uploadMiddleware.array('images', 5), async (req, res, next) => {
  try {
    const { error } = productSchemas.update.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        code: 'VALIDATION_ERROR'
      });
    }
    updateProduct(req, res);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', verifyAdmin, deleteProduct);

export default router;
