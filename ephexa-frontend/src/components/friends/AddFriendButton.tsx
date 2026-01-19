import { useState } from 'react';
import { Button } from '../ui';

interface AddFriendButtonProps {
    peerId: string;
    metVia: 'CHAT' | 'VIDEO_CALL';
    metRoomId?: string;
    onSendRequest: (receiverId: string, metVia: 'CHAT' | 'VIDEO_CALL', metRoomId?: string) => Promise<{ success: boolean; error?: string }>;
    className?: string;
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md';
}

export function AddFriendButton({
    peerId,
    metVia,
    metRoomId,
    onSendRequest,
    className = '',
    variant = 'secondary',
    size = 'sm',
}: AddFriendButtonProps) {
    const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleClick = async () => {
        if (status === 'sent' || status === 'loading') return;

        setStatus('loading');
        setErrorMessage(null);

        const result = await onSendRequest(peerId, metVia, metRoomId);

        if (result.success) {
            setStatus('sent');
        } else {
            setStatus('error');
            setErrorMessage(result.error || 'Failed to send request');
            // Reset to idle after a delay
            setTimeout(() => {
                setStatus('idle');
                setErrorMessage(null);
            }, 3000);
        }
    };

    const getButtonContent = () => {
        switch (status) {
            case 'loading':
                return (
                    <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span>Sending...</span>
                    </>
                );
            case 'sent':
                return (
                    <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Request Sent</span>
                    </>
                );
            case 'error':
                return (
                    <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span>{errorMessage || 'Error'}</span>
                    </>
                );
            default:
                return (
                    <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        <span>Add Friend</span>
                    </>
                );
        }
    };

    return (
        <Button
            variant={status === 'sent' ? 'secondary' : status === 'error' ? 'danger' : variant}
            onClick={handleClick}
            disabled={status === 'sent' || status === 'loading'}
            className={`flex items-center gap-2 ${size === 'sm' ? 'text-sm px-3 py-1.5' : 'px-4 py-2'} ${className}`}
        >
            {getButtonContent()}
        </Button>
    );
}
