import { useEffect, useCallback } from 'react';
import { useFriendStore } from '../stores/friendStore';
import { useAuthStore } from '../stores/authStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function useFriends() {
    const { token } = useAuthStore();
    const {
        friends,
        pendingRequests,
        sentRequests,
        isLoading,
        error,
        setFriends,
        removeFriend: removeFriendFromStore,
        updateFriendAlias: updateAliasInStore,
        setPendingRequests,
        removePendingRequest,
        setSentRequests,
        addSentRequest,
        setLoading,
        setError,
    } = useFriendStore();

    // Fetch all friends
    const fetchFriends = useCallback(async () => {
        if (!token) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE}/api/friends`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (data.success) {
                setFriends(data.data);
            } else {
                setError(data.error || 'Failed to fetch friends');
            }
        } catch (err) {
            setError('Failed to fetch friends');
        } finally {
            setLoading(false);
        }
    }, [token, setFriends, setLoading, setError]);

    // Fetch pending requests (received)
    const fetchPendingRequests = useCallback(async () => {
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE}/api/friends/requests`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (data.success) {
                setPendingRequests(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch pending requests:', err);
        }
    }, [token, setPendingRequests]);

    // Fetch sent requests
    const fetchSentRequests = useCallback(async () => {
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE}/api/friends/requests/sent`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (data.success) {
                setSentRequests(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch sent requests:', err);
        }
    }, [token, setSentRequests]);

    // Send friend request
    const sendFriendRequest = useCallback(async (
        receiverId: string,
        metVia: 'CHAT' | 'VIDEO_CALL',
        metRoomId?: string
    ) => {
        if (!token) return { success: false, error: 'Not authenticated' };

        try {
            const response = await fetch(`${API_BASE}/api/friends/request`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ receiverId, metVia, metRoomId }),
            });

            const data = await response.json();

            if (data.success) {
                // Add to sent requests
                addSentRequest({
                    id: data.data.id,
                    receiverId: data.data.receiverId,
                    status: 'PENDING',
                    metVia,
                    createdAt: data.data.createdAt,
                    receiver: data.data.receiver,
                });
                return { success: true };
            } else {
                return { success: false, error: data.error };
            }
        } catch (err) {
            return { success: false, error: 'Failed to send friend request' };
        }
    }, [token, addSentRequest]);

    // Accept friend request
    const acceptFriendRequest = useCallback(async (requestId: string) => {
        if (!token) return { success: false, error: 'Not authenticated' };

        try {
            const response = await fetch(`${API_BASE}/api/friends/request/${requestId}/respond`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: 'accept' }),
            });

            const data = await response.json();

            if (data.success) {
                removePendingRequest(requestId);
                // Refresh friends list to get the new friend
                await fetchFriends();
                return { success: true };
            } else {
                return { success: false, error: data.error };
            }
        } catch (err) {
            return { success: false, error: 'Failed to accept friend request' };
        }
    }, [token, removePendingRequest, fetchFriends]);

    // Decline friend request
    const declineFriendRequest = useCallback(async (requestId: string) => {
        if (!token) return { success: false, error: 'Not authenticated' };

        try {
            const response = await fetch(`${API_BASE}/api/friends/request/${requestId}/respond`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: 'decline' }),
            });

            const data = await response.json();

            if (data.success) {
                removePendingRequest(requestId);
                return { success: true };
            } else {
                return { success: false, error: data.error };
            }
        } catch (err) {
            return { success: false, error: 'Failed to decline friend request' };
        }
    }, [token, removePendingRequest]);

    // Update friend alias
    const updateFriendAlias = useCallback(async (friendId: string, alias: string | null) => {
        if (!token) return { success: false, error: 'Not authenticated' };

        try {
            const response = await fetch(`${API_BASE}/api/friends/${friendId}/alias`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ alias }),
            });

            const data = await response.json();

            if (data.success) {
                updateAliasInStore(friendId, alias);
                return { success: true };
            } else {
                return { success: false, error: data.error };
            }
        } catch (err) {
            return { success: false, error: 'Failed to update alias' };
        }
    }, [token, updateAliasInStore]);

    // Remove friend
    const removeFriend = useCallback(async (friendId: string) => {
        if (!token) return { success: false, error: 'Not authenticated' };

        try {
            const response = await fetch(`${API_BASE}/api/friends/${friendId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (data.success) {
                removeFriendFromStore(friendId);
                return { success: true };
            } else {
                return { success: false, error: data.error };
            }
        } catch (err) {
            return { success: false, error: 'Failed to remove friend' };
        }
    }, [token, removeFriendFromStore]);

    // Load initial data
    useEffect(() => {
        if (token) {
            fetchFriends();
            fetchPendingRequests();
            fetchSentRequests();
        }
    }, [token, fetchFriends, fetchPendingRequests, fetchSentRequests]);

    return {
        friends,
        pendingRequests,
        sentRequests,
        isLoading,
        error,
        fetchFriends,
        fetchPendingRequests,
        fetchSentRequests,
        sendFriendRequest,
        acceptFriendRequest,
        declineFriendRequest,
        updateFriendAlias,
        removeFriend,
    };
}
