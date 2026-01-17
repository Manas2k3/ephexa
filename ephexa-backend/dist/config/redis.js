"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
exports.setSession = setSession;
exports.getSession = getSession;
exports.deleteSession = deleteSession;
exports.checkRateLimit = checkRateLimit;
exports.setUserOnline = setUserOnline;
exports.setUserOffline = setUserOffline;
exports.isUserOnline = isUserOnline;
exports.setUserSocket = setUserSocket;
exports.getUserSocket = getUserSocket;
exports.deleteUserSocket = deleteUserSocket;
const ioredis_1 = __importDefault(require("ioredis"));
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
let redisConnected = false;
// In-memory fallback for when Redis is not available
const memoryStore = new Map();
exports.redis = new ioredis_1.default(REDIS_URL, {
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
exports.redis.on('connect', () => {
    redisConnected = true;
    console.log('✅ Redis connected successfully');
});
exports.redis.on('error', () => {
    // Silently handle - we'll use in-memory fallback
});
// Try to connect
exports.redis.connect().catch(() => {
    console.log('⚠️  Redis not available - using in-memory store for development');
});
// Helper to check if key expired
function isExpired(key) {
    const item = memoryStore.get(key);
    if (!item)
        return true;
    if (item.expireAt && Date.now() > item.expireAt) {
        memoryStore.delete(key);
        return true;
    }
    return false;
}
// Session management
const SESSION_PREFIX = 'session:';
const SESSION_TTL = parseInt(process.env.SESSION_TTL || '86400', 10);
async function setSession(sessionId, userId) {
    const key = `${SESSION_PREFIX}${sessionId}`;
    if (redisConnected) {
        await exports.redis.setex(key, SESSION_TTL, userId);
    }
    else {
        memoryStore.set(key, { value: userId, expireAt: Date.now() + SESSION_TTL * 1000 });
    }
}
async function getSession(sessionId) {
    const key = `${SESSION_PREFIX}${sessionId}`;
    if (redisConnected) {
        return exports.redis.get(key);
    }
    if (isExpired(key))
        return null;
    return memoryStore.get(key)?.value || null;
}
async function deleteSession(sessionId) {
    const key = `${SESSION_PREFIX}${sessionId}`;
    if (redisConnected) {
        await exports.redis.del(key);
    }
    else {
        memoryStore.delete(key);
    }
}
// Rate limiting
const RATE_LIMIT_PREFIX = 'ratelimit:';
const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '10000', 10) / 1000;
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX_MESSAGES || '10', 10);
const rateLimitCounts = new Map();
async function checkRateLimit(userId) {
    const key = `${RATE_LIMIT_PREFIX}${userId}`;
    if (redisConnected) {
        const current = await exports.redis.incr(key);
        if (current === 1) {
            await exports.redis.expire(key, RATE_LIMIT_WINDOW);
        }
        if (current > RATE_LIMIT_MAX) {
            const ttl = await exports.redis.ttl(key);
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
async function setUserOnline(userId) {
    const key = `${ONLINE_PREFIX}${userId}`;
    if (redisConnected) {
        await exports.redis.setex(key, ONLINE_TTL, '1');
    }
    else {
        memoryStore.set(key, { value: '1', expireAt: Date.now() + ONLINE_TTL * 1000 });
    }
}
async function setUserOffline(userId) {
    const key = `${ONLINE_PREFIX}${userId}`;
    if (redisConnected) {
        await exports.redis.del(key);
    }
    else {
        memoryStore.delete(key);
    }
}
async function isUserOnline(userId) {
    const key = `${ONLINE_PREFIX}${userId}`;
    if (redisConnected) {
        const result = await exports.redis.get(key);
        return result === '1';
    }
    if (isExpired(key))
        return false;
    return memoryStore.get(key)?.value === '1';
}
// User socket mapping
const SOCKET_PREFIX = 'socket:';
async function setUserSocket(userId, socketId) {
    const key = `${SOCKET_PREFIX}${userId}`;
    if (redisConnected) {
        await exports.redis.set(key, socketId);
    }
    else {
        memoryStore.set(key, { value: socketId });
    }
}
async function getUserSocket(userId) {
    const key = `${SOCKET_PREFIX}${userId}`;
    if (redisConnected) {
        return exports.redis.get(key);
    }
    return memoryStore.get(key)?.value || null;
}
async function deleteUserSocket(userId) {
    const key = `${SOCKET_PREFIX}${userId}`;
    if (redisConnected) {
        await exports.redis.del(key);
    }
    else {
        memoryStore.delete(key);
    }
}
//# sourceMappingURL=redis.js.map