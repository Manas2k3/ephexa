import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import type { ReportReason } from '../../types';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (reason: ReportReason, description?: string) => void;
    isLoading?: boolean;
}

const REPORT_REASONS: { value: ReportReason; label: string; description: string }[] = [
    { value: 'spam', label: 'Spam', description: 'Unwanted promotional content or repeated messages' },
    { value: 'harassment', label: 'Harassment', description: 'Bullying, threats, or abusive behavior' },
    { value: 'inappropriate_content', label: 'Inappropriate Content', description: 'Explicit, offensive, or illegal content' },
    { value: 'underage_user', label: 'Underage User', description: 'User appears to be under 18 years old' },
    { value: 'impersonation', label: 'Impersonation', description: 'Pretending to be someone else' },
    { value: 'other', label: 'Other', description: 'Something else not listed above' },
];

export function ReportModal({ isOpen, onClose, onSubmit, isLoading }: ReportModalProps) {
    const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
    const [description, setDescription] = useState('');

    const handleSubmit = () => {
        if (selectedReason) {
            onSubmit(selectedReason, description || undefined);
            handleClose();
        }
    };

    const handleClose = () => {
        setSelectedReason(null);
        setDescription('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Report User" size="md">
            <div className="space-y-4">
                <p className="text-gray-300 text-sm">
                    Help us keep EPHEXA safe. Your report is anonymous and will be reviewed by our moderation team.
                </p>

                {/* Report Reasons */}
                <div className="space-y-2">
                    {REPORT_REASONS.map((reason) => (
                        <button
                            key={reason.value}
                            onClick={() => setSelectedReason(reason.value)}
                            className={`
                w-full p-3 rounded-lg text-left
                transition-all duration-200
                ${selectedReason === reason.value
                                    ? 'bg-blush/20 border border-blush/40'
                                    : 'bg-navy/50 border border-transparent hover:bg-navy/70'
                                }
              `}
                        >
                            <p className="font-medium text-gray-100">{reason.label}</p>
                            <p className="text-sm text-gray-400 mt-0.5">{reason.description}</p>
                        </button>
                    ))}
                </div>

                {/* Additional Description */}
                {selectedReason && (
                    <div>
                        <label className="block text-sm font-medium text-gray-200 mb-1.5">
                            Additional details (optional)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Provide any additional context..."
                            rows={3}
                            className="
                w-full px-4 py-2.5 
                bg-navy-light border border-indigo/50 rounded-lg
                text-gray-100 placeholder-gray-400
                resize-none
                focus:outline-none focus:border-sand focus:ring-1 focus:ring-sand/50
              "
                        />
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                    <Button variant="ghost" onClick={handleClose} fullWidth>
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleSubmit}
                        disabled={!selectedReason}
                        isLoading={isLoading}
                        fullWidth
                    >
                        Submit Report
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
