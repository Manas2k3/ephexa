import type { Request, Response } from 'express';
import * as friendService from '../services/friendService';
import { getIO } from '../app';
import { getUserSocket } from '../config/redis';

// Send a friend request
export async function sendFriendRequest(req: Request, res: Response) {
    try {
        const userId = (req as any).userId;
        const { receiverId, metVia, metRoomId } = req.body;

        if (!receiverId || !metVia) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: receiverId and metVia'
            });
        }

        if (!['CHAT', 'VIDEO_CALL'].includes(metVia)) {
            return res.status(400).json({
                success: false,
                error: 'metVia must be CHAT or VIDEO_CALL'
            });
        }

        const request = await friendService.sendFriendRequest(
            userId,
            receiverId,
            metVia,
            metRoomId
        );

        // Emit socket event to receiver if they're online
        try {
            const receiverSocketId = await getUserSocket(receiverId);
            if (receiverSocketId) {
                const io = getIO();
                io.to(receiverSocketId).emit('friend_request_received', {
                    requestId: request.id,
                    senderId: userId,
                    metVia: request.metVia,
                    sender: request.sender
                });
            }
        } catch (socketError) {
            console.error('Failed to emit friend request notification:', socketError);
            // Don't fail the request if socket emission fails
        }

        res.status(201).json({
            success: true,
            data: request
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to send friend request'
        });
    }
}

// Respond to a friend request (accept/decline)
export async function respondToFriendRequest(req: Request, res: Response) {
    try {
        const userId = (req as any).userId;
        const { id } = req.params;
        const { action } = req.body;

        if (!action || !['accept', 'decline'].includes(action)) {
            return res.status(400).json({
                success: false,
                error: 'Action must be "accept" or "decline"'
            });
        }

        let result;
        if (action === 'accept') {
            result = await friendService.acceptFriendRequest(id as string, userId);
        } else {
            result = await friendService.declineFriendRequest(id as string, userId);
        }

        res.json({
            success: true,
            data: result
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to respond to friend request'
        });
    }
}

// Get all friends
export async function getFriends(req: Request, res: Response) {
    try {
        const userId = (req as any).userId;
        const friends = await friendService.getFriends(userId);

        res.json({
            success: true,
            data: friends
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get friends'
        });
    }
}

// Get pending friend requests (received)
export async function getPendingRequests(req: Request, res: Response) {
    try {
        const userId = (req as any).userId;
        const requests = await friendService.getPendingRequests(userId);

        res.json({
            success: true,
            data: requests
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get pending requests'
        });
    }
}

// Get sent friend requests
export async function getSentRequests(req: Request, res: Response) {
    try {
        const userId = (req as any).userId;
        const requests = await friendService.getSentRequests(userId);

        res.json({
            success: true,
            data: requests
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get sent requests'
        });
    }
}

// Update friend alias
export async function updateAlias(req: Request, res: Response) {
    try {
        const userId = (req as any).userId;
        const { friendId } = req.params;
        const { alias } = req.body;

        if (alias !== null && typeof alias !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Alias must be a string or null'
            });
        }

        const result = await friendService.updateFriendAlias(userId, friendId as string, alias);

        res.json({
            success: true,
            data: result
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to update alias'
        });
    }
}

// Remove a friend
export async function removeFriend(req: Request, res: Response) {
    try {
        const userId = (req as any).userId;
        const { friendId } = req.params;

        await friendService.removeFriend(userId, friendId as string);

        res.json({
            success: true,
            message: 'Friend removed successfully'
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to remove friend'
        });
    }
}
