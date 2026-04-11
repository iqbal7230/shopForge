import { Router } from "express";
import {
    getProducts,
    getProductById,
    productSearch,
    createProduct,
    updateProduct,
    deleteProduct
} from "../controller/product.controller.js";

const router = Router();

// Public routes
router.get('/', getProducts);
router.get('/search', productSearch);
router.get('/:id', getProductById);

// Admin routes (requires auth middleware)
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
