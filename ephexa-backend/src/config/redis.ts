import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let redisConnected = false;

// In-memory fallback for when Redis is not available
const memoryStore: Map<string, { value: string; expireAt?: number }> = new Map();

export const redis = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
        if (times > 3) {
            console.log('⚠️  Redis unavailable - using in-memory fallback (not for production!)');
            return null;
        }
        return Math.min(times * 200, 2000);
    },
    lazyConnect: true,
});

redis.on('connect', () => {
    redisConnected = true;
    console.log('✅ Redis connected successfully');
});

redis.on('error', () => {
    // Silently handle - we'll use in-memory fallback
});

// Try to connect
redis.connect().catch(() => {
    console.log('⚠️  Redis not available - using in-memory store for development');
});

// Helper to check if key expired
function isExpired(key: string): boolean {
    const item = memoryStore.get(key);
    if (!item) return true;
    if (item.expireAt && Date.now() > item.expireAt) {
        memoryStore.delete(key);
        return true;
    }
    return false;
}

// Session management
const SESSION_PREFIX = 'session:';
const SESSION_TTL = parseInt(process.env.SESSION_TTL || '86400', 10);

export async function setSession(sessionId: string, userId: string): Promise<void> {
    const key = `${SESSION_PREFIX}${sessionId}`;
    if (redisConnected) {
        await redis.setex(key, SESSION_TTL, userId);
    } else {
        memoryStore.set(key, { value: userId, expireAt: Date.now() + SESSION_TTL * 1000 });
    }
}

export async function getSession(sessionId: string): Promise<string | null> {
    const key = `${SESSION_PREFIX}${sessionId}`;
    if (redisConnected) {
        return redis.get(key);
    }
    if (isExpired(key)) return null;
    return memoryStore.get(key)?.value || null;
}

export async function deleteSession(sessionId: string): Promise<void> {
    const key = `${SESSION_PREFIX}${sessionId}`;
    if (redisConnected) {
        await redis.del(key);
    } else {
        memoryStore.delete(key);
    }
}

// Rate limiting
const RATE_LIMIT_PREFIX = 'ratelimit:';
const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '10000', 10) / 1000;
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX_MESSAGES || '10', 10);

const rateLimitCounts: Map<string, { count: number; resetAt: number }> = new Map();

export async function checkRateLimit(userId: string): Promise<{ allowed: boolean; retryAfter?: number }> {
    const key = `${RATE_LIMIT_PREFIX}${userId}`;

    if (redisConnected) {
        const current = await redis.incr(key);
        if (current === 1) {
            await redis.expire(key, RATE_LIMIT_WINDOW);
        }
        if (current > RATE_LIMIT_MAX) {
            const ttl = await redis.ttl(key);
            return { allowed: false, retryAfter: ttl > 0 ? ttl : RATE_LIMIT_WINDOW };
        }
        return { allowed: true };
    }

    // In-memory rate limiting
    const now = Date.now();
    let entry = rateLimitCounts.get(key);

    if (!entry || now > entry.resetAt) {
        entry = { count: 1, resetAt: now + RATE_LIMIT_WINDOW * 1000 };
        rateLimitCounts.set(key, entry);
        return { allowed: true };
    }

    entry.count++;
    if (entry.count > RATE_LIMIT_MAX) {
        const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
        return { allowed: false, retryAfter };
    }

    return { allowed: true };
}

// Online status tracking
const ONLINE_PREFIX = 'online:';
const ONLINE_TTL = 60;

export async function setUserOnline(userId: string): Promise<void> {
    const key = `${ONLINE_PREFIX}${userId}`;
    if (redisConnected) {
        await redis.setex(key, ONLINE_TTL, '1');
    } else {
        memoryStore.set(key, { value: '1', expireAt: Date.now() + ONLINE_TTL * 1000 });
    }
}

export async function setUserOffline(userId: string): Promise<void> {
    const key = `${ONLINE_PREFIX}${userId}`;
    if (redisConnected) {
        await redis.del(key);
    } else {
        memoryStore.delete(key);
    }
}

export async function isUserOnline(userId: string): Promise<boolean> {
    const key = `${ONLINE_PREFIX}${userId}`;
    if (redisConnected) {
        const result = await redis.get(key);
        return result === '1';
    }
    if (isExpired(key)) return false;
    return memoryStore.get(key)?.value === '1';
}

// User socket mapping
const SOCKET_PREFIX = 'socket:';

export async function setUserSocket(userId: string, socketId: string): Promise<void> {
    const key = `${SOCKET_PREFIX}${userId}`;
    if (redisConnected) {
        await redis.set(key, socketId);
    } else {
        memoryStore.set(key, { value: socketId });
    }
}

export async function getUserSocket(userId: string): Promise<string | null> {
    const key = `${SOCKET_PREFIX}${userId}`;
    if (redisConnected) {
        return redis.get(key);
    }
    return memoryStore.get(key)?.value || null;
}

export async function deleteUserSocket(userId: string): Promise<void> {
    const key = `${SOCKET_PREFIX}${userId}`;
    if (redisConnected) {
        await redis.del(key);
    } else {
        memoryStore.delete(key);
    }
}
