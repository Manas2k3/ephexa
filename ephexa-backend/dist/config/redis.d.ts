import Redis from 'ioredis';
export declare const redis: Redis;
export declare function setSession(sessionId: string, userId: string): Promise<void>;
export declare function getSession(sessionId: string): Promise<string | null>;
export declare function deleteSession(sessionId: string): Promise<void>;
export declare function checkRateLimit(userId: string): Promise<{
    allowed: boolean;
    retryAfter?: number;
}>;
export declare function setUserOnline(userId: string): Promise<void>;
export declare function setUserOffline(userId: string): Promise<void>;
export declare function isUserOnline(userId: string): Promise<boolean>;
export declare function setUserSocket(userId: string, socketId: string): Promise<void>;
export declare function getUserSocket(userId: string): Promise<string | null>;
export declare function deleteUserSocket(userId: string): Promise<void>;
//# sourceMappingURL=redis.d.ts.map