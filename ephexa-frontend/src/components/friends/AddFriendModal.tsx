import { useState } from 'react';
import { Modal, Button } from '../ui';
import { useFriendStore } from '../../stores/friendStore';
import { useUIStore } from '../../stores/uiStore';

interface AddFriendModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AddFriendModal({ isOpen, onClose }: AddFriendModalProps) {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { sendFriendRequest } = useFriendStore();
    const { addToast } = useUIStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        setIsLoading(true);
        try {
            await sendFriendRequest(input.trim());
            addToast({ type: 'success', message: 'Friend request sent!' });
            onClose();
            setInput('');
        } catch (error) {
            addToast({ type: 'error', message: error instanceof Error ? error.message : 'Failed to send request' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Add Friend"
            size="sm"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm text-gray-400 mb-2">
                        Username or Email
                    </label>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Enter username or email"
                        className="w-full bg-navy border border-indigo/30 rounded-xl px-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo transition-colors"
                        autoFocus
                    />
                </div>

                <div className="flex gap-3 pt-2">
                    <Button
                        type="button"
                        variant="ghost"
                        fullWidth
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        fullWidth
                        isLoading={isLoading}
                        disabled={!input.trim()}
                    >
                        Send Request
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
