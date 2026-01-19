import { useState } from 'react';
import { FriendRequestCard } from './FriendRequestCard';
import { EditAliasModal } from './EditAliasModal';
import type { Friend, FriendRequest } from '../../stores/friendStore';

interface FriendsListProps {
    friends: Friend[];
    pendingRequests: FriendRequest[];
    isLoading: boolean;
    onAcceptRequest: (requestId: string) => Promise<{ success: boolean; error?: string }>;
    onDeclineRequest: (requestId: string) => Promise<{ success: boolean; error?: string }>;
    onUpdateAlias: (friendId: string, alias: string | null) => Promise<{ success: boolean; error?: string }>;
    onRemoveFriend: (friendId: string) => Promise<{ success: boolean; error?: string }>;
    onStartChat?: (friendId: string) => void;
}

export function FriendsList({
    friends,
    pendingRequests,
    isLoading,
    onAcceptRequest,
    onDeclineRequest,
    onUpdateAlias,
    onRemoveFriend,
    onStartChat,
}: FriendsListProps) {
    const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');
    const [editingFriend, setEditingFriend] = useState<Friend | null>(null);
    const [removingFriendId, setRemovingFriendId] = useState<string | null>(null);

    const handleRemoveFriend = async (friendId: string) => {
        if (removingFriendId) return;

        setRemovingFriendId(friendId);
        await onRemoveFriend(friendId);
        setRemovingFriendId(null);
    };

    const getDisplayName = (friend: Friend) => {
        return friend.alias || friend.friend.email || `User ${friend.friendId.slice(0, 8)}`;
    };

    const getMetViaIcon = (metVia: string) => {
        return metVia === 'VIDEO_CALL' ? '📹' : '💬';
    };

    if (isLoading && friends.length === 0 && pendingRequests.length === 0) {
        return (
            <div className="flex items-center justify-center h-48">
                <div className="w-8 h-8 border-2 border-sand border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Tabs */}
            <div className="flex border-b border-indigo/30">
                <button
                    onClick={() => setActiveTab('friends')}
                    className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'friends'
                        ? 'text-indigo-300 border-indigo-400'
                        : 'text-gray-400 border-transparent hover:text-gray-200'
                        }`}
                >
                    Friends ({friends.length})
                </button>
                <button
                    onClick={() => setActiveTab('requests')}
                    className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 relative ${activeTab === 'requests'
                        ? 'text-indigo-300 border-indigo-400'
                        : 'text-gray-400 border-transparent hover:text-gray-200'
                        }`}
                >
                    Requests
                    {pendingRequests.length > 0 && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-indigo/50 text-indigo-200 rounded-full">
                            {pendingRequests.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Content */}
            {activeTab === 'friends' ? (
                <div className="space-y-2">
                    {friends.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo/20 flex items-center justify-center">
                                <svg className="w-8 h-8 text-indigo/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <p className="text-gray-400">No friends yet</p>
                            <p className="text-sm text-gray-500 mt-1">
                                Add friends from video calls or chats!
                            </p>
                        </div>
                    ) : (
                        friends.map((friend) => (
                            <div
                                key={friend.id}
                                className="flex items-center justify-between p-3 bg-navy-dark/50 border border-indigo/20 rounded-lg hover:border-indigo/40 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    {/* Avatar */}
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo to-purple-600 flex items-center justify-center text-white font-semibold">
                                        {getDisplayName(friend)[0]?.toUpperCase() || '?'}
                                    </div>
                                    <div>
                                        <p className="text-gray-100 font-medium">
                                            {getDisplayName(friend)}
                                            {friend.alias && (
                                                <span className="ml-2 text-xs text-gray-500">
                                                    ({friend.friend.email || friend.friendId.slice(0, 8)})
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {getMetViaIcon(friend.metVia)} Met via {friend.metVia === 'VIDEO_CALL' ? 'video call' : 'chat'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1">
                                    {/* Edit Alias */}
                                    <button
                                        onClick={() => setEditingFriend(friend)}
                                        className="p-2 text-gray-400 hover:text-indigo-300 transition-colors"
                                        title="Edit nickname"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>

                                    {/* Start Chat (if callback provided) */}
                                    {onStartChat && (
                                        <button
                                            onClick={() => onStartChat(friend.friendId)}
                                            className="p-2 text-gray-400 hover:text-green-400 transition-colors"
                                            title="Start chat"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                        </button>
                                    )}

                                    {/* Remove Friend */}
                                    <button
                                        onClick={() => handleRemoveFriend(friend.friendId)}
                                        disabled={removingFriendId === friend.friendId}
                                        className="p-2 text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
                                        title="Remove friend"
                                    >
                                        {removingFriendId === friend.friendId ? (
                                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {pendingRequests.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo/20 flex items-center justify-center">
                                <svg className="w-8 h-8 text-indigo/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <p className="text-gray-400">No pending requests</p>
                        </div>
                    ) : (
                        pendingRequests.map((request) => (
                            <FriendRequestCard
                                key={request.id}
                                request={request}
                                onAccept={onAcceptRequest}
                                onDecline={onDeclineRequest}
                            />
                        ))
                    )}
                </div>
            )}

            {/* Edit Alias Modal */}
            <EditAliasModal
                isOpen={!!editingFriend}
                onClose={() => setEditingFriend(null)}
                currentAlias={editingFriend?.alias || null}
                friendEmail={editingFriend?.friend.email}
                friendId={editingFriend?.friendId || ''}
                onSave={onUpdateAlias}
            />
        </div>
    );
}
