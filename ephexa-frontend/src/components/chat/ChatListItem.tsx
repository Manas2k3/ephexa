import type { ChatRoom } from '../../types';

interface ChatListItemProps {
    room: ChatRoom;
    isActive: boolean;
    onClick: () => void;
}

export function ChatListItem({ room, isActive, onClick }: ChatListItemProps) {
    const onlineCount = room.participants.filter(p => p.isOnline).length;

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <button
            onClick={onClick}
            className={`
        w-full p-3 rounded-xl text-left transition-all duration-200
        ${isActive
                    ? 'bg-sand/20 border border-sand/30'
                    : 'bg-indigo/30 border border-transparent hover:bg-indigo/50'
                }
      `}
        >
            <div className="flex items-start justify-between gap-3">
                {/* Room Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-100 truncate">
                            {room.interest}
                        </h3>
                        {room.unreadCount > 0 && (
                            <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium bg-blush text-navy rounded-full">
                                {room.unreadCount > 99 ? '99+' : room.unreadCount}
                            </span>
                        )}
                    </div>

                    {/* Last Message Preview */}
                    {room.lastMessage && (
                        <p className="text-sm text-gray-400 truncate">
                            {room.lastMessage.content}
                        </p>
                    )}

                    {/* Meta Info */}
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${onlineCount > 0 ? 'bg-success' : 'bg-gray-500'}`} />
                            {onlineCount} online
                        </span>
                        <span>•</span>
                        <span>{room.participants.length} members</span>
                    </div>
                </div>

                {/* Timestamp */}
                {room.lastMessage && (
                    <span className="text-xs text-gray-500 flex-shrink-0">
                        {formatTime(room.lastMessage.createdAt)}
                    </span>
                )}
            </div>
        </button>
    );
}
