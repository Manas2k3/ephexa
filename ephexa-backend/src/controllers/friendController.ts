import { Request, Response, NextFunction } from 'express';
import * as friendService from '../services/friendService';

export async function sendRequest(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.userId!;
        const { usernameOrEmail } = req.body;

        if (!usernameOrEmail) {
            res.status(400).json({ error: 'Username or Email is required' });
            return;
        }

        const result = await friendService.sendFriendRequest(userId, usernameOrEmail);
        res.status(201).json(result);
    } catch (error) {
        if (error instanceof Error && error.message === 'User not found') {
            res.status(404).json({ error: error.message });
        } else {
            res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to send request' });
        }
    }
}

export async function respondRequest(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.userId!;
        const { requestId, accept } = req.body;

        if (!requestId || typeof accept !== 'boolean') {
            res.status(400).json({ error: 'Request ID and accept status are required' });
            return;
        }

        const result = await friendService.respondToRequest(userId, requestId, accept);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to respond' });
    }
}

export async function listFriends(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.userId!;
        const friends = await friendService.getFriends(userId);
        res.json(friends);
    } catch (error) {
        next(error);
    }
}

export async function updateAlias(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.userId!;
        const { friendId } = req.params;
        const { alias } = req.body;

        if (!friendId || typeof alias !== 'string') {
            res.status(400).json({ error: 'Friend ID and alias are required' });
            return;
        }

        await friendService.setAlias(userId, friendId as string, alias);
        res.json({ success: true, message: 'Alias updated' });
    } catch (error) {
        res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to update alias' });
    }
}

export async function removeFriend(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.userId!;
        const { friendId } = req.params;

        await friendService.removeFriend(userId, friendId as string);
        res.json({ success: true, message: 'Friend removed' });
    } catch (error) {
        res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to remove friend' });
    }
}
