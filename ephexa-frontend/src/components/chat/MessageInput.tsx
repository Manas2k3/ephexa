import { useState, useRef, useEffect, type KeyboardEvent, type ChangeEvent } from 'react';
import { useChatStore } from '../../stores/chatStore';

interface MessageInputProps {
    onSend: (content: string) => void;
    onTyping: (isTyping: boolean) => void;
    disabled?: boolean;
}

export function MessageInput({ onSend, onTyping, disabled = false }: MessageInputProps) {
    const [message, setMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { isRateLimited, rateLimitRetryAfter } = useChatStore();

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [message]);

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);

        // Handle typing indicator
        if (!isTyping) {
            setIsTyping(true);
            onTyping(true);
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to stop typing indicator
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            onTyping(false);
        }, 2000);
    };

    const handleSend = () => {
        const trimmedMessage = message.trim();
        if (!trimmedMessage || disabled || isRateLimited) return;

        onSend(trimmedMessage);
        setMessage('');
        setIsTyping(false);
        onTyping(false);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Focus back on textarea
        textareaRef.current?.focus();
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="p-4 border-t border-indigo/30 bg-navy-light">
            {/* Rate limit warning */}
            {isRateLimited && (
                <div className="mb-3 px-3 py-2 bg-warning/20 border border-warning/30 rounded-lg text-warning text-sm">
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Slow down! Wait {rateLimitRetryAfter} seconds before sending again.
                    </div>
                </div>
            )}

            <div className="flex items-end gap-3">
                <div className="flex-1 relative">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        disabled={disabled || isRateLimited}
                        rows={1}
                        className="
              w-full px-4 py-3 
              bg-indigo/30 border border-indigo/40 rounded-xl
              text-gray-100 placeholder-gray-400
              resize-none overflow-hidden
              transition-all duration-200
              focus:outline-none focus:border-sand focus:ring-1 focus:ring-sand/30
              disabled:opacity-50 disabled:cursor-not-allowed
            "
                    />
                </div>

                <button
                    onClick={handleSend}
                    disabled={!message.trim() || disabled || isRateLimited}
                    className="
            flex-shrink-0 p-3 rounded-xl
            bg-sand text-navy
            hover:bg-sand-light
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            active:scale-95
          "
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </button>
            </div>

            <p className="mt-2 text-xs text-gray-500 text-center">
                Press Enter to send, Shift+Enter for new line
            </p>
        </div>
    );
}
