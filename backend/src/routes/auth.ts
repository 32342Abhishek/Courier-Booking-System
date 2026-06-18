import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, getMe, createAdmin } from '../controllers/authController';
import { protect } from '../middleware/auth';
import { validateResult } from '../middleware/validator';

const router = Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('email').isEmail().withMessage('Please enter a valid email address.').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
    validateResult
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please enter a valid email address.').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required.'),
    validateResult
  ],
  login
);

router.post(
  '/create-admin',
  [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('email').isEmail().withMessage('Please enter a valid email address.').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
    body('adminSecret').notEmpty().withMessage('Admin secret key is required.'),
    validateResult
  ],
  createAdmin
);

router.get('/me', protect, getMe);

export default router;
