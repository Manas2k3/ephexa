import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
    sendFriendRequest,
    respondToFriendRequest,
    getFriends,
    getPendingRequests,
    getSentRequests,
    updateAlias,
    removeFriend
} from '../controllers/friendController';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Friend request operations
router.post('/request', sendFriendRequest);
router.post('/request/:id/respond', respondToFriendRequest);

// Get friends and requests
router.get('/', getFriends);
router.get('/requests', getPendingRequests);
router.get('/requests/sent', getSentRequests);

// Friend management
router.patch('/:friendId/alias', updateAlias);
router.delete('/:friendId', removeFriend);

export default router;
