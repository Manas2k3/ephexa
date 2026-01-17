"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.connectDatabase = connectDatabase;
exports.disconnectDatabase = disconnectDatabase;
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = __importDefault(require("pg"));
const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/ephexa';
console.log('📂 Database URL:', connectionString.replace(/\/\/[^:]+:[^@]+@/, '//<hidden>@'));
// Create PostgreSQL connection pool  
const isProduction = process.env.NODE_ENV === 'production';
const pool = globalThis.pgPool || new pg_1.default.Pool({
    connectionString,
    ...(isProduction && {
        ssl: {
            rejectUnauthorized: false
        }
    })
});
globalThis.pgPool = pool;
const adapter = new adapter_pg_1.PrismaPg(pool);
exports.prisma = globalThis.prisma || new client_1.PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});
if (process.env.NODE_ENV !== 'production') {
    globalThis.prisma = exports.prisma;
}
async function connectDatabase() {
    try {
        // Test the pool connection directly with timeout
        const client = await Promise.race([
            pool.connect(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 10000))
        ]);
        client.release();
        console.log('✅ Database connected successfully');
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        console.log('💡 Server will continue - database will reconnect on first query');
        // Don't throw - let server start and handle DB errors gracefully
    }
}
async function disconnectDatabase() {
    await exports.prisma.$disconnect();
    await pool.end();
    console.log('Database disconnected');
}
//# sourceMappingURL=database.js.map