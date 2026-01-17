"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocketHandlers = setupSocketHandlers;
const auth_1 = require("../middleware/auth");
const chatService = __importStar(require("../services/chatService"));
const callService_1 = require("../services/callService");
const redis_1 = require("../config/redis");
const profanityFilter_1 = require("../utils/profanityFilter");
const helpers_1 = require("../utils/helpers");
function setupSocketHandlers(io) {
    // Authentication middleware
    io.use(async (socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication required'));
        }
        const payload = (0, auth_1.verifyToken)(token);
        if (!payload) {
            return next(new Error('Invalid token'));
        }
        socket.data.userId = payload.userId;
        socket.data.email = payload.email;
        next();
    });
    io.on('connection', async (socket) => {
        const userId = socket.data.userId;
        console.log(`User connected: ${userId}`);
        // Set user as online
        await (0, redis_1.setUserOnline)(userId);
        await (0, redis_1.setUserSocket)(userId, socket.id);
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
                displayName: (0, helpers_1.generateDisplayName)(),
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
            const { allowed, retryAfter } = await (0, redis_1.checkRateLimit)(userId);
            if (!allowed) {
                socket.emit('rate_limited', { retryAfter: retryAfter || 10 });
                return;
            }
            // Sanitize and filter content
            let sanitizedContent = (0, helpers_1.sanitizeInput)(content);
            // Check for profanity
            if ((0, profanityFilter_1.containsProfanity)(sanitizedContent)) {
                sanitizedContent = (0, profanityFilter_1.cleanProfanity)(sanitizedContent);
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
            const chatMessage = {
                id: message.id,
                content: message.content,
                senderId: message.senderId,
                senderName: (0, helpers_1.generateDisplayName)(),
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
            console.log(`User ${userId} searching for call, interest: ${interest || 'any'}`);
            // First, end any existing call
            const existingCall = callService_1.callService.getCallBySocket(socket.id);
            if (existingCall) {
                const peerSocketId = callService_1.callService.getPeerSocketId(socket.id);
                callService_1.callService.endCall(socket.id);
                if (peerSocketId) {
                    io.to(peerSocketId).emit('call_ended', { reason: 'Peer left' });
                }
            }
            // Add to matching queue
            callService_1.callService.addToQueue(socket.id, userId, interest);
            socket.emit('searching_for_match');
            // Try to find a match
            const match = callService_1.callService.findMatch(socket.id, interest);
            if (match) {
                // Found a match! Create the call
                const call = callService_1.callService.createCall(socket.id, userId, match.socketId, match.userId);
                console.log(`Match found! Call ${call.id} between ${userId} and ${match.userId}`);
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
            }
        });
        // Handle canceling find
        socket.on('cancel_find', () => {
            console.log(`User ${userId} canceled call search`);
            callService_1.callService.removeFromQueue(socket.id);
        });
        // Handle ending current call
        socket.on('end_call', () => {
            console.log(`User ${userId} ended call`);
            const peerSocketId = callService_1.callService.getPeerSocketId(socket.id);
            const call = callService_1.callService.endCall(socket.id);
            if (call && peerSocketId) {
                io.to(peerSocketId).emit('call_ended', { reason: 'Peer ended the call' });
            }
        });
        // Handle "next" (skip to next random stranger)
        socket.on('next_call', ({ interest }) => {
            console.log(`User ${userId} wants next call`);
            // End current call
            const peerSocketId = callService_1.callService.getPeerSocketId(socket.id);
            const call = callService_1.callService.endCall(socket.id);
            if (call && peerSocketId) {
                io.to(peerSocketId).emit('call_ended', { reason: 'Peer skipped' });
            }
            // Start searching again (this triggers the find_call logic)
            callService_1.callService.addToQueue(socket.id, userId, interest);
            socket.emit('searching_for_match');
            const match = callService_1.callService.findMatch(socket.id, interest);
            if (match) {
                const newCall = callService_1.callService.createCall(socket.id, userId, match.socketId, match.userId);
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
            const peerSocketId = callService_1.callService.getPeerSocketId(socket.id);
            if (peerSocketId) {
                io.to(peerSocketId).emit('webrtc_offer', { sdp });
            }
        });
        // WebRTC Signaling: Relay answer to peer
        socket.on('webrtc_answer', ({ sdp }) => {
            const peerSocketId = callService_1.callService.getPeerSocketId(socket.id);
            if (peerSocketId) {
                io.to(peerSocketId).emit('webrtc_answer', { sdp });
            }
        });
        // WebRTC Signaling: Relay ICE candidate to peer
        socket.on('ice_candidate', ({ candidate }) => {
            const peerSocketId = callService_1.callService.getPeerSocketId(socket.id);
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
            await (0, redis_1.setUserOffline)(userId);
            await (0, redis_1.deleteUserSocket)(userId);
            // Handle call cleanup
            const { call, wasInQueue } = callService_1.callService.handleDisconnect(socket.id);
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
//# sourceMappingURL=index.js.map