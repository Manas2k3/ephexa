import { prisma } from '../config/database';
import { generateDisplayName } from '../utils/helpers';
import type { CreateChatBody } from '../types';

const MESSAGE_TTL_HOURS = 24;

export async function getUserChats(userId: string) {
    const chatRooms = await prisma.chatRoom.findMany({
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
            displayName: generateDisplayName(),
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

export async function createOrJoinChat(userId: string, data: CreateChatBody) {
    const { interest } = data;

    // First, try to find an existing active room with the same interest that isn't full
    let room = await prisma.chatRoom.findFirst({
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

        room = await prisma.chatRoom.create({
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
    } else {
        // Join existing room
        await prisma.chatRoomUser.create({
            data: {
                userId,
                chatRoomId: room.id,
            },
        });

        // Refresh room data
        room = await prisma.chatRoom.findUnique({
            where: { id: room.id },
            include: { users: true },
        }) as typeof room;
    }

    return {
        id: room.id,
        name: room.name,
        interest: room.interest,
        createdAt: room.createdAt.toISOString(),
        participants: room.users.map(u => ({
            id: u.userId,
            displayName: generateDisplayName(),
            isOnline: u.isOnline,
            joinedAt: u.joinedAt.toISOString(),
        })),
        unreadCount: 0,
    };
}

export async function leaveChat(userId: string, roomId: string) {
    await prisma.chatRoomUser.deleteMany({
        where: {
            userId,
            chatRoomId: roomId,
        },
    });

    // Check if room is now empty
    const remainingUsers = await prisma.chatRoomUser.count({
        where: { chatRoomId: roomId },
    });

    if (remainingUsers === 0) {
        // Mark room as inactive if empty
        await prisma.chatRoom.update({
            where: { id: roomId },
            data: { isActive: false },
        });
    }
}

export async function getChatMessages(roomId: string, page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
        prisma.message.findMany({
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
        prisma.message.count({
            where: { chatRoomId: roomId },
        }),
    ]);

    return {
        items: messages.reverse().map(m => ({
            id: m.id,
            content: m.content,
            senderId: m.senderId,
            senderName: generateDisplayName(),
            chatRoomId: m.chatRoomId,
            createdAt: m.createdAt.toISOString(),
            status: 'sent' as const,
        })),
        total,
        page,
        limit,
        hasMore: skip + messages.length < total,
    };
}

export async function createMessage(roomId: string, senderId: string, content: string) {
    const message = await prisma.message.create({
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
        senderName: generateDisplayName(),
        chatRoomId: message.chatRoomId,
        createdAt: message.createdAt,
        status: 'sent' as const,
    };
}

export async function updateUserOnlineStatus(userId: string, roomId: string, isOnline: boolean) {
    await prisma.chatRoomUser.updateMany({
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
