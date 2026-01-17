"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportUser = reportUser;
exports.blockUser = blockUser;
exports.unblockUser = unblockUser;
exports.getBlockedUsers = getBlockedUsers;
exports.isBlocked = isBlocked;
const database_1 = require("../config/database");
const REPORT_THRESHOLD_FOR_BAN = 5;
const BAN_DURATION_HOURS = 24;
async function reportUser(reporterId, reportedId, data) {
    // Cannot report yourself
    if (reporterId === reportedId) {
        throw new Error('You cannot report yourself');
    }
    // Check if reporter has already reported this user recently
    const existingReport = await database_1.prisma.report.findFirst({
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
    await database_1.prisma.report.create({
        data: {
            reporterId,
            reportedId,
            reason: data.reason,
            messageId: data.messageId,
            description: data.description,
        },
    });
    // Increment reported user's report count
    const reportedUser = await database_1.prisma.user.update({
        where: { id: reportedId },
        data: {
            reportCount: { increment: 1 },
        },
    });
    // Auto-ban if threshold reached
    if (reportedUser.reportCount >= REPORT_THRESHOLD_FOR_BAN && !reportedUser.isBanned) {
        await database_1.prisma.user.update({
            where: { id: reportedId },
            data: {
                isBanned: true,
                banExpiresAt: new Date(Date.now() + BAN_DURATION_HOURS * 60 * 60 * 1000),
            },
        });
    }
}
async function blockUser(blockerId, blockedId) {
    if (blockerId === blockedId) {
        throw new Error('You cannot block yourself');
    }
    // Check if already blocked
    const existingBlock = await database_1.prisma.block.findUnique({
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
    await database_1.prisma.block.create({
        data: {
            blockerId,
            blockedId,
        },
    });
}
async function unblockUser(blockerId, blockedId) {
    await database_1.prisma.block.deleteMany({
        where: {
            blockerId,
            blockedId,
        },
    });
}
async function getBlockedUsers(userId) {
    const blocks = await database_1.prisma.block.findMany({
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
async function isBlocked(blockerId, blockedId) {
    const block = await database_1.prisma.block.findUnique({
        where: {
            blockerId_blockedId: {
                blockerId,
                blockedId,
            },
        },
    });
    return !!block;
}
//# sourceMappingURL=moderationService.js.map