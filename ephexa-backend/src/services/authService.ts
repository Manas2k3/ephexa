import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../config/database';
import { generateToken } from '../middleware/auth';
import { calculateAge, hashIp } from '../utils/helpers';
import type { SignupBody, LoginBody } from '../types';

const SALT_ROUNDS = 10;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

export async function signup(data: SignupBody, ipAddress: string) {
    const { email, password, dateOfBirth, isAdultConfirmed, agreedToTerms } = data;

    // Validate age (must be 18+)
    const dob = new Date(dateOfBirth);
    const age = calculateAge(dob);

    if (age < 18 || !isAdultConfirmed) {
        throw new Error('You must be 18 or older to use this service');
    }

    if (!agreedToTerms) {
        throw new Error('You must agree to the Terms of Service');
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
    });

    if (existingUser) {
        throw new Error('An account with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
        data: {
            email: email.toLowerCase(),
            passwordHash,
            dateOfBirth: dob,
            isAdult: true,
        },
    });

    // Create session
    const sessionExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await prisma.session.create({
        data: {
            userId: user.id,
            ipHash: hashIp(ipAddress),
            expiresAt: sessionExpiry,
        },
    });

    // Generate token
    const token = generateToken(user.id, user.email);

    return {
        user: {
            id: user.id,
            email: user.email,
            isAdult: user.isAdult,
            createdAt: user.createdAt.toISOString(),
        },
        token,
    };
}

export async function login(data: LoginBody, ipAddress: string) {
    const { email, password } = data;

    // Find user
    const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
    });

    if (!user || !user.passwordHash) {
        throw new Error('Invalid email or password');
    }

    // Check if banned
    if (user.isBanned) {
        if (user.banExpiresAt && user.banExpiresAt > new Date()) {
            throw new Error(`Your account is temporarily suspended until ${user.banExpiresAt.toISOString()}`);
        }
        // Ban expired, unban user
        await prisma.user.update({
            where: { id: user.id },
            data: { isBanned: false, banExpiresAt: null },
        });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
        throw new Error('Invalid email or password');
    }

    // Create or update session
    const sessionExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.session.create({
        data: {
            userId: user.id,
            ipHash: hashIp(ipAddress),
            expiresAt: sessionExpiry,
        },
    });

    // Generate token
    const token = generateToken(user.id, user.email);

    return {
        user: {
            id: user.id,
            email: user.email,
            isAdult: user.isAdult,
            createdAt: user.createdAt.toISOString(),
        },
        token,
    };
}

export async function googleAuth(credential: string, ipAddress: string) {
    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
        throw new Error('Invalid Google token');
    }

    const { email, sub: googleId } = payload;

    // Check if user exists
    let user = await prisma.user.findFirst({
        where: {
            OR: [
                { email: email.toLowerCase() },
                { googleId },
            ],
        },
    });

    if (user) {
        // Existing user - update Google ID if not set
        if (!user.googleId) {
            user = await prisma.user.update({
                where: { id: user.id },
                data: { googleId },
            });
        }

        // Check if banned
        if (user.isBanned) {
            if (user.banExpiresAt && user.banExpiresAt > new Date()) {
                throw new Error(`Your account is temporarily suspended until ${user.banExpiresAt.toISOString()}`);
            }
            // Ban expired, unban user
            await prisma.user.update({
                where: { id: user.id },
                data: { isBanned: false, banExpiresAt: null },
            });
        }
    } else {
        // New user - create account
        // Note: For Google OAuth, we assume user is 18+ as they need to accept during signup flow
        user = await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                googleId,
                dateOfBirth: new Date('2000-01-01'), // Default DOB for Google users
                isAdult: true, // Assumed adult for OAuth users
            },
        });
    }

    // Create session
    const sessionExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.session.create({
        data: {
            userId: user.id,
            ipHash: hashIp(ipAddress),
            expiresAt: sessionExpiry,
        },
    });

    // Generate token
    const token = generateToken(user.id, user.email);

    return {
        user: {
            id: user.id,
            email: user.email,
            isAdult: user.isAdult,
            createdAt: user.createdAt.toISOString(),
        },
        token,
    };
}

export async function getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new Error('User not found');
    }

    return {
        id: user.id,
        email: user.email,
        isAdult: user.isAdult,
        createdAt: user.createdAt.toISOString(),
    };
}

export async function deleteAccount(userId: string) {
    // Delete user and all related data (cascades handled by Prisma)
    await prisma.user.delete({
        where: { id: userId },
    });
}

export async function invalidateSessions(userId: string) {
    await prisma.session.updateMany({
        where: { userId },
        data: { isActive: false },
    });
}
