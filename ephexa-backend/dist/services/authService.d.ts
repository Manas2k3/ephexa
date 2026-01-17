import type { SignupBody, LoginBody } from '../types';
export declare function signup(data: SignupBody, ipAddress: string): Promise<{
    user: {
        id: string;
        email: string;
        isAdult: boolean;
        createdAt: string;
    };
    token: string;
}>;
export declare function login(data: LoginBody, ipAddress: string): Promise<{
    user: {
        id: string;
        email: string;
        isAdult: boolean;
        createdAt: string;
    };
    token: string;
}>;
export declare function googleAuth(credential: string, ipAddress: string): Promise<{
    user: {
        id: string;
        email: string;
        isAdult: boolean;
        createdAt: string;
    };
    token: string;
}>;
export declare function getCurrentUser(userId: string): Promise<{
    id: string;
    email: string;
    username: string | null;
    isAdult: boolean;
    createdAt: string;
}>;
export declare function deleteAccount(userId: string): Promise<void>;
export declare function invalidateSessions(userId: string): Promise<void>;
//# sourceMappingURL=authService.d.ts.map