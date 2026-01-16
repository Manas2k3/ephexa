import { useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useChatStore } from '../stores/chatStore';
import { useUIStore } from '../stores/uiStore';
import { socketService } from '../services/socket';
import type { Message, TypingIndicator } from '../types';

export function useSocket() {
    const { token, isAuthenticated } = useAuthStore();
    const {
        setConnected,
        addMessage,
        setTypingUser,
        updateRoomLastMessage,
        incrementUnreadCount,
        activeRoomId,
        setRateLimited,
    } = useChatStore();
    const { addToast } = useUIStore();

    const activeRoomIdRef = useRef(activeRoomId);

    // Keep ref updated
    useEffect(() => {
        activeRoomIdRef.current = activeRoomId;
    }, [activeRoomId]);

    // Connect socket when authenticated
    useEffect(() => {
        if (isAuthenticated && token) {
            socketService.connect(token);
        }

        return () => {
            if (!isAuthenticated) {
                socketService.disconnect();
            }
        };
    }, [isAuthenticated, token]);

    // Set up event listeners
    useEffect(() => {
        socketService.onConnect(() => {
            setConnected(true);
        });

        socketService.onDisconnect(() => {
            setConnected(false);
        });

        socketService.onMessage((message: Message) => {
            addMessage(message.chatRoomId, message);
            updateRoomLastMessage(message.chatRoomId, message);

            // Increment unread if not in active room
            if (message.chatRoomId !== activeRoomIdRef.current) {
                incrementUnreadCount(message.chatRoomId);
            }
        });

        socketService.onTyping((indicator: TypingIndicator) => {
            setTypingUser(indicator);
        });

        socketService.onRateLimited((data) => {
            setRateLimited(true, data.retryAfter);
            addToast({
                type: 'warning',
                message: `Slow down! You can send messages again in ${data.retryAfter} seconds.`,
            });

            // Clear rate limit after duration
            setTimeout(() => {
                setRateLimited(false);
            }, data.retryAfter * 1000);
        });

        socketService.onModeration((data) => {
            if (data.type === 'mute') {
                addToast({
                    type: 'warning',
                    message: `You have been muted for ${data.duration} seconds. Reason: ${data.reason}`,
                });
            } else if (data.type === 'disconnect') {
                addToast({
                    type: 'error',
                    message: `You have been disconnected. Reason: ${data.reason}`,
                });
                socketService.disconnect();
            }
        });

        socketService.onUserJoined((data) => {
            addToast({
                type: 'info',
                message: `${data.displayName || 'A user'} joined the chat`,
            });
        });

        socketService.onUserLeft((data) => {
            addToast({
                type: 'info',
                message: `User ${data.userId.slice(0, 8)} left the chat`,
            });
        });
    }, [addMessage, updateRoomLastMessage, incrementUnreadCount, setTypingUser, setConnected, setRateLimited, addToast]);

    const joinRoom = useCallback((roomId: string) => {
        socketService.joinRoom(roomId);
    }, []);

    const leaveRoom = useCallback((roomId: string) => {
        socketService.leaveRoom(roomId);
    }, []);

    const sendMessage = useCallback((roomId: string, content: string) => {
        socketService.sendMessage(roomId, content);
    }, []);

    const sendTypingStatus = useCallback((roomId: string, isTyping: boolean) => {
        socketService.sendTypingStatus(roomId, isTyping);
    }, []);

    return {
        isConnected: socketService.isConnected(),
        joinRoom,
        leaveRoom,
        sendMessage,
        sendTypingStatus,
    };
}
