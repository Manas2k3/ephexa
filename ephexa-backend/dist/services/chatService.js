"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserChats = getUserChats;
exports.createOrJoinChat = createOrJoinChat;
exports.leaveChat = leaveChat;
exports.getChatMessages = getChatMessages;
exports.createMessage = createMessage;
exports.updateUserOnlineStatus = updateUserOnlineStatus;
const database_1 = require("../config/database");
const helpers_1 = require("../utils/helpers");
const MESSAGE_TTL_HOURS = 24;
async function getUserChats(userId) {
    const chatRooms = await database_1.prisma.chatRoom.findMany({
        where: {
            users: {
                some: { userId },
            },
            isActive: true,
        },
        include: {
            users: {
                include: {
                    user: {
                        select: { id: true },
                    },
                },
            },
            messages: {
                take: 1,
                orderBy: { createdAt: 'desc' },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
    return chatRooms.map(room => ({
        id: room.id,
        name: room.name,
        interest: room.interest,
        createdAt: room.createdAt.toISOString(),
        participants: room.users.map(u => ({
            id: u.user.id,
            displayName: (0, helpers_1.generateDisplayName)(),
            isOnline: u.isOnline,
            joinedAt: u.joinedAt.toISOString(),
        })),
        lastMessage: room.messages[0] ? {
            id: room.messages[0].id,
            content: room.messages[0].content,
            senderId: room.messages[0].senderId,
            createdAt: room.messages[0].createdAt.toISOString(),
        } : undefined,
        unreadCount: 0, // TODO: Implement unread tracking
    }));
}
async function createOrJoinChat(userId, data) {
    const { interest } = data;
    // First, try to find an existing active room with the same interest that isn't full
    let room = await database_1.prisma.chatRoom.findFirst({
        where: {
            interest,
            isActive: true,
            expiresAt: { gt: new Date() },
            users: {
                none: { userId }, // User not already in room
            },
        },
        include: {
            users: true,
        },
    });
    if (!room || room.users.length >= 10) {
        // Create new room if no suitable room found or room is full
        const expiresAt = new Date(Date.now() + MESSAGE_TTL_HOURS * 60 * 60 * 1000);
        room = await database_1.prisma.chatRoom.create({
            data: {
                interest,
                expiresAt,
                users: {
                    create: {
                        userId,
                    },
                },
            },
            include: {
                users: true,
            },
        });
    }
    else {
        // Join existing room
        await database_1.prisma.chatRoomUser.create({
            data: {
                userId,
                chatRoomId: room.id,
            },
        });
        // Refresh room data
        room = await database_1.prisma.chatRoom.findUnique({
            where: { id: room.id },
            include: { users: true },
        });
    }
    return {
        id: room.id,
        name: room.name,
        interest: room.interest,
        createdAt: room.createdAt.toISOString(),
        participants: room.users.map(u => ({
            id: u.userId,
            displayName: (0, helpers_1.generateDisplayName)(),
            isOnline: u.isOnline,
            joinedAt: u.joinedAt.toISOString(),
        })),
        unreadCount: 0,
    };
}
async function leaveChat(userId, roomId) {
    await database_1.prisma.chatRoomUser.deleteMany({
        where: {
            userId,
            chatRoomId: roomId,
        },
    });
    // Check if room is now empty
    const remainingUsers = await database_1.prisma.chatRoomUser.count({
        where: { chatRoomId: roomId },
    });
    if (remainingUsers === 0) {
        // Mark room as inactive if empty
        await database_1.prisma.chatRoom.update({
            where: { id: roomId },
            data: { isActive: false },
        });
    }
}
async function getChatMessages(roomId, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [messages, total] = await Promise.all([
        database_1.prisma.message.findMany({
            where: { chatRoomId: roomId },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
            include: {
                sender: {
                    select: { id: true },
                },
            },
        }),
        database_1.prisma.message.count({
            where: { chatRoomId: roomId },
        }),
    ]);
    return {
        items: messages.reverse().map(m => ({
            id: m.id,
            content: m.content,
            senderId: m.senderId,
            senderName: (0, helpers_1.generateDisplayName)(),
            chatRoomId: m.chatRoomId,
            createdAt: m.createdAt.toISOString(),
            status: 'sent',
        })),
        total,
        page,
        limit,
        hasMore: skip + messages.length < total,
    };
}
async function createMessage(roomId, senderId, content) {
    const message = await database_1.prisma.message.create({
        data: {
            content,
            senderId,
            chatRoomId: roomId,
        },
    });
    return {
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        senderName: (0, helpers_1.generateDisplayName)(),
        chatRoomId: message.chatRoomId,
        createdAt: message.createdAt,
        status: 'sent',
    };
}
async function updateUserOnlineStatus(userId, roomId, isOnline) {
    await database_1.prisma.chatRoomUser.updateMany({
        where: {
            userId,
            chatRoomId: roomId,
        },
        data: {
            isOnline,
            lastSeenAt: new Date(),
        },
    });
}
//# sourceMappingURL=chatService.js.map