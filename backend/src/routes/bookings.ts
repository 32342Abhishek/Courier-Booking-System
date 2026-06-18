import { Router } from 'express';
import { body, param } from 'express-validator';
import { createBooking, getMyBookings, getAllBookings, approveBooking, rejectBooking } from '../controllers/bookingController';
import { protect, authorize } from '../middleware/auth';
import { validateResult } from '../middleware/validator';

const router = Router();
router.use(protect);

router.post(
  '/',
  authorize('customer'),
  [
    body('senderName').trim().notEmpty().withMessage('Sender name is required.'),
    body('senderPhone').trim().notEmpty().withMessage('Sender phone number is required.'),
    body('senderAddress').trim().notEmpty().withMessage('Sender address is required.'),
    body('receiverName').trim().notEmpty().withMessage('Receiver name is required.'),
    body('receiverPhone').trim().notEmpty().withMessage('Receiver phone number is required.'),
    body('receiverAddress').trim().notEmpty().withMessage('Receiver address is required.'),
    body('packageType').trim().notEmpty().withMessage('Package type is required.'),
    body('packageWeight').isFloat({ gt: 0 }).withMessage('Package weight must be a number greater than 0.'),
    body('packageImage').optional().trim(),
    body('calculatedPrice').optional().isFloat({ min: 0 }).withMessage('Calculated price must be a non-negative number.'),
    body('paymentStatus').optional().isIn(['Pending', 'Paid']).withMessage('Payment status must be Pending or Paid.'),
    body('paymentMethod').optional().isIn(['Card', 'UPI', 'Net Banking']).withMessage('Invalid payment method.'),
    body('paymentTransactionId').optional().trim(),
    validateResult
  ],
  createBooking
);

router.get('/my', authorize('customer'), getMyBookings);
router.get('/', authorize('admin'), getAllBookings);

router.patch(
  '/:id/approve',
  authorize('admin'),
  [
    param('id').isMongoId().withMessage('Invalid booking ID format.'),
    validateResult
  ],
  approveBooking
);

router.patch(
  '/:id/reject',
  authorize('admin'),
  [
    param('id').isMongoId().withMessage('Invalid booking ID format.'),
    validateResult
  ],
  rejectBooking
);

export default router;
