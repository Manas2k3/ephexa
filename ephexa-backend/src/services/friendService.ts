import { prisma } from '../config/database';
import type { MetVia, FriendRequestStatus } from '@prisma/client';

// Send a friend request
export async function sendFriendRequest(
    senderId: string,
    receiverId: string,
    metVia: MetVia,
    metRoomId?: string
) {
    // Check if they're not trying to friend themselves
    if (senderId === receiverId) {
        throw new Error('Cannot send friend request to yourself');
    }

    // Check if already friends
    const existingFriendship = await prisma.friendship.findUnique({
        where: {
            userId_friendId: { userId: senderId, friendId: receiverId }
        }
    });

    if (existingFriendship) {
        throw new Error('Already friends with this user');
    }

    // Check if request already exists
    const existingRequest = await prisma.friendRequest.findFirst({
        where: {
            OR: [
                { senderId, receiverId },
                { senderId: receiverId, receiverId: senderId }
            ],
            status: 'PENDING'
        }
    });

    if (existingRequest) {
        throw new Error('Friend request already pending');
    }

    // Check if user is blocked
    const blocked = await prisma.block.findFirst({
        where: {
            OR: [
                { blockerId: senderId, blockedId: receiverId },
                { blockerId: receiverId, blockedId: senderId }
            ]
        }
    });

    if (blocked) {
        throw new Error('Cannot send friend request to blocked user');
    }

    // Create the friend request
    const request = await prisma.friendRequest.create({
        data: {
            senderId,
            receiverId,
            metVia,
            metRoomId,
        },
        include: {
            sender: { select: { id: true, email: true } },
            receiver: { select: { id: true, email: true } }
        }
    });

    return request;
}

// Accept a friend request
export async function acceptFriendRequest(requestId: string, userId: string) {
    const request = await prisma.friendRequest.findUnique({
        where: { id: requestId }
    });

    if (!request) {
        throw new Error('Friend request not found');
    }

    if (request.receiverId !== userId) {
        throw new Error('Not authorized to accept this request');
    }

    if (request.status !== 'PENDING') {
        throw new Error('Request already processed');
    }

    // Use a transaction to update request and create mutual friendships
    const result = await prisma.$transaction(async (tx) => {
        // Update request status
        await tx.friendRequest.update({
            where: { id: requestId },
            data: { status: 'ACCEPTED' }
        });

        // Create mutual friendship (both directions)
        const friendship1 = await tx.friendship.create({
            data: {
                userId: request.senderId,
                friendId: request.receiverId,
                metVia: request.metVia,
                metRoomId: request.metRoomId,
            }
        });

        const friendship2 = await tx.friendship.create({
            data: {
                userId: request.receiverId,
                friendId: request.senderId,
                metVia: request.metVia,
                metRoomId: request.metRoomId,
            }
        });

        return { friendship1, friendship2 };
    });

    return result;
}

// Decline a friend request
export async function declineFriendRequest(requestId: string, userId: string) {
    const request = await prisma.friendRequest.findUnique({
        where: { id: requestId }
    });

    if (!request) {
        throw new Error('Friend request not found');
    }

    if (request.receiverId !== userId) {
        throw new Error('Not authorized to decline this request');
    }

    if (request.status !== 'PENDING') {
        throw new Error('Request already processed');
    }

    await prisma.friendRequest.update({
        where: { id: requestId },
        data: { status: 'DECLINED' }
    });

    return { success: true };
}

// Get all friends for a user
export async function getFriends(userId: string) {
    const friendships = await prisma.friendship.findMany({
        where: { userId },
        include: {
            friend: {
                select: {
                    id: true,
                    email: true,
                    createdAt: true,
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return friendships.map(f => ({
        id: f.id,
        friendId: f.friendId,
        alias: f.alias,
        metVia: f.metVia,
        createdAt: f.createdAt.toISOString(),
        updatedAt: f.updatedAt.toISOString(),
        friend: {
            id: f.friend.id,
            email: f.friend.email,
        }
    }));
}

// Get pending friend requests for a user (received)
export async function getPendingRequests(userId: string) {
    const requests = await prisma.friendRequest.findMany({
        where: {
            receiverId: userId,
            status: 'PENDING'
        },
        include: {
            sender: {
                select: { id: true, email: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return requests.map(r => ({
        id: r.id,
        senderId: r.senderId,
        status: r.status,
        metVia: r.metVia,
        createdAt: r.createdAt.toISOString(),
        sender: {
            id: r.sender.id,
            email: r.sender.email,
        }
    }));
}

// Get sent friend requests (for showing pending outgoing requests)
export async function getSentRequests(userId: string) {
    const requests = await prisma.friendRequest.findMany({
        where: {
            senderId: userId,
            status: 'PENDING'
        },
        include: {
            receiver: {
                select: { id: true, email: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return requests.map(r => ({
        id: r.id,
        receiverId: r.receiverId,
        status: r.status,
        metVia: r.metVia,
        createdAt: r.createdAt.toISOString(),
        receiver: {
            id: r.receiver.id,
            email: r.receiver.email,
        }
    }));
}

// Update friend alias
export async function updateFriendAlias(userId: string, friendId: string, alias: string | null) {
    const friendship = await prisma.friendship.findUnique({
        where: {
            userId_friendId: { userId, friendId }
        }
    });

    if (!friendship) {
        throw new Error('Friendship not found');
    }

    const updated = await prisma.friendship.update({
        where: { id: friendship.id },
        data: { alias }
    });

    return {
        id: updated.id,
        friendId: updated.friendId,
        alias: updated.alias,
        updatedAt: updated.updatedAt.toISOString()
    };
}

// Remove a friend (both directions)
export async function removeFriend(userId: string, friendId: string) {
    // Delete both directions of friendship
    await prisma.$transaction([
        prisma.friendship.deleteMany({
            where: { userId, friendId }
        }),
        prisma.friendship.deleteMany({
            where: { userId: friendId, friendId: userId }
        })
    ]);

    return { success: true };
}

// Check if two users are friends
export async function areFriends(userId1: string, userId2: string): Promise<boolean> {
    const friendship = await prisma.friendship.findUnique({
        where: {
            userId_friendId: { userId: userId1, friendId: userId2 }
        }
    });

    return !!friendship;
}
