import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

declare global {
    var prisma: PrismaClient | undefined;
    var pgPool: pg.Pool | undefined;
}

const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/ephexa';

console.log('📂 Database URL:', connectionString.replace(/\/\/[^:]+:[^@]+@/, '//<hidden>@'));

// Create PostgreSQL connection pool  
const isProduction = process.env.NODE_ENV === 'production';
const pool = globalThis.pgPool || new pg.Pool({
    connectionString,
    ...(isProduction && {
        ssl: {
            rejectUnauthorized: false
        }
    })
});
globalThis.pgPool = pool;

const adapter = new PrismaPg(pool);

export const prisma = globalThis.prisma || new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
    globalThis.prisma = prisma;
}

export async function connectDatabase(): Promise<void> {
    try {
        // Test the pool connection directly with timeout
        const client = await Promise.race([
            pool.connect(),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Connection timeout')), 10000)
            )
        ]) as pg.PoolClient;
        client.release();
        console.log('✅ Database connected successfully');
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        console.log('💡 Server will continue - database will reconnect on first query');
        // Don't throw - let server start and handle DB errors gracefully
    }
}

export async function disconnectDatabase(): Promise<void> {
    await prisma.$disconnect();
    await pool.end();
    console.log('Database disconnected');
}
