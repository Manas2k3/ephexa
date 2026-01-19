import { Button } from '../ui';

interface FriendRequestCardProps {
    request: {
        id: string;
        senderId: string;
        metVia: 'CHAT' | 'VIDEO_CALL';
        createdAt: string;
        sender: {
            id: string;
            email?: string;
        };
    };
    onAccept: (requestId: string) => Promise<{ success: boolean; error?: string }>;
    onDecline: (requestId: string) => Promise<{ success: boolean; error?: string }>;
}

export function FriendRequestCard({ request, onAccept, onDecline }: FriendRequestCardProps) {
    const handleAccept = async () => {
        await onAccept(request.id);
    };

    const handleDecline = async () => {
        await onDecline(request.id);
    };

    const getMetViaLabel = () => {
        return request.metVia === 'VIDEO_CALL' ? '📹 Video Call' : '💬 Chat';
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="bg-navy-dark/50 border border-indigo/30 rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    {/* Avatar placeholder */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo to-purple-600 flex items-center justify-center text-white font-semibold">
                        {request.sender.email?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                        <p className="text-gray-100 font-medium">
                            {request.sender.email || `User ${request.senderId.slice(0, 8)}`}
                        </p>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                            <span>Met via {getMetViaLabel()}</span>
                            <span className="text-gray-600">•</span>
                            <span>{formatDate(request.createdAt)}</span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex gap-2">
                <Button
                    onClick={handleAccept}
                    className="flex-1 text-sm"
                >
                    Accept
                </Button>
                <Button
                    variant="secondary"
                    onClick={handleDecline}
                    className="flex-1 text-sm"
                >
                    Decline
                </Button>
            </div>
        </div>
    );
}
