import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as friendController from '../controllers/friendController';

const router = Router();

router.use(authenticate);

router.post('/request', friendController.sendRequest);
router.post('/respond', friendController.respondRequest);
router.get('/', friendController.listFriends);
router.patch('/:friendId/alias', friendController.updateAlias);
router.delete('/:friendId', friendController.removeFriend);

export default router;
