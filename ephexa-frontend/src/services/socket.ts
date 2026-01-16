import { io, Socket } from 'socket.io-client';
import type { Message, TypingIndicator } from '../types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

class SocketService {
    private socket: Socket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;

    // Event callbacks
    private onMessageCallback?: (message: Message) => void;
    private onTypingCallback?: (indicator: TypingIndicator) => void;
    private onUserJoinedCallback?: (data: { userId: string; displayName?: string }) => void;
    private onUserLeftCallback?: (data: { userId: string }) => void;
    private onRateLimitedCallback?: (data: { retryAfter: number }) => void;
    private onModerationCallback?: (data: { type: 'mute' | 'disconnect'; reason: string; duration?: number }) => void;
    private onConnectCallback?: () => void;
    private onDisconnectCallback?: () => void;
    private onOnlineStatusCallback?: (data: { userId: string; isOnline: boolean }) => void;

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

    // Room actions
    joinRoom(roomId: string): void {
        this.socket?.emit('join_room', { roomId });
    }

    leaveRoom(roomId: string): void {
        this.socket?.emit('leave_room', { roomId });
    }

    // Messaging
    sendMessage(roomId: string, content: string): void {
        this.socket?.emit('send_message', { roomId, content });
    }

    // Typing indicator
    sendTypingStatus(roomId: string, isTyping: boolean): void {
        this.socket?.emit('typing', { roomId, isTyping });
    }

    // Event listeners
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
}

export const socketService = new SocketService();
