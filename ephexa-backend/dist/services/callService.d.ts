interface WaitingUser {
    socketId: string;
    userId: string;
    interest?: string;
    joinedAt: Date;
}
interface ActiveCall {
    id: string;
    user1: {
        socketId: string;
        userId: string;
    };
    user2: {
        socketId: string;
        userId: string;
    };
    startedAt: Date;
}
declare class CallService {
    private waitingQueue;
    private activeCalls;
    private userToCall;
    addToQueue(socketId: string, userId: string, interest?: string): void;
    removeFromQueue(socketId: string): void;
    findMatch(socketId: string, interest?: string): WaitingUser | null;
    createCall(user1SocketId: string, user1UserId: string, user2SocketId: string, user2UserId: string): ActiveCall;
    getCallBySocket(socketId: string): ActiveCall | null;
    getPeerSocketId(socketId: string): string | null;
    endCall(socketId: string): ActiveCall | null;
    isInCall(socketId: string): boolean;
    isInQueue(socketId: string): boolean;
    getQueueSize(): number;
    handleDisconnect(socketId: string): {
        call: ActiveCall | null;
        wasInQueue: boolean;
    };
}
export declare const callService: CallService;
export {};
//# sourceMappingURL=callService.d.ts.map