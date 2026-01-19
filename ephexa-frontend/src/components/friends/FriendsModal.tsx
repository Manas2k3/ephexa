import { FriendsList } from './FriendsList';
import type { Friend, FriendRequest } from '../../stores/friendStore';

interface FriendsModalProps {
    isOpen: boolean;
    onClose: () => void;
    friends: Friend[];
    pendingRequests: FriendRequest[];
    isLoading: boolean;
    onAcceptRequest: (requestId: string) => Promise<{ success: boolean; error?: string }>;
    onDeclineRequest: (requestId: string) => Promise<{ success: boolean; error?: string }>;
    onUpdateAlias: (friendId: string, alias: string | null) => Promise<{ success: boolean; error?: string }>;
    onRemoveFriend: (friendId: string) => Promise<{ success: boolean; error?: string }>;
}

export function FriendsModal({
    isOpen,
    onClose,
    friends,
    pendingRequests,
    isLoading,
    onAcceptRequest,
    onDeclineRequest,
    onUpdateAlias,
    onRemoveFriend,
}: FriendsModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-navy-dark border border-indigo/30 rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-indigo/30">
                    <h2 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
                        <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Friends
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    <FriendsList
                        friends={friends}
                        pendingRequests={pendingRequests}
                        isLoading={isLoading}
                        onAcceptRequest={onAcceptRequest}
                        onDeclineRequest={onDeclineRequest}
                        onUpdateAlias={onUpdateAlias}
                        onRemoveFriend={onRemoveFriend}
                    />
                </div>
            </div>
        </div>
    );
}
