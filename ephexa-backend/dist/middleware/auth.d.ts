import { Request, Response, NextFunction } from 'express';
import type { JWTPayload } from '../types';
declare global {
    namespace Express {
        interface Request {
            userId?: string;
            email?: string;
        }
    }
}
export declare function authenticate(req: Request, res: Response, next: NextFunction): void;
export declare function generateToken(userId: string, email: string): string;
export declare function verifyToken(token: string): JWTPayload | null;
//# sourceMappingURL=auth.d.ts.map