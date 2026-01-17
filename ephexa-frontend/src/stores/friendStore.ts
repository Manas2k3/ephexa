import { create } from 'zustand';
import { api } from '../services/api';
import type { Friend } from '../types';

interface FriendStore {
    friends: Friend[];
    isLoading: boolean;
    error: string | null;

    fetchFriends: () => Promise<void>;
    sendFriendRequest: (usernameOrEmail: string) => Promise<void>;
    respondToRequest: (requestId: string, accept: boolean) => Promise<void>;
    updateAlias: (friendId: string, alias: string) => Promise<void>;
    removeFriend: (friendId: string) => Promise<void>;
}

export const useFriendStore = create<FriendStore>((set, get) => ({
    friends: [],
    isLoading: false,
    error: null,

    fetchFriends: async () => {
        set({ isLoading: true, error: null });
        const response = await api.getFriends();
        if (response.success && response.data) {
            set({ friends: response.data, isLoading: false });
        } else {
            set({ error: response.error || 'Failed to fetch friends', isLoading: false });
        }
    },

    sendFriendRequest: async (usernameOrEmail: string) => {
        const response = await api.sendFriendRequest(usernameOrEmail);
        if (response.success) {
            await get().fetchFriends(); // Refresh list to show pending (if implementing outgoing)
        } else {
            throw new Error(response.error || 'Failed to send request');
        }
    },

    respondToRequest: async (requestId: string, accept: boolean) => {
        const response = await api.respondToFriendRequest(requestId, accept);
        if (response.success) {
            // Optimistic update or refresh
            await get().fetchFriends();
        } else {
            throw new Error(response.error || 'Failed to respond to request');
        }
    },

    updateAlias: async (friendId: string, alias: string) => {
        const response = await api.updateFriendAlias(friendId, alias);
        if (response.success) {
            set((state) => ({
                friends: state.friends.map((f) =>
                    f.friendId === friendId ? { ...f, alias } : f
                ),
            }));
        } else {
            throw new Error(response.error || 'Failed to update alias');
        }
    },

    removeFriend: async (friendId: string) => {
        const response = await api.removeFriend(friendId);
        if (response.success) {
            set((state) => ({
                friends: state.friends.filter((f) => f.friendId !== friendId),
            }));
        } else {
            throw new Error(response.error || 'Failed to remove friend');
        }
    },
}));
