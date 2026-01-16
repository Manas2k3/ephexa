import type { Message } from '../../types';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';

interface MessageBubbleProps {
    message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
    const { user } = useAuthStore();
    const { openReportModal } = useUIStore();

    const isOwn = message.senderId === user?.id;

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const statusIcon = () => {
        switch (message.status) {
            case 'sending':
                return (
                    <svg className="w-3 h-3 text-gray-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <circle cx="12" cy="12" r="10" strokeWidth="2" strokeDasharray="32" strokeDashoffset="32">
                            <animate attributeName="stroke-dashoffset" dur="1s" repeatCount="indefinite" from="32" to="0" />
                        </circle>
                    </svg>
                );
            case 'sent':
                return (
                    <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                );
            case 'delivered':
                return (
                    <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7M5 13l4 4L19 7" />
                    </svg>
                );
            case 'read':
                return (
                    <svg className="w-3 h-3 text-sand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7M5 13l4 4L19 7" />
                    </svg>
                );
            default:
                return null;
        }
    };

    return (
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}>
            <div
                className={`
          max-w-[75%] rounded-2xl px-4 py-2.5
          ${isOwn
                        ? 'bg-sand text-navy rounded-br-md'
                        : 'bg-indigo/60 text-gray-100 rounded-bl-md'
                    }
        `}
            >
                {/* Sender name for other users */}
                {!isOwn && message.senderName && (
                    <p className="text-xs font-medium text-blush mb-1">
                        {message.senderName}
                    </p>
                )}

                {/* Message content */}
                <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                </p>

                {/* Timestamp and status */}
                <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <span className={`text-xs ${isOwn ? 'text-navy/60' : 'text-gray-400'}`}>
                        {formatTime(message.createdAt)}
                    </span>
                    {isOwn && statusIcon()}
                </div>
            </div>

            {/* Report button for other users' messages */}
            {!isOwn && (
                <button
                    onClick={() => openReportModal(message.senderId, message.id)}
                    className="opacity-0 group-hover:opacity-100 ml-2 p-1.5 text-gray-500 hover:text-blush transition-all"
                    title="Report message"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                    </svg>
                </button>
            )}
        </div>
    );
}
