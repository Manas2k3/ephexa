// User types
export interface User {
    id: string;
    email: string;
    createdAt: string;
    isAdult: boolean;
}

export interface UserProfile {
    id: string;
    displayName?: string;
    interest?: string;
    isOnline: boolean;
}

// Auth types
export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface SignupData {
    email: string;
    password: string;
    confirmPassword: string;
    dateOfBirth: string;
    isAdultConfirmed: boolean;
    agreedToTerms: boolean;
}

// Chat types
export interface ChatRoom {
    id: string;
    name?: string;
    interest: string;
    createdAt: string;
    participants: ChatParticipant[];
    lastMessage?: Message;
    unreadCount: number;
}

export interface ChatParticipant {
    id: string;
    displayName?: string;
    isOnline: boolean;
    joinedAt: string;
}

export interface Message {
    id: string;
    content: string;
    senderId: string;
    senderName?: string;
    chatRoomId: string;
    createdAt: string;
    status: 'sending' | 'sent' | 'delivered' | 'read';
}

export interface TypingIndicator {
    roomId: string;
    userId: string;
    isTyping: boolean;
}

// Report types
export interface Report {
    reportedUserId: string;
    reason: ReportReason;
    messageId?: string;
    description?: string;
}

export type ReportReason =
    | 'spam'
    | 'harassment'
    | 'inappropriate_content'
    | 'underage_user'
    | 'impersonation'
    | 'other';

// API Response types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}

// Socket event types
export interface SocketEvents {
    // Client to server
    join_room: { roomId: string };
    leave_room: { roomId: string };
    send_message: { roomId: string; content: string };
    typing: { roomId: string; isTyping: boolean };

    // Server to client
    message: Message;
    user_joined: { userId: string; displayName?: string };
    user_left: { userId: string };
    typing_indicator: TypingIndicator;
    rate_limited: { retryAfter: number };
    moderation_action: { type: 'mute' | 'disconnect'; reason: string; duration?: number };
    online_status: { userId: string; isOnline: boolean };
}

// Interest categories for chat matching
export const INTEREST_CATEGORIES = [
    'Technology',
    'Gaming',
    'Music',
    'Movies & TV',
    'Books',
    'Sports',
    'Travel',
    'Food & Cooking',
    'Art & Design',
    'Science',
    'Business',
    'Health & Fitness',
    'Photography',
    'Fashion',
    'General Chat',
] as const;

export type InterestCategory = typeof INTEREST_CATEGORIES[number];

// ==========================================
// WebRTC Video Call Types
// ==========================================

export type CallState =
    | 'idle'           // Not in a call, not searching
    | 'searching'      // Looking for a match
    | 'connecting'     // Match found, establishing WebRTC
    | 'connected'      // In active call
    | 'ended';         // Call ended, can search again

export interface CallFoundPayload {
    callId: string;
    peerId: string;
    isInitiator: boolean;
}

export interface RTCSessionDescriptionInit {
    type: 'offer' | 'answer';
    sdp: string;
}

export interface RTCIceCandidateInit {
    candidate: string;
    sdpMLineIndex?: number | null;
    sdpMid?: string | null;
}

// ICE Server configuration (STUN/TURN)
export const ICE_SERVERS: RTCConfiguration = {
    iceServers: [
        // Google's free STUN servers
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        // Twilio's free STUN server
        { urls: 'stun:global.stun.twilio.com:3478' },
    ],
};

