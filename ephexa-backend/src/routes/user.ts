import { Router } from 'express';
import * as userController from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/me', userController.getMe);
router.patch('/me', userController.updateMe);
router.post('/block/:id', userController.blockUser);
router.delete('/block/:id', userController.unblockUser);
router.post('/report/:id', userController.reportUser);
router.get('/blocked', userController.getBlockedUsers);

export default router;
