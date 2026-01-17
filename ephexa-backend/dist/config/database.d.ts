import { PrismaClient } from '@prisma/client';
import pg from 'pg';
declare global {
    var prisma: PrismaClient | undefined;
    var pgPool: pg.Pool | undefined;
}
export declare const prisma: PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/client").DefaultArgs>;
export declare function connectDatabase(): Promise<void>;
export declare function disconnectDatabase(): Promise<void>;
//# sourceMappingURL=database.d.ts.map