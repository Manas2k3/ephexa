import { useEffect, useState } from 'react';
import { Button } from '../ui';
import type { FriendRequest } from '../../stores/friendStore';

interface IncomingFriendRequestNotificationProps {
    request: FriendRequest;
    onAccept: (requestId: string) => Promise<{ success: boolean; error?: string }>;
    onDecline: (requestId: string) => Promise<{ success: boolean; error?: string }>;
    onDismiss: () => void;
}

export function IncomingFriendRequestNotification({
    request,
    onAccept,
    onDecline,
    onDismiss,
}: IncomingFriendRequestNotificationProps) {
    const [isProcessing, setIsProcessing] = useState(false);

    // Auto-dismiss after 30 seconds if no action taken
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss();
        }, 30000);

        return () => clearTimeout(timer);
    }, [onDismiss]);

    const handleAccept = async () => {
        setIsProcessing(true);
        const result = await onAccept(request.id);
        if (result.success) {
            onDismiss();
        }
        setIsProcessing(false);
    };

    const handleDecline = async () => {
        setIsProcessing(true);
        await onDecline(request.id);
        onDismiss();
        setIsProcessing(false);
    };

    const getMetViaIcon = () => {
        return request.metVia === 'VIDEO_CALL' ? '📹' : '💬';
    };

    return (
        <div className="fixed top-20 right-4 z-[70] bg-navy-dark border-2 border-indigo/50 rounded-xl shadow-2xl p-4 max-w-sm animate-slide-in-right">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{getMetViaIcon()}</span>
                    <h4 className="text-white font-semibold">Friend Request</h4>
                </div>
                <button
                    onClick={onDismiss}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                    disabled={isProcessing}
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Content */}
            <div className="mb-4">
                <p className="text-gray-200 text-sm">
                    <span className="text-indigo-300 font-medium">
                        {request.sender.email || 'Someone'}
                    </span>
                    {' '}wants to add you as a friend
                </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <Button
                    onClick={handleAccept}
                    disabled={isProcessing}
                    className="flex-1 text-sm py-2"
                >
                    {isProcessing ? 'Accepting...' : 'Accept'}
                </Button>
                <Button
                    variant="secondary"
                    onClick={handleDecline}
                    disabled={isProcessing}
                    className="flex-1 text-sm py-2"
                >
                    {isProcessing ? 'Declining...' : 'Decline'}
                </Button>
            </div>
        </div>
    );
}
