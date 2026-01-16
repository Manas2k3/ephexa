export interface JWTPayload {
    userId: string;
    email: string;
    iat?: number;
    exp?: number;
}

export interface AuthRequest {
    userId?: string;
    email?: string;
}

export interface SignupBody {
    email: string;
    password: string;
    dateOfBirth: string;
    isAdultConfirmed: boolean;
    agreedToTerms: boolean;
}

export interface LoginBody {
    email: string;
    password: string;
}

export interface CreateChatBody {
    interest: string;
}

export interface ReportBody {
    reason: string;
    messageId?: string;
    description?: string;
}

export interface SocketAuthPayload {
    token: string;
}

export interface ChatMessage {
    id: string;
    content: string;
    senderId: string;
    senderName?: string;
    chatRoomId: string;
    createdAt: Date;
    status: 'sent' | 'delivered' | 'read';
}

export interface TypingIndicator {
    roomId: string;
    userId: string;
    isTyping: boolean;
}

// Socket event types
export interface ServerToClientEvents {
    message: (data: ChatMessage) => void;
    user_joined: (data: { userId: string; displayName?: string }) => void;
    user_left: (data: { userId: string }) => void;
    typing_indicator: (data: TypingIndicator) => void;
    rate_limited: (data: { retryAfter: number }) => void;
    moderation_action: (data: { type: 'mute' | 'disconnect'; reason: string; duration?: number }) => void;
    online_status: (data: { userId: string; isOnline: boolean }) => void;
    error: (data: { message: string }) => void;
}

export interface ClientToServerEvents {
    join_room: (data: { roomId: string }) => void;
    leave_room: (data: { roomId: string }) => void;
    send_message: (data: { roomId: string; content: string }) => void;
    typing: (data: { roomId: string; isTyping: boolean }) => void;
}

export interface InterServerEvents {
    ping: () => void;
}

export interface SocketData {
    userId: string;
    email: string;
}
