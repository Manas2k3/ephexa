import { Server, Socket } from 'socket.io';
import { verifyToken } from '../middleware/auth';
import * as chatService from '../services/chatService';
import * as moderationService from '../services/moderationService';
import { callService } from '../services/callService';
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

        // ==========================================
        // CHAT ROOM HANDLERS
        // ==========================================

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

        // ==========================================
        // WEBRTC VIDEO CALL HANDLERS
        // ==========================================

        // Handle finding a call partner (Omegle-style random matching)
        socket.on('find_call', ({ interest }) => {
            console.log(`[find_call] User ${userId} (socket: ${socket.id}) searching for call, interest: ${interest || 'any'}`);
            console.log(`[find_call] Queue size before: ${callService.getQueueSize()}`);

            // First, end any existing call
            const existingCall = callService.getCallBySocket(socket.id);
            if (existingCall) {
                console.log(`[find_call] User was in existing call ${existingCall.id}`);
                const peerSocketId = callService.getPeerSocketId(socket.id);
                callService.endCall(socket.id);
                if (peerSocketId) {
                    io.to(peerSocketId).emit('call_ended', { reason: 'Peer left' });
                }
            }

            // Check if already in queue
            if (callService.isInQueue(socket.id)) {
                console.log(`[find_call] User already in queue, removing first`);
                callService.removeFromQueue(socket.id);
            }

            // Add to matching queue
            callService.addToQueue(socket.id, userId, interest);
            console.log(`[find_call] Added to queue. Queue size after: ${callService.getQueueSize()}`);
            socket.emit('searching_for_match');

            // Try to find a match
            const match = callService.findMatch(socket.id, interest);
            console.log(`[find_call] findMatch result:`, match ? `Found ${match.userId} (socket: ${match.socketId})` : 'No match');

            if (match) {
                // Found a match! Create the call
                const call = callService.createCall(socket.id, userId, match.socketId, match.userId);

                console.log(`[find_call] ✅ MATCH FOUND! Call ${call.id}`);
                console.log(`[find_call]   User 1: ${userId} (socket: ${socket.id}) - isInitiator: false`);
                console.log(`[find_call]   User 2: ${match.userId} (socket: ${match.socketId}) - isInitiator: true`);

                // Notify both users - the second user (match) is the initiator (creates the offer)
                socket.emit('call_found', {
                    callId: call.id,
                    peerId: match.userId,
                    isInitiator: false,
                });

                io.to(match.socketId).emit('call_found', {
                    callId: call.id,
                    peerId: userId,
                    isInitiator: true, // This user creates the WebRTC offer
                });
            } else {
                console.log(`[find_call] No match yet, waiting in queue...`);
            }
        });

        // Handle canceling find
        socket.on('cancel_find', () => {
            console.log(`User ${userId} canceled call search`);
            callService.removeFromQueue(socket.id);
        });

        // Handle ending current call
        socket.on('end_call', () => {
            console.log(`User ${userId} ended call`);

            const peerSocketId = callService.getPeerSocketId(socket.id);
            const call = callService.endCall(socket.id);

            if (call && peerSocketId) {
                io.to(peerSocketId).emit('call_ended', { reason: 'Peer ended the call' });
            }
        });

        // Handle "next" (skip to next random stranger)
        socket.on('next_call', ({ interest }) => {
            console.log(`User ${userId} wants next call`);

            // End current call
            const peerSocketId = callService.getPeerSocketId(socket.id);
            const call = callService.endCall(socket.id);

            if (call && peerSocketId) {
                io.to(peerSocketId).emit('call_ended', { reason: 'Peer skipped' });
            }

            // Start searching again (this triggers the find_call logic)
            callService.addToQueue(socket.id, userId, interest);
            socket.emit('searching_for_match');

            const match = callService.findMatch(socket.id, interest);

            if (match) {
                const newCall = callService.createCall(socket.id, userId, match.socketId, match.userId);

                socket.emit('call_found', {
                    callId: newCall.id,
                    peerId: match.userId,
                    isInitiator: false,
                });

                io.to(match.socketId).emit('call_found', {
                    callId: newCall.id,
                    peerId: userId,
                    isInitiator: true,
                });
            }
        });

        // WebRTC Signaling: Relay offer to peer
        socket.on('webrtc_offer', ({ sdp }) => {
            console.log(`Relaying WebRTC offer from ${socket.id}`);
            const peerSocketId = callService.getPeerSocketId(socket.id);
            console.log(`Peer socket ID: ${peerSocketId}`);
            if (peerSocketId) {
                console.log(`Sending offer to peer ${peerSocketId}`);
                io.to(peerSocketId).emit('webrtc_offer', { sdp });
            } else {
                console.error('No peer found to relay offer to!');
            }
        });

        // WebRTC Signaling: Relay answer to peer
        socket.on('webrtc_answer', ({ sdp }) => {
            console.log(`Relaying WebRTC answer from ${socket.id}`);
            const peerSocketId = callService.getPeerSocketId(socket.id);
            console.log(`Peer socket ID: ${peerSocketId}`);
            if (peerSocketId) {
                console.log(`Sending answer to peer ${peerSocketId}`);
                io.to(peerSocketId).emit('webrtc_answer', { sdp });
            } else {
                console.error('No peer found to relay answer to!');
            }
        });

        // WebRTC Signaling: Relay ICE candidate to peer
        socket.on('ice_candidate', ({ candidate }) => {
            const peerSocketId = callService.getPeerSocketId(socket.id);
            if (peerSocketId) {
                io.to(peerSocketId).emit('ice_candidate', { candidate });
            }
        });

        // ==========================================
        // DISCONNECTION HANDLER
        // ==========================================

        // Handle disconnection
        socket.on('disconnect', async () => {
            console.log(`User disconnected: ${userId}`);

            // Set user as offline
            await setUserOffline(userId);
            await deleteUserSocket(userId);

            // Handle call cleanup
            const { call, wasInQueue } = callService.handleDisconnect(socket.id);
            if (call) {
                // Notify the peer that we disconnected
                const peerSocketId = call.user1.socketId === socket.id
                    ? call.user2.socketId
                    : call.user1.socketId;
                io.to(peerSocketId).emit('peer_disconnected');
                io.to(peerSocketId).emit('call_ended', { reason: 'Peer disconnected' });
            }

            // Notify all chat rooms the user was in
            const rooms = Array.from(socket.rooms).filter(r => r !== socket.id);

            for (const roomId of rooms) {
                await chatService.updateUserOnlineStatus(userId, roomId, false);
                socket.to(roomId).emit('user_left', { userId });
                socket.to(roomId).emit('online_status', { userId, isOnline: false });
            }
        });
    });
}

