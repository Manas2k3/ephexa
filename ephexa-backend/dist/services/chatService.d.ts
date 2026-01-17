import type { CreateChatBody } from '../types';
export declare function getUserChats(userId: string): Promise<{
    id: string;
    name: string | null;
    interest: string;
    createdAt: string;
    participants: {
        id: string;
        displayName: string;
        isOnline: boolean;
        joinedAt: string;
    }[];
    lastMessage: {
        id: string;
        content: string;
        senderId: string;
        createdAt: string;
    } | undefined;
    unreadCount: number;
}[]>;
export declare function createOrJoinChat(userId: string, data: CreateChatBody): Promise<{
    id: string;
    name: string | null;
    interest: string;
    createdAt: string;
    participants: {
        id: string;
        displayName: string;
        isOnline: boolean;
        joinedAt: string;
    }[];
    unreadCount: number;
}>;
export declare function leaveChat(userId: string, roomId: string): Promise<void>;
export declare function getChatMessages(roomId: string, page?: number, limit?: number): Promise<{
    items: {
        id: string;
        content: string;
        senderId: string;
        senderName: string;
        chatRoomId: string;
        createdAt: string;
        status: "sent";
    }[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}>;
export declare function createMessage(roomId: string, senderId: string, content: string): Promise<{
    id: string;
    content: string;
    senderId: string;
    senderName: string;
    chatRoomId: string;
    createdAt: Date;
    status: "sent";
}>;
export declare function updateUserOnlineStatus(userId: string, roomId: string, isOnline: boolean): Promise<void>;
//# sourceMappingURL=chatService.d.ts.map