import { Request, Response, NextFunction } from 'express';
interface AppError extends Error {
    statusCode?: number;
    isOperational?: boolean;
}
export declare function errorHandler(err: AppError, req: Request, res: Response, next: NextFunction): void;
export declare class ApiError extends Error {
    statusCode: number;
    isOperational: boolean;
    constructor(message: string, statusCode?: number);
}
export declare function notFound(req: Request, res: Response): void;
export {};
//# sourceMappingURL=errorHandler.d.ts.map