import { create } from 'zustand';

export interface Friend {
    id: string;
    friendId: string;
    alias?: string | null;
    metVia: 'CHAT' | 'VIDEO_CALL';
    createdAt: string;
    updatedAt: string;
    friend: {
        id: string;
        email?: string;
    };
}

export interface FriendRequest {
    id: string;
    senderId: string;
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
    metVia: 'CHAT' | 'VIDEO_CALL';
    createdAt: string;
    sender: {
        id: string;
        email?: string;
    };
}

export interface SentFriendRequest {
    id: string;
    receiverId: string;
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
    metVia: 'CHAT' | 'VIDEO_CALL';
    createdAt: string;
    receiver: {
        id: string;
        email?: string;
    };
}

interface FriendStore {
    // State
    friends: Friend[];
    pendingRequests: FriendRequest[];
    sentRequests: SentFriendRequest[];
    isLoading: boolean;
    error: string | null;

    // Actions
    setFriends: (friends: Friend[]) => void;
    addFriend: (friend: Friend) => void;
    removeFriend: (friendId: string) => void;
    updateFriendAlias: (friendId: string, alias: string | null) => void;

    setPendingRequests: (requests: FriendRequest[]) => void;
    addPendingRequest: (request: FriendRequest) => void;
    removePendingRequest: (requestId: string) => void;

    setSentRequests: (requests: SentFriendRequest[]) => void;
    addSentRequest: (request: SentFriendRequest) => void;
    removeSentRequest: (requestId: string) => void;

    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    reset: () => void;
}

const initialState = {
    friends: [],
    pendingRequests: [],
    sentRequests: [],
    isLoading: false,
    error: null,
};

export const useFriendStore = create<FriendStore>((set) => ({
    ...initialState,

    setFriends: (friends) => set({ friends }),

    addFriend: (friend) =>
        set((state) => ({
            friends: [friend, ...state.friends],
        })),

    removeFriend: (friendId) =>
        set((state) => ({
            friends: state.friends.filter((f) => f.friendId !== friendId),
        })),

    updateFriendAlias: (friendId, alias) =>
        set((state) => ({
            friends: state.friends.map((f) =>
                f.friendId === friendId ? { ...f, alias } : f
            ),
        })),

    setPendingRequests: (requests) => set({ pendingRequests: requests }),

    addPendingRequest: (request) =>
        set((state) => ({
            pendingRequests: [request, ...state.pendingRequests],
        })),

    removePendingRequest: (requestId) =>
        set((state) => ({
            pendingRequests: state.pendingRequests.filter((r) => r.id !== requestId),
        })),

    setSentRequests: (requests) => set({ sentRequests: requests }),

    addSentRequest: (request) =>
        set((state) => ({
            sentRequests: [request, ...state.sentRequests],
        })),

    removeSentRequest: (requestId) =>
        set((state) => ({
            sentRequests: state.sentRequests.filter((r) => r.id !== requestId),
        })),

    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    reset: () => set(initialState),
}));
