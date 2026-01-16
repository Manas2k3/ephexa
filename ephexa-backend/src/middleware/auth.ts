import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import type { JWTPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Extend Express Request to include auth info
declare global {
    namespace Express {
        interface Request {
            userId?: string;
            email?: string;
        }
    }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }

    const token = authHeader.substring(7);

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
        req.userId = decoded.userId;
        req.email = decoded.email;
        next();
    } catch {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}

export function generateToken(userId: string, email: string): string {
    const payload: JWTPayload = { userId, email };
    const options: SignOptions = { expiresIn: '7d' };
    return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyToken(token: string): JWTPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch {
        return null;
    }
}
