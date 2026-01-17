import { prisma } from '../config/database';

export async function sendFriendRequest(requesterId: string, usernameOrEmail: string) {
    // lowercase the input for case-insensitive search
    const query = usernameOrEmail.toLowerCase();

    const addressee = await prisma.user.findFirst({
        where: {
            OR: [
                { email: query },
                { username: query }
            ]
        }
    });

    if (!addressee) {
        throw new Error('User not found');
    }

    if (addressee.id === requesterId) {
        throw new Error('You cannot add yourself as a friend');
    }

    // Check if friendship already exists
    const existing = await prisma.friendship.findFirst({
        where: {
            OR: [
                { requesterId, addresseeId: addressee.id },
                { requesterId: addressee.id, addresseeId: requesterId }
            ]
        }
    });

    if (existing) {
        if (existing.status === 'ACCEPTED') {
            throw new Error('You are already friends');
        }
        if (existing.requesterId === requesterId) {
            throw new Error('Friend request already sent');
        }
        // If the other person sent a request, we can accept it implicitly or tell them to accept
        // For now, let's just say "Request pending from them"
        throw new Error('This user has already sent you a friend request');
    }

    return prisma.friendship.create({
        data: {
            requesterId,
            addresseeId: addressee.id,
            status: 'PENDING'
        },
        include: {
            addressee: {
                select: {
                    id: true,
                    username: true,
                    email: true
                }
            }
        }
    });
}

export async function respondToRequest(userId: string, requestId: string, accept: boolean) {
    const request = await prisma.friendship.findUnique({
        where: { id: requestId }
    });

    if (!request) {
        throw new Error('Friend request not found');
    }

    if (request.addresseeId !== userId) {
        throw new Error('Unauthorized');
    }

    if (accept) {
        return prisma.friendship.update({
            where: { id: requestId },
            data: { status: 'ACCEPTED' }
        });
    } else {
        return prisma.friendship.delete({
            where: { id: requestId }
        });
    }
}

export async function getFriends(userId: string) {
    const friendships = await prisma.friendship.findMany({
        where: {
            OR: [
                { requesterId: userId },
                { addresseeId: userId }
            ]
        },
        include: {
            requester: {
                select: { id: true, username: true, email: true, isAdult: true }
            },
            addressee: {
                select: { id: true, username: true, email: true, isAdult: true }
            }
        }
    });

    // Transform to a clean list of friends
    return friendships.map(f => {
        const isRequester = f.requesterId === userId;
        const otherUser = isRequester ? f.addressee : f.requester;
        const alias = isRequester ? f.aliasByRequester : f.aliasByAddressee;

        return {
            id: f.id, // Friendship ID
            friendId: otherUser.id,
            username: otherUser.username,
            email: otherUser.email,
            status: f.status,
            isIncoming: !isRequester && f.status === 'PENDING',
            isOutgoing: isRequester && f.status === 'PENDING',
            alias,
            isAdult: otherUser.isAdult
        };
    });
}

export async function setAlias(userId: string, friendId: string, alias: string) {
    // Find friendship where user is either requester or addressee AND the other party matches friendId
    const friendship = await prisma.friendship.findFirst({
        where: {
            OR: [
                { requesterId: userId, addresseeId: friendId },
                { requesterId: friendId, addresseeId: userId }
            ]
        }
    });

    if (!friendship) {
        throw new Error('Friendship not found');
    }

    const isRequester = friendship.requesterId === userId;

    return prisma.friendship.update({
        where: { id: friendship.id },
        data: isRequester
            ? { aliasByRequester: alias }
            : { aliasByAddressee: alias }
    });
}

export async function removeFriend(userId: string, friendId: string) {
    const friendship = await prisma.friendship.findFirst({
        where: {
            OR: [
                { requesterId: userId, addresseeId: friendId },
                { requesterId: friendId, addresseeId: userId }
            ]
        }
    });

    if (!friendship) {
        throw new Error('Friendship not found');
    }

    return prisma.friendship.delete({
        where: { id: friendship.id }
    });
}
