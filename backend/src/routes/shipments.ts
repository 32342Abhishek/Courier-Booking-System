import { Router } from 'express';
import { body, param } from 'express-validator';
import { trackShipment, getAllShipments, updateShipmentStatus } from '../controllers/shipmentController';
import { protect, authorize } from '../middleware/auth';
import { validateResult } from '../middleware/validator';

const router = Router();

router.get(
  '/track/:trackingNumber',
  [
    param('trackingNumber').matches(/^TRK-\d+$/).withMessage('Invalid tracking number format. E.g., TRK-1001'),
    validateResult
  ],
  trackShipment
);

router.get('/', protect, authorize('admin'), getAllShipments);

router.patch(
  '/:id/status',
  protect,
  authorize('admin'),
  [
    param('id').isMongoId().withMessage('Invalid shipment ID format.'),
    body('status').isIn(['Approved', 'In Transit', 'Delivered']).withMessage('Status must be one of: Approved, In Transit, Delivered'),
    body('note').optional().trim().isLength({ max: 200 }).withMessage('Note cannot exceed 200 characters.'),
    validateResult
  ],
  updateShipmentStatus
);

export default router;
