import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { INTEREST_CATEGORIES, type InterestCategory } from '../../types';

interface NewChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectInterest: (interest: InterestCategory) => void;
    isLoading?: boolean;
}

export function NewChatModal({ isOpen, onClose, onSelectInterest, isLoading }: NewChatModalProps) {
    const [selectedInterest, setSelectedInterest] = useState<InterestCategory | null>(null);

    const handleJoin = () => {
        if (selectedInterest) {
            onSelectInterest(selectedInterest);
        }
    };

    const handleClose = () => {
        setSelectedInterest(null);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Start a New Chat" size="lg">
            <div className="space-y-4">
                <p className="text-gray-300 text-sm">
                    Choose a topic you're interested in to join or create a chat room with like-minded people.
                </p>

                {/* Interest Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                    {INTEREST_CATEGORIES.map((interest) => (
                        <button
                            key={interest}
                            onClick={() => setSelectedInterest(interest)}
                            className={`
                p-3 rounded-lg text-sm font-medium text-left
                transition-all duration-200
                ${selectedInterest === interest
                                    ? 'bg-sand text-navy'
                                    : 'bg-navy/50 text-gray-200 hover:bg-navy/70'
                                }
              `}
                        >
                            {interest}
                        </button>
                    ))}
                </div>

                {/* Selected Info */}
                {selectedInterest && (
                    <div className="p-3 bg-sand/10 border border-sand/20 rounded-lg">
                        <p className="text-sm text-gray-300">
                            You'll be matched with others interested in <span className="font-medium text-sand">{selectedInterest}</span>.
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                    <Button variant="ghost" onClick={handleClose} fullWidth>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleJoin}
                        disabled={!selectedInterest}
                        isLoading={isLoading}
                        fullWidth
                    >
                        Join Chat
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
