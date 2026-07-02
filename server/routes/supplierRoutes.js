import express from 'express';
import {
  getSuppliers, getSupplierById, onboardSupplier,
  getAllSuppliersAdmin, updateSupplierStatus, upsertInventoryItem
} from '../controllers/supplierController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getSuppliers);
router.get('/admin/all', protect, authorizeRoles('admin'), getAllSuppliersAdmin);
router.get('/:id', getSupplierById);
router.post('/onboard', protect, authorizeRoles('supplier'), onboardSupplier);
router.patch('/:id/status', protect, authorizeRoles('admin'), updateSupplierStatus);
router.post('/inventory', protect, authorizeRoles('supplier'), upsertInventoryItem);

export default router;
