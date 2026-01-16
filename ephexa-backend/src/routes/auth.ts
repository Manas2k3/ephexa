import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/google', authController.googleAuth);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.delete('/account', authenticate, authController.deleteAccount);

export default router;
