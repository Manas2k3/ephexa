"use strict";
// Call Service - Manages WebRTC call matching and sessions
// Using in-memory storage for simplicity (works for single-server deployment)
Object.defineProperty(exports, "__esModule", { value: true });
exports.callService = void 0;
class CallService {
    // Users waiting to be matched
    waitingQueue = new Map(); // socketId -> WaitingUser
    // Active calls
    activeCalls = new Map(); // callId -> ActiveCall
    // Track which call a user is in
    userToCall = new Map(); // socketId -> callId
    // Add user to matching queue
    addToQueue(socketId, userId, interest) {
        // Remove from queue if already there
        this.removeFromQueue(socketId);
        this.waitingQueue.set(socketId, {
            socketId,
            userId,
            interest,
            joinedAt: new Date(),
        });
    }
    // Remove user from queue
    removeFromQueue(socketId) {
        this.waitingQueue.delete(socketId);
    }
    // Find a match for the user
    findMatch(socketId, interest) {
        const requester = this.waitingQueue.get(socketId);
        if (!requester)
            return null;
        // Find another user in the queue (not self)
        for (const [otherSocketId, user] of this.waitingQueue) {
            if (otherSocketId === socketId)
                continue;
            // If interest specified, match by interest
            if (interest && user.interest && interest !== user.interest) {
                continue;
            }
            // Found a match!
            return user;
        }
        return null;
    }
    // Create a call between two users
    createCall(user1SocketId, user1UserId, user2SocketId, user2UserId) {
        const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const call = {
            id: callId,
            user1: { socketId: user1SocketId, userId: user1UserId },
            user2: { socketId: user2SocketId, userId: user2UserId },
            startedAt: new Date(),
        };
        this.activeCalls.set(callId, call);
        this.userToCall.set(user1SocketId, callId);
        this.userToCall.set(user2SocketId, callId);
        // Remove both from queue
        this.removeFromQueue(user1SocketId);
        this.removeFromQueue(user2SocketId);
        return call;
    }
    // Get call by socket ID
    getCallBySocket(socketId) {
        const callId = this.userToCall.get(socketId);
        if (!callId)
            return null;
        return this.activeCalls.get(callId) || null;
    }
    // Get peer socket ID in a call
    getPeerSocketId(socketId) {
        const call = this.getCallBySocket(socketId);
        if (!call)
            return null;
        if (call.user1.socketId === socketId) {
            return call.user2.socketId;
        }
        return call.user1.socketId;
    }
    // End a call
    endCall(socketId) {
        const call = this.getCallBySocket(socketId);
        if (!call)
            return null;
        // Clean up
        this.activeCalls.delete(call.id);
        this.userToCall.delete(call.user1.socketId);
        this.userToCall.delete(call.user2.socketId);
        return call;
    }
    // Check if user is in a call
    isInCall(socketId) {
        return this.userToCall.has(socketId);
    }
    // Check if user is in queue
    isInQueue(socketId) {
        return this.waitingQueue.has(socketId);
    }
    // Get queue size (for debugging/stats)
    getQueueSize() {
        return this.waitingQueue.size;
    }
    // Clean up on disconnect
    handleDisconnect(socketId) {
        const wasInQueue = this.isInQueue(socketId);
        this.removeFromQueue(socketId);
        const call = this.endCall(socketId);
        return { call, wasInQueue };
    }
}
exports.callService = new CallService();
//# sourceMappingURL=callService.js.map