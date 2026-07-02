import express from 'express';
import {
  getProducts, getProductById, getCategories,
  createProduct, updateProduct
} from '../controllers/productController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.get('/categories', getCategories);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', protect, authorizeRoles('admin'), createProduct);
router.put('/:id', protect, authorizeRoles('admin'), updateProduct);

export default router;
