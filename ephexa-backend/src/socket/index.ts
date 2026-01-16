import { Server, Socket } from 'socket.io';
import { verifyToken } from '../middleware/auth';
import * as chatService from '../services/chatService';
import * as moderationService from '../services/moderationService';
import { checkRateLimit, setUserOnline, setUserOffline, setUserSocket, deleteUserSocket } from '../config/redis';
import { containsProfanity, cleanProfanity } from '../utils/profanityFilter';
import { sanitizeInput, generateDisplayName } from '../utils/helpers';
import type {
    ServerToClientEvents,
    ClientToServerEvents,
    InterServerEvents,
    SocketData,
    ChatMessage
} from '../types';

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export function setupSocketHandlers(
    io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
) {
    // Authentication middleware
    io.use(async (socket: TypedSocket, next) => {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Authentication required'));
        }

        const payload = verifyToken(token);

        if (!payload) {
            return next(new Error('Invalid token'));
        }

        socket.data.userId = payload.userId;
        socket.data.email = payload.email;
        next();
    });

    io.on('connection', async (socket: TypedSocket) => {
        const userId = socket.data.userId;
        console.log(`User connected: ${userId}`);

        // Set user as online
        await setUserOnline(userId);
        await setUserSocket(userId, socket.id);

        // Handle joining a room
        socket.on('join_room', async ({ roomId }) => {
            socket.join(roomId);
            await chatService.updateUserOnlineStatus(userId, roomId, true);

            // Notify others in the room
            socket.to(roomId).emit('user_joined', {
                userId,
                displayName: generateDisplayName(),
            });

            // Broadcast online status
            socket.to(roomId).emit('online_status', { userId, isOnline: true });
        });

        // Handle leaving a room
        socket.on('leave_room', async ({ roomId }) => {
            socket.leave(roomId);
            await chatService.updateUserOnlineStatus(userId, roomId, false);

            // Notify others
            socket.to(roomId).emit('user_left', { userId });
        });

        // Handle sending messages
        socket.on('send_message', async ({ roomId, content }) => {
            // Check rate limit
            const { allowed, retryAfter } = await checkRateLimit(userId);

            if (!allowed) {
                socket.emit('rate_limited', { retryAfter: retryAfter || 10 });
                return;
            }

            // Sanitize and filter content
            let sanitizedContent = sanitizeInput(content);

            // Check for profanity
            if (containsProfanity(sanitizedContent)) {
                sanitizedContent = cleanProfanity(sanitizedContent);
            }

            // Validate content
            if (!sanitizedContent || sanitizedContent.length === 0) {
                socket.emit('error', { message: 'Message cannot be empty' });
                return;
            }

            if (sanitizedContent.length > 1000) {
                socket.emit('error', { message: 'Message is too long (max 1000 characters)' });
                return;
            }

            // Save message to database
            const message = await chatService.createMessage(roomId, userId, sanitizedContent);

            // Broadcast to all in room (including sender)
            const chatMessage: ChatMessage = {
                id: message.id,
                content: message.content,
                senderId: message.senderId,
                senderName: generateDisplayName(),
                chatRoomId: message.chatRoomId,
                createdAt: message.createdAt,
                status: 'sent',
            };

            io.to(roomId).emit('message', chatMessage);
        });

        // Handle typing indicator
        socket.on('typing', ({ roomId, isTyping }) => {
            socket.to(roomId).emit('typing_indicator', {
                roomId,
                userId,
                isTyping,
            });
        });

        // Handle disconnection
        socket.on('disconnect', async () => {
            console.log(`User disconnected: ${userId}`);

            // Set user as offline
            await setUserOffline(userId);
            await deleteUserSocket(userId);

            // Notify all rooms the user was in
            const rooms = Array.from(socket.rooms).filter(r => r !== socket.id);

            for (const roomId of rooms) {
                await chatService.updateUserOnlineStatus(userId, roomId, false);
                socket.to(roomId).emit('user_left', { userId });
                socket.to(roomId).emit('online_status', { userId, isOnline: false });
            }
        });
    });
}
