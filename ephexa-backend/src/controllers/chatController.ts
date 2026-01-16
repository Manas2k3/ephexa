import { Request, Response, NextFunction } from 'express';
import * as chatService from '../services/chatService';
import type { CreateChatBody } from '../types';

export async function getChats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const chats = await chatService.getUserChats(req.userId);
        res.json(chats);
    } catch (error) {
        next(error);
    }
}

export async function createChat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const body: CreateChatBody = req.body;

        if (!body.interest) {
            res.status(400).json({ error: 'Interest is required' });
            return;
        }

        const chat = await chatService.createOrJoinChat(req.userId, body);
        res.status(201).json(chat);
    } catch (error) {
        next(error);
    }
}

export async function leaveChat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const id = req.params.id as string;

        if (!id) {
            res.status(400).json({ error: 'Chat room ID is required' });
            return;
        }

        await chatService.leaveChat(req.userId, id);
        res.json({ message: 'Left chat successfully' });
    } catch (error) {
        next(error);
    }
}

export async function getMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const id = req.params.id as string;
        const page = parseInt(req.query.page as string) || 1;
        const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

        const messages = await chatService.getChatMessages(id, page, limit);
        res.json(messages);
    } catch (error) {
        next(error);
    }
}
