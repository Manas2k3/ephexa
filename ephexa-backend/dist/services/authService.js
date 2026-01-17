"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signup = signup;
exports.login = login;
exports.googleAuth = googleAuth;
exports.getCurrentUser = getCurrentUser;
exports.deleteAccount = deleteAccount;
exports.invalidateSessions = invalidateSessions;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const google_auth_library_1 = require("google-auth-library");
const database_1 = require("../config/database");
const auth_1 = require("../middleware/auth");
const helpers_1 = require("../utils/helpers");
const SALT_ROUNDS = 10;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const googleClient = new google_auth_library_1.OAuth2Client(GOOGLE_CLIENT_ID);
async function signup(data, ipAddress) {
    const { email, password, dateOfBirth, isAdultConfirmed, agreedToTerms } = data;
    // Validate age (must be 18+)
    const dob = new Date(dateOfBirth);
    const age = (0, helpers_1.calculateAge)(dob);
    if (age < 18 || !isAdultConfirmed) {
        throw new Error('You must be 18 or older to use this service');
    }
    if (!agreedToTerms) {
        throw new Error('You must agree to the Terms of Service');
    }
    // Check if user exists
    const existingUser = await database_1.prisma.user.findUnique({
        where: { email: email.toLowerCase() },
    });
    if (existingUser) {
        throw new Error('An account with this email already exists');
    }
    // Hash password
    const passwordHash = await bcryptjs_1.default.hash(password, SALT_ROUNDS);
    // Create user
    const user = await database_1.prisma.user.create({
        data: {
            email: email.toLowerCase(),
            passwordHash,
            dateOfBirth: dob,
            isAdult: true,
        },
    });
    // Create session
    const sessionExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await database_1.prisma.session.create({
        data: {
            userId: user.id,
            ipHash: (0, helpers_1.hashIp)(ipAddress),
            expiresAt: sessionExpiry,
        },
    });
    // Generate token
    const token = (0, auth_1.generateToken)(user.id, user.email);
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
async function login(data, ipAddress) {
    const { email, password } = data;
    // Find user
    const user = await database_1.prisma.user.findUnique({
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
        await database_1.prisma.user.update({
            where: { id: user.id },
            data: { isBanned: false, banExpiresAt: null },
        });
    }
    // Verify password
    const isValidPassword = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!isValidPassword) {
        throw new Error('Invalid email or password');
    }
    // Create or update session
    const sessionExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await database_1.prisma.session.create({
        data: {
            userId: user.id,
            ipHash: (0, helpers_1.hashIp)(ipAddress),
            expiresAt: sessionExpiry,
        },
    });
    // Generate token
    const token = (0, auth_1.generateToken)(user.id, user.email);
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
async function googleAuth(credential, ipAddress) {
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
    let user = await database_1.prisma.user.findFirst({
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
            user = await database_1.prisma.user.update({
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
            await database_1.prisma.user.update({
                where: { id: user.id },
                data: { isBanned: false, banExpiresAt: null },
            });
        }
    }
    else {
        // New user - create account
        // Note: For Google OAuth, we assume user is 18+ as they need to accept during signup flow
        user = await database_1.prisma.user.create({
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
    await database_1.prisma.session.create({
        data: {
            userId: user.id,
            ipHash: (0, helpers_1.hashIp)(ipAddress),
            expiresAt: sessionExpiry,
        },
    });
    // Generate token
    const token = (0, auth_1.generateToken)(user.id, user.email);
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
async function getCurrentUser(userId) {
    const user = await database_1.prisma.user.findUnique({
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
async function deleteAccount(userId) {
    // Delete user and all related data (cascades handled by Prisma)
    await database_1.prisma.user.delete({
        where: { id: userId },
    });
}
async function invalidateSessions(userId) {
    await database_1.prisma.session.updateMany({
        where: { userId },
        data: { isActive: false },
    });
}
//# sourceMappingURL=authService.js.map