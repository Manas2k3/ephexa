// Call Service - Manages WebRTC call matching and sessions
// Using in-memory storage for simplicity (works for single-server deployment)

interface WaitingUser {
    socketId: string;
    userId: string;
    interest?: string;
    joinedAt: Date;
}

interface ActiveCall {
    id: string;
    user1: { socketId: string; userId: string };
    user2: { socketId: string; userId: string };
    startedAt: Date;
}

class CallService {
    // Users waiting to be matched
    private waitingQueue: Map<string, WaitingUser> = new Map(); // socketId -> WaitingUser

    // Active calls
    private activeCalls: Map<string, ActiveCall> = new Map(); // callId -> ActiveCall

    // Track which call a user is in
    private userToCall: Map<string, string> = new Map(); // socketId -> callId

    // Add user to matching queue
    addToQueue(socketId: string, userId: string, interest?: string): void {
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
    removeFromQueue(socketId: string): void {
        this.waitingQueue.delete(socketId);
    }

    // Find a match for the user
    findMatch(socketId: string, interest?: string): WaitingUser | null {
        const requester = this.waitingQueue.get(socketId);
        if (!requester) return null;

        // Find another user in the queue (not self)
        for (const [otherSocketId, user] of this.waitingQueue) {
            if (otherSocketId === socketId) continue;

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
    createCall(user1SocketId: string, user1UserId: string, user2SocketId: string, user2UserId: string): ActiveCall {
        const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const call: ActiveCall = {
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
    getCallBySocket(socketId: string): ActiveCall | null {
        const callId = this.userToCall.get(socketId);
        if (!callId) return null;
        return this.activeCalls.get(callId) || null;
    }

    // Get peer socket ID in a call
    getPeerSocketId(socketId: string): string | null {
        const call = this.getCallBySocket(socketId);
        if (!call) return null;

        if (call.user1.socketId === socketId) {
            return call.user2.socketId;
        }
        return call.user1.socketId;
    }

    // End a call
    endCall(socketId: string): ActiveCall | null {
        const call = this.getCallBySocket(socketId);
        if (!call) return null;

        // Clean up
        this.activeCalls.delete(call.id);
        this.userToCall.delete(call.user1.socketId);
        this.userToCall.delete(call.user2.socketId);

        return call;
    }

    // Check if user is in a call
    isInCall(socketId: string): boolean {
        return this.userToCall.has(socketId);
    }

    // Check if user is in queue
    isInQueue(socketId: string): boolean {
        return this.waitingQueue.has(socketId);
    }

    // Get queue size (for debugging/stats)
    getQueueSize(): number {
        return this.waitingQueue.size;
    }

    // Clean up on disconnect
    handleDisconnect(socketId: string): { call: ActiveCall | null; wasInQueue: boolean } {
        const wasInQueue = this.isInQueue(socketId);
        this.removeFromQueue(socketId);
        const call = this.endCall(socketId);

        return { call, wasInQueue };
    }
}

export const callService = new CallService();
