import { useEffect, useState } from 'react';
import { useFriendStore } from '../../stores/friendStore';

import { useUIStore } from '../../stores/uiStore';
import { Button } from '../ui';
import { AddFriendModal } from './AddFriendModal';


export function FriendsList() {

    const { friends, fetchFriends, respondToRequest, isLoading, error } = useFriendStore();

    const { addToast } = useUIStore();

    // UI State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [filter] = useState<'all' | 'online' | 'pending'>('online');

    useEffect(() => {
        fetchFriends();
    }, [fetchFriends]);

    const pendingRequests = friends.filter(f => f.isIncoming);
    const myFriends = friends.filter(f => f.status === 'ACCEPTED');

    // Filter display friends
    const displayFriends = myFriends.filter(_f => {
        if (filter === 'online') {
            // Note: checking online status might require more realtime logic (socket)
            // For now assume "status" prop is friendship status, not online status
            // We need a way to check online status. UserProfile has it.
            // But Friend interface I defined also has isOnline? No, I defined `isAdult` but not `isOnline` explicitly in types?
            // Wait, I checked types earlier. Friend interface did NOT have isOnline.
            // Let's omit online filter logic for now or rely on separate store/data if available.
            return true;
        }
        return true;
    });

    const handleAccept = async (id: string) => {
        try {
            await respondToRequest(id, true);
            addToast({ type: 'success', message: 'Friend request accepted' });
        } catch (e) {
            addToast({ type: 'error', message: 'Failed to accept' });
        }
    };

    const handleReject = async (id: string) => {
        try {
            await respondToRequest(id, false);
        } catch (e) {
            addToast({ type: 'error', message: 'Failed to reject' });
        }
    };

    const handleMessage = async (_friendId: string) => {
        // Logic to jump to chat with friend
        // This is complex if we don't have a direct "start chat with user" API.
        // Current chat model is "Rooms" based on interest.
        // For Direct Messages (DM), we likely need a new Chat Room type or find existing DM room.
        // I will implement a placeholder "Start DM" alert for now or try to match.
        // Assuming we can create a private room or similar.
        addToast({ type: 'info', message: 'Direct messaging coming soon!' });
    };

    if (isLoading && friends.length === 0) {
        return <div className="p-8 text-center text-gray-400">Loading friends...</div>;
    }

    if (error) {
        return (
            <div className="p-8 text-center">
                <p className="text-error mb-4">{error}</p>
                <Button onClick={() => fetchFriends()}>Retry</Button>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-navy-dark">
            {/* Header */}
            <div className="p-4 border-b border-indigo/20 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-100">Friends</h2>
                <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
                    Add Friend
                </Button>
            </div>

            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
                <div className="p-4 border-b border-indigo/20 bg-indigo/10">
                    <h3 className="text-sm font-medium text-indigo mb-3">Pending Requests — {pendingRequests.length}</h3>
                    <div className="space-y-3">
                        {pendingRequests.map(req => (
                            <div key={req.id} className="flex items-center justify-between bg-navy p-3 rounded-xl border border-indigo/30">
                                <div>
                                    <p className="font-medium text-gray-100">{req.username || req.email}</p>
                                    <p className="text-xs text-gray-400">wants to be friends</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={() => handleAccept(req.id)}>Accept</Button>
                                    <Button size="sm" variant="ghost" onClick={() => handleReject(req.id)}>Decline</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Friends List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {displayFriends.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        No friends yet. Add someone!
                    </div>
                ) : (
                    displayFriends.map(friend => (
                        <div key={friend.id} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors cursor-pointer group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo to-purple-600 flex items-center justify-center text-white font-medium">
                                    {(friend.alias || friend.username || friend.email || '?')[0].toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-200">
                                        {friend.alias || friend.username || friend.email}
                                        {friend.alias && <span className="text-xs text-gray-500 ml-2">({friend.username})</span>}
                                    </p>
                                    <p className="text-xs text-gray-500">{friend.isAdult ? 'Adult Base' : 'User'}</p>
                                </div>
                            </div>

                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button size="sm" variant="ghost" onClick={() => handleMessage(friend.friendId)}>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <AddFriendModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
        </div>
    );
}
