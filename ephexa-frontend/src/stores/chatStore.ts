import { create } from 'zustand';
import type { ChatRoom, Message, TypingIndicator } from '../types';

interface ChatStore {
    // State
    chatRooms: ChatRoom[];
    activeRoomId: string | null;
    messages: Record<string, Message[]>;
    typingUsers: Record<string, TypingIndicator[]>;
    isConnected: boolean;
    isRateLimited: boolean;
    rateLimitRetryAfter: number | null;

    // Actions
    setChatRooms: (rooms: ChatRoom[]) => void;
    addChatRoom: (room: ChatRoom) => void;
    removeChatRoom: (roomId: string) => void;
    setActiveRoom: (roomId: string | null) => void;

    // Messages
    setMessages: (roomId: string, messages: Message[]) => void;
    addMessage: (roomId: string, message: Message) => void;
    updateMessageStatus: (roomId: string, messageId: string, status: Message['status']) => void;
    clearMessages: (roomId: string) => void;

    // Typing indicators
    setTypingUser: (indicator: TypingIndicator) => void;
    clearTypingUsers: (roomId: string) => void;

    // Connection status
    setConnected: (status: boolean) => void;
    setRateLimited: (limited: boolean, retryAfter?: number) => void;

    // Room updates
    updateRoomLastMessage: (roomId: string, message: Message) => void;
    incrementUnreadCount: (roomId: string) => void;
    resetUnreadCount: (roomId: string) => void;
    updateParticipantOnlineStatus: (roomId: string, participantId: string, isOnline: boolean) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
    // Initial state
    chatRooms: [],
    activeRoomId: null,
    messages: {},
    typingUsers: {},
    isConnected: false,
    isRateLimited: false,
    rateLimitRetryAfter: null,

    // Actions
    setChatRooms: (rooms) => set({ chatRooms: rooms }),

    addChatRoom: (room) =>
        set((state) => ({
            chatRooms: [room, ...state.chatRooms],
            messages: { ...state.messages, [room.id]: [] },
        })),

    removeChatRoom: (roomId) =>
        set((state) => {
            const { [roomId]: _, ...remainingMessages } = state.messages;
            return {
                chatRooms: state.chatRooms.filter((r) => r.id !== roomId),
                messages: remainingMessages,
                activeRoomId: state.activeRoomId === roomId ? null : state.activeRoomId,
            };
        }),

    setActiveRoom: (roomId) => {
        set({ activeRoomId: roomId });
        if (roomId) {
            get().resetUnreadCount(roomId);
        }
    },

    // Messages
    setMessages: (roomId, messages) =>
        set((state) => ({
            messages: { ...state.messages, [roomId]: messages },
        })),

    addMessage: (roomId, message) =>
        set((state) => ({
            messages: {
                ...state.messages,
                [roomId]: [...(state.messages[roomId] || []), message],
            },
        })),

    updateMessageStatus: (roomId, messageId, status) =>
        set((state) => ({
            messages: {
                ...state.messages,
                [roomId]: (state.messages[roomId] || []).map((m) =>
                    m.id === messageId ? { ...m, status } : m
                ),
            },
        })),

    clearMessages: (roomId) =>
        set((state) => ({
            messages: { ...state.messages, [roomId]: [] },
        })),

    // Typing indicators
    setTypingUser: (indicator) =>
        set((state) => {
            const roomTyping = state.typingUsers[indicator.roomId] || [];
            const filteredTyping = roomTyping.filter((t) => t.userId !== indicator.userId);

            return {
                typingUsers: {
                    ...state.typingUsers,
                    [indicator.roomId]: indicator.isTyping
                        ? [...filteredTyping, indicator]
                        : filteredTyping,
                },
            };
        }),

    clearTypingUsers: (roomId) =>
        set((state) => ({
            typingUsers: { ...state.typingUsers, [roomId]: [] },
        })),

    // Connection status
    setConnected: (status) => set({ isConnected: status }),

    setRateLimited: (limited, retryAfter) =>
        set({
            isRateLimited: limited,
            rateLimitRetryAfter: retryAfter ?? null,
        }),

    // Room updates
    updateRoomLastMessage: (roomId, message) =>
        set((state) => ({
            chatRooms: state.chatRooms.map((room) =>
                room.id === roomId ? { ...room, lastMessage: message } : room
            ),
        })),

    incrementUnreadCount: (roomId) =>
        set((state) => ({
            chatRooms: state.chatRooms.map((room) =>
                room.id === roomId ? { ...room, unreadCount: room.unreadCount + 1 } : room
            ),
        })),

    resetUnreadCount: (roomId) =>
        set((state) => ({
            chatRooms: state.chatRooms.map((room) =>
                room.id === roomId ? { ...room, unreadCount: 0 } : room
            ),
        })),

    updateParticipantOnlineStatus: (roomId, participantId, isOnline) =>
        set((state) => ({
            chatRooms: state.chatRooms.map((room) =>
                room.id === roomId
                    ? {
                        ...room,
                        participants: room.participants.map((p) =>
                            p.id === participantId ? { ...p, isOnline } : p
                        ),
                    }
                    : room
            ),
        })),
}));
