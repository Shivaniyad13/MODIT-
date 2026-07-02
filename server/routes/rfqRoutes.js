import express from 'express';
import {
  createRFQ, getMyRFQs, getOpenRFQs, submitQuotation,
  getRFQQuotations, acceptQuotation
} from '../controllers/rfqController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, authorizeRoles('contractor', 'customer'), createRFQ);
router.get('/my', protect, authorizeRoles('contractor', 'customer'), getMyRFQs);
router.get('/open', protect, authorizeRoles('supplier'), getOpenRFQs);
router.post('/:rfqId/quote', protect, authorizeRoles('supplier'), submitQuotation);
router.get('/:rfqId/quotes', protect, authorizeRoles('contractor', 'customer', 'admin'), getRFQQuotations);
router.post('/:rfqId/quotes/:quotationId/accept', protect, authorizeRoles('contractor', 'customer'), acceptQuotation);

export default router;
