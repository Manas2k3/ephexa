import { Request, Response, NextFunction } from 'express';
export declare function getMe(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updateMe(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function blockUser(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function unblockUser(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function reportUser(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getBlockedUsers(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=userController.d.ts.map