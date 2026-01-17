import { prisma } from '../config/database';

export async function updateUsername(userId: string, username: string) {
    // Validate format
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
        throw new Error('Username must be 3-20 characters long and contain only letters, numbers, and underscores');
    }

    // Check availability
    const existing = await prisma.user.findFirst({
        where: {
            username: {
                equals: username,
                mode: 'insensitive' // Optional: if you want case-insensitive uniqueness
            },
            NOT: {
                id: userId
            }
        }
    });

    if (existing) {
        throw new Error('Username is already taken');
    }

    return prisma.user.update({
        where: { id: userId },
        data: { username },
        select: {
            id: true,
            username: true,
            email: true,
            isAdult: true
        }
    });
}
