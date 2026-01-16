import { useState, useCallback, useEffect } from 'react';
import { useChatStore } from '../stores/chatStore';
import { useUIStore } from '../stores/uiStore';
import { api } from '../services/api';
import { useSocket } from './useSocket';
import type { InterestCategory, Report } from '../types';

export function useChat() {
    const [isLoading, setIsLoading] = useState(false);
    const {
        chatRooms,
        activeRoomId,
        messages,
        typingUsers,
        isRateLimited,
        setChatRooms,
        addChatRoom,
        removeChatRoom,
        setActiveRoom,
        setMessages,
    } = useChatStore();
    const { addToast } = useUIStore();
    const { joinRoom, leaveRoom, sendMessage, sendTypingStatus } = useSocket();

    // Fetch chat rooms on mount
    useEffect(() => {
        fetchChatRooms();
    }, []);

    const fetchChatRooms = useCallback(async () => {
        setIsLoading(true);
        const response = await api.getChatRooms();

        if (response.success && response.data) {
            setChatRooms(response.data);
        } else {
            addToast({ type: 'error', message: 'Failed to load chats' });
        }

        setIsLoading(false);
    }, [setChatRooms, addToast]);

    const createOrJoinChat = useCallback(async (interest: InterestCategory) => {
        setIsLoading(true);
        const response = await api.createOrJoinChat(interest);

        if (response.success && response.data) {
            addChatRoom(response.data);
            joinRoom(response.data.id);
            setActiveRoom(response.data.id);
            addToast({ type: 'success', message: `Joined ${interest} chat!` });
        } else {
            addToast({ type: 'error', message: response.error || 'Failed to join chat' });
        }

        setIsLoading(false);
        return response;
    }, [addChatRoom, joinRoom, setActiveRoom, addToast]);

    const leaveChatRoom = useCallback(async (roomId: string) => {
        leaveRoom(roomId);
        const response = await api.leaveChat(roomId);

        if (response.success) {
            removeChatRoom(roomId);
            addToast({ type: 'info', message: 'Left the chat' });
        } else {
            addToast({ type: 'error', message: 'Failed to leave chat' });
        }

        return response;
    }, [leaveRoom, removeChatRoom, addToast]);

    const selectRoom = useCallback((roomId: string) => {
        setActiveRoom(roomId);
        joinRoom(roomId);
    }, [setActiveRoom, joinRoom]);

    const fetchMessages = useCallback(async (roomId: string) => {
        const response = await api.getChatMessages(roomId);

        if (response.success && response.data) {
            setMessages(roomId, response.data.items);
        }

        return response;
    }, [setMessages]);

    const sendChatMessage = useCallback((content: string) => {
        if (!activeRoomId || isRateLimited) return;
        sendMessage(activeRoomId, content);
    }, [activeRoomId, isRateLimited, sendMessage]);

    const setTyping = useCallback((isTyping: boolean) => {
        if (!activeRoomId) return;
        sendTypingStatus(activeRoomId, isTyping);
    }, [activeRoomId, sendTypingStatus]);

    const blockUser = useCallback(async (userId: string) => {
        const response = await api.blockUser(userId);

        if (response.success) {
            addToast({ type: 'success', message: 'User blocked' });
        } else {
            addToast({ type: 'error', message: 'Failed to block user' });
        }

        return response;
    }, [addToast]);

    const reportUser = useCallback(async (report: Report) => {
        const response = await api.reportUser(report);

        if (response.success) {
            addToast({ type: 'success', message: 'Report submitted. Thank you for helping keep EPHEXA safe.' });
        } else {
            addToast({ type: 'error', message: 'Failed to submit report' });
        }

        return response;
    }, [addToast]);

    // Get current room data
    const activeRoom = chatRooms.find((r) => r.id === activeRoomId);
    const activeMessages = activeRoomId ? messages[activeRoomId] || [] : [];
    const activeTypingUsers = activeRoomId ? typingUsers[activeRoomId] || [] : [];

    return {
        chatRooms,
        activeRoom,
        activeRoomId,
        activeMessages,
        activeTypingUsers,
        isLoading,
        isRateLimited,
        fetchChatRooms,
        createOrJoinChat,
        leaveChatRoom,
        selectRoom,
        fetchMessages,
        sendChatMessage,
        setTyping,
        blockUser,
        reportUser,
    };
}
