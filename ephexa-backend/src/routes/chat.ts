import { Router } from 'express';
import * as chatController from '../controllers/chatController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', chatController.getChats);
router.post('/', chatController.createChat);
router.delete('/:id', chatController.leaveChat);
router.get('/:id/messages', chatController.getMessages);

export default router;
