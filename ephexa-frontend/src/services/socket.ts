import { io, Socket } from 'socket.io-client';
import type { Message, TypingIndicator, CallFoundPayload, RTCSessionDescriptionInit, RTCIceCandidateInit } from '../types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

class SocketService {
    private socket: Socket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;

    // Chat event callbacks
    private onMessageCallback?: (message: Message) => void;
    private onTypingCallback?: (indicator: TypingIndicator) => void;
    private onUserJoinedCallback?: (data: { userId: string; displayName?: string }) => void;
    private onUserLeftCallback?: (data: { userId: string }) => void;
    private onRateLimitedCallback?: (data: { retryAfter: number }) => void;
    private onModerationCallback?: (data: { type: 'mute' | 'disconnect'; reason: string; duration?: number }) => void;
    private onConnectCallback?: () => void;
    private onDisconnectCallback?: () => void;
    private onOnlineStatusCallback?: (data: { userId: string; isOnline: boolean }) => void;

    // WebRTC call event callbacks
    private onCallFoundCallback?: (data: CallFoundPayload) => void;
    private onCallEndedCallback?: (data: { reason: string }) => void;
    private onPeerDisconnectedCallback?: () => void;
    private onSearchingCallback?: () => void;
    private onWebRTCOfferCallback?: (data: { sdp: RTCSessionDescriptionInit }) => void;
    private onWebRTCAnswerCallback?: (data: { sdp: RTCSessionDescriptionInit }) => void;
    private onIceCandidateCallback?: (data: { candidate: RTCIceCandidateInit }) => void;

    connect(token: string): void {
        if (this.socket?.connected) {
            return;
        }

        this.socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: this.maxReconnectAttempts,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
        });

        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            this.reconnectAttempts = 0;
            this.onConnectCallback?.();
        });

        this.socket.on('disconnect', () => {
            this.onDisconnectCallback?.();
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error.message);
            this.reconnectAttempts++;
        });

        // Chat events
        this.socket.on('message', (message: Message) => {
            this.onMessageCallback?.(message);
        });

        this.socket.on('typing_indicator', (indicator: TypingIndicator) => {
            this.onTypingCallback?.(indicator);
        });

        this.socket.on('user_joined', (data: { userId: string; displayName?: string }) => {
            this.onUserJoinedCallback?.(data);
        });

        this.socket.on('user_left', (data: { userId: string }) => {
            this.onUserLeftCallback?.(data);
        });

        this.socket.on('rate_limited', (data: { retryAfter: number }) => {
            this.onRateLimitedCallback?.(data);
        });

        this.socket.on('moderation_action', (data: { type: 'mute' | 'disconnect'; reason: string; duration?: number }) => {
            this.onModerationCallback?.(data);
        });

        this.socket.on('online_status', (data: { userId: string; isOnline: boolean }) => {
            this.onOnlineStatusCallback?.(data);
        });

        // WebRTC call events
        this.socket.on('searching_for_match', () => {
            this.onSearchingCallback?.();
        });

        this.socket.on('call_found', (data: CallFoundPayload) => {
            this.onCallFoundCallback?.(data);
        });

        this.socket.on('call_ended', (data: { reason: string }) => {
            this.onCallEndedCallback?.(data);
        });

        this.socket.on('peer_disconnected', () => {
            this.onPeerDisconnectedCallback?.();
        });

        this.socket.on('webrtc_offer', (data: { sdp: RTCSessionDescriptionInit }) => {
            this.onWebRTCOfferCallback?.(data);
        });

        this.socket.on('webrtc_answer', (data: { sdp: RTCSessionDescriptionInit }) => {
            this.onWebRTCAnswerCallback?.(data);
        });

        this.socket.on('ice_candidate', (data: { candidate: RTCIceCandidateInit }) => {
            this.onIceCandidateCallback?.(data);
        });
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    isConnected(): boolean {
        return this.socket?.connected ?? false;
    }

    // ==========================================
    // CHAT ROOM ACTIONS
    // ==========================================

    joinRoom(roomId: string): void {
        this.socket?.emit('join_room', { roomId });
    }

    leaveRoom(roomId: string): void {
        this.socket?.emit('leave_room', { roomId });
    }

    sendMessage(roomId: string, content: string): void {
        this.socket?.emit('send_message', { roomId, content });
    }

    sendTypingStatus(roomId: string, isTyping: boolean): void {
        this.socket?.emit('typing', { roomId, isTyping });
    }

    // ==========================================
    // WEBRTC CALL ACTIONS
    // ==========================================

    findCall(interest?: string): void {
        this.socket?.emit('find_call', { interest });
    }

    cancelFind(): void {
        this.socket?.emit('cancel_find');
    }

    endCall(): void {
        this.socket?.emit('end_call');
    }

    nextCall(interest?: string): void {
        this.socket?.emit('next_call', { interest });
    }

    sendOffer(sdp: RTCSessionDescriptionInit): void {
        this.socket?.emit('webrtc_offer', { sdp });
    }

    sendAnswer(sdp: RTCSessionDescriptionInit): void {
        this.socket?.emit('webrtc_answer', { sdp });
    }

    sendIceCandidate(candidate: RTCIceCandidateInit): void {
        this.socket?.emit('ice_candidate', { candidate });
    }

    // ==========================================
    // CHAT EVENT LISTENERS
    // ==========================================

    onMessage(callback: (message: Message) => void): void {
        this.onMessageCallback = callback;
    }

    onTyping(callback: (indicator: TypingIndicator) => void): void {
        this.onTypingCallback = callback;
    }

    onUserJoined(callback: (data: { userId: string; displayName?: string }) => void): void {
        this.onUserJoinedCallback = callback;
    }

    onUserLeft(callback: (data: { userId: string }) => void): void {
        this.onUserLeftCallback = callback;
    }

    onRateLimited(callback: (data: { retryAfter: number }) => void): void {
        this.onRateLimitedCallback = callback;
    }

    onModeration(callback: (data: { type: 'mute' | 'disconnect'; reason: string; duration?: number }) => void): void {
        this.onModerationCallback = callback;
    }

    onConnect(callback: () => void): void {
        this.onConnectCallback = callback;
    }

    onDisconnect(callback: () => void): void {
        this.onDisconnectCallback = callback;
    }

    onOnlineStatus(callback: (data: { userId: string; isOnline: boolean }) => void): void {
        this.onOnlineStatusCallback = callback;
    }

    // ==========================================
    // WEBRTC CALL EVENT LISTENERS
    // ==========================================

    onCallFound(callback: (data: CallFoundPayload) => void): void {
        this.onCallFoundCallback = callback;
    }

    onCallEnded(callback: (data: { reason: string }) => void): void {
        this.onCallEndedCallback = callback;
    }

    onPeerDisconnected(callback: () => void): void {
        this.onPeerDisconnectedCallback = callback;
    }

    onSearching(callback: () => void): void {
        this.onSearchingCallback = callback;
    }

    onWebRTCOffer(callback: (data: { sdp: RTCSessionDescriptionInit }) => void): void {
        this.onWebRTCOfferCallback = callback;
    }

    onWebRTCAnswer(callback: (data: { sdp: RTCSessionDescriptionInit }) => void): void {
        this.onWebRTCAnswerCallback = callback;
    }

    onIceCandidate(callback: (data: { candidate: RTCIceCandidateInit }) => void): void {
        this.onIceCandidateCallback = callback;
    }

    // Clear all call-related listeners (for cleanup)
    clearCallListeners(): void {
        this.onCallFoundCallback = undefined;
        this.onCallEndedCallback = undefined;
        this.onPeerDisconnectedCallback = undefined;
        this.onSearchingCallback = undefined;
        this.onWebRTCOfferCallback = undefined;
        this.onWebRTCAnswerCallback = undefined;
        this.onIceCandidateCallback = undefined;
    }
}

export const socketService = new SocketService();

