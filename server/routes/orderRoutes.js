import express from 'express';
import {
  placeOrder, getMyOrders, getOrderById, updateOrderStatus,
  getSupplierOrders, getAllOrdersAdmin
} from '../controllers/orderController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, authorizeRoles('customer', 'contractor'), placeOrder);
router.get('/my', protect, authorizeRoles('customer', 'contractor'), getMyOrders);
router.get('/supplier', protect, authorizeRoles('supplier'), getSupplierOrders);
router.get('/admin/all', protect, authorizeRoles('admin'), getAllOrdersAdmin);
router.get('/:id', protect, getOrderById);
router.patch('/:id/status', protect, authorizeRoles('supplier', 'admin'), updateOrderStatus);

export default router;
