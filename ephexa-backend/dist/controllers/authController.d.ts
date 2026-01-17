import { Request, Response, NextFunction } from 'express';
export declare function signup(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function login(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function googleAuth(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function logout(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function deleteAccount(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=authController.d.ts.map