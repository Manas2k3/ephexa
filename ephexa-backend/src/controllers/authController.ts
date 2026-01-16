import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';
import type { SignupBody, LoginBody } from '../types';

export async function signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const body: SignupBody = req.body;

        // Validate required fields
        if (!body.email || !body.password || !body.dateOfBirth) {
            res.status(400).json({ error: 'Email, password, and date of birth are required' });
            return;
        }

        if (body.password.length < 8) {
            res.status(400).json({ error: 'Password must be at least 8 characters' });
            return;
        }

        const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
        const result = await authService.signup(body, ipAddress);

        res.status(201).json(result);
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        } else {
            next(error);
        }
    }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const body: LoginBody = req.body;

        if (!body.email || !body.password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }

        const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
        const result = await authService.login(body, ipAddress);

        res.json(result);
    } catch (error) {
        if (error instanceof Error) {
            res.status(401).json({ error: error.message });
        } else {
            next(error);
        }
    }
}

export async function googleAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { credential } = req.body;

        console.log('Google OAuth request received, credential length:', credential?.length);

        if (!credential) {
            res.status(400).json({ error: 'Google credential is required' });
            return;
        }

        const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
        const result = await authService.googleAuth(credential, ipAddress);

        console.log('Google OAuth success for user:', result.user.email);
        res.json(result);
    } catch (error) {
        console.error('Google OAuth error:', error);
        if (error instanceof Error) {
            res.status(401).json({ error: error.message });
        } else {
            next(error);
        }
    }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        if (req.userId) {
            await authService.invalidateSessions(req.userId);
        }
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
}

export async function deleteAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        await authService.deleteAccount(req.userId);
        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        next(error);
    }
}

export async function getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
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
