import { prisma } from '../config/database';
import type { ReportBody } from '../types';

const REPORT_THRESHOLD_FOR_BAN = 5;
const BAN_DURATION_HOURS = 24;

export async function reportUser(reporterId: string, reportedId: string, data: ReportBody) {
    // Cannot report yourself
    if (reporterId === reportedId) {
        throw new Error('You cannot report yourself');
    }

    // Check if reporter has already reported this user recently
    const existingReport = await prisma.report.findFirst({
        where: {
            reporterId,
            reportedId,
            createdAt: {
                gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
            },
        },
    });

    if (existingReport) {
        throw new Error('You have already reported this user recently');
    }

    // Create report
    await prisma.report.create({
        data: {
            reporterId,
            reportedId,
            reason: data.reason,
            messageId: data.messageId,
            description: data.description,
        },
    });

    // Increment reported user's report count
    const reportedUser = await prisma.user.update({
        where: { id: reportedId },
        data: {
            reportCount: { increment: 1 },
        },
    });

    // Auto-ban if threshold reached
    if (reportedUser.reportCount >= REPORT_THRESHOLD_FOR_BAN && !reportedUser.isBanned) {
        await prisma.user.update({
            where: { id: reportedId },
            data: {
                isBanned: true,
                banExpiresAt: new Date(Date.now() + BAN_DURATION_HOURS * 60 * 60 * 1000),
            },
        });
    }
}

export async function blockUser(blockerId: string, blockedId: string) {
    if (blockerId === blockedId) {
        throw new Error('You cannot block yourself');
    }

    // Check if already blocked
    const existingBlock = await prisma.block.findUnique({
        where: {
            blockerId_blockedId: {
                blockerId,
                blockedId,
            },
        },
    });

    if (existingBlock) {
        throw new Error('User is already blocked');
    }

    await prisma.block.create({
        data: {
            blockerId,
            blockedId,
        },
    });
}

export async function unblockUser(blockerId: string, blockedId: string) {
    await prisma.block.deleteMany({
        where: {
            blockerId,
            blockedId,
        },
    });
}

export async function getBlockedUsers(userId: string) {
    const blocks = await prisma.block.findMany({
        where: { blockerId: userId },
        select: {
            blockedId: true,
            createdAt: true,
        },
    });

    return blocks.map(b => ({
        id: b.blockedId,
        blockedAt: b.createdAt.toISOString(),
    }));
}

export async function isBlocked(blockerId: string, blockedId: string): Promise<boolean> {
    const block = await prisma.block.findUnique({
        where: {
            blockerId_blockedId: {
                blockerId,
                blockedId,
            },
        },
    });

    return !!block;
}
