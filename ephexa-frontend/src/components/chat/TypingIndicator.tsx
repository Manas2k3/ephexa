import type { TypingIndicator as TypingIndicatorType } from '../../types';

interface TypingIndicatorProps {
    typingUsers: TypingIndicatorType[];
}

export function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
    if (typingUsers.length === 0) return null;

    const getText = () => {
        if (typingUsers.length === 1) {
            return 'Someone is typing';
        }
        if (typingUsers.length === 2) {
            return '2 people are typing';
        }
        return `${typingUsers.length} people are typing`;
    };

    return (
        <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400">
            <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-sand rounded-full typing-dot" />
                <span className="w-1.5 h-1.5 bg-sand rounded-full typing-dot" />
                <span className="w-1.5 h-1.5 bg-sand rounded-full typing-dot" />
            </div>
            <span>{getText()}</span>
        </div>
    );
}
