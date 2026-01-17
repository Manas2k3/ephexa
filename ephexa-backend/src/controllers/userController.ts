import { Request, Response, NextFunction } from 'express';
import * as moderationService from '../services/moderationService';
import * as authService from '../services/authService';
import * as userService from '../services/userService';
import type { ReportBody } from '../types';

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const user = await authService.getCurrentUser(req.userId);
        res.json(user);
    } catch (error) {
        next(error);
    }
}

export async function updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const { username } = req.body;

        if (username) {
            const updatedUser = await userService.updateUsername(req.userId, username);
            res.json(updatedUser);
            return;
        }

        res.json({ message: 'No changes made' });
    } catch (error) {
        if (error instanceof Error && error.message.includes('taken')) {
            res.status(409).json({ error: error.message });
        } else if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        } else {
            next(error);
        }
    }
}

export async function blockUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const id = req.params.id as string;

        if (!id) {
            res.status(400).json({ error: 'User ID is required' });
            return;
        }

        await moderationService.blockUser(req.userId, id);
        res.json({ message: 'User blocked successfully' });
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        } else {
            next(error);
        }
    }
}

export async function unblockUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const id = req.params.id as string;
        await moderationService.unblockUser(req.userId, id);
        res.json({ message: 'User unblocked successfully' });
    } catch (error) {
        next(error);
    }
}

export async function reportUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const id = req.params.id as string;
        const body: ReportBody = req.body;

        if (!id) {
            res.status(400).json({ error: 'User ID is required' });
            return;
        }

        if (!body.reason) {
            res.status(400).json({ error: 'Report reason is required' });
            return;
        }

        await moderationService.reportUser(req.userId, id, body);
        res.json({ message: 'Report submitted successfully' });
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        } else {
            next(error);
        }
    }
}

export async function getBlockedUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const blocked = await moderationService.getBlockedUsers(req.userId);
        res.json(blocked);
    } catch (error) {
        next(error);
    }
}
