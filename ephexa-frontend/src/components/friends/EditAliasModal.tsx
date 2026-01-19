import { useState, useEffect, useRef } from 'react';
import { Button } from '../ui';

interface EditAliasModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentAlias: string | null;
    friendEmail?: string;
    friendId: string;
    onSave: (friendId: string, alias: string | null) => Promise<{ success: boolean; error?: string }>;
}

export function EditAliasModal({
    isOpen,
    onClose,
    currentAlias,
    friendEmail,
    friendId,
    onSave,
}: EditAliasModalProps) {
    const [alias, setAlias] = useState(currentAlias || '');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setAlias(currentAlias || '');
            setError(null);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen, currentAlias]);

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);

        const result = await onSave(friendId, alias.trim() || null);

        if (result.success) {
            onClose();
        } else {
            setError(result.error || 'Failed to save alias');
        }

        setIsSaving(false);
    };

    const handleClear = async () => {
        setAlias('');
        setIsSaving(true);
        const result = await onSave(friendId, null);
        if (!result.success) {
            setError(result.error || 'Failed to clear alias');
        } else {
            onClose();
        }
        setIsSaving(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-navy-dark border border-indigo/30 rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-100">
                        Edit Nickname
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <p className="text-sm text-gray-400">
                    Set a nickname for <span className="text-indigo-300">{friendEmail || 'this friend'}</span>.
                    This is only visible to you.
                </p>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                        Nickname
                    </label>
                    <input
                        ref={inputRef}
                        type="text"
                        value={alias}
                        onChange={(e) => setAlias(e.target.value)}
                        placeholder="Enter a nickname..."
                        maxLength={50}
                        className="w-full px-4 py-2 bg-navy border border-indigo/30 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo/60 transition-colors"
                    />
                    <p className="text-xs text-gray-500">
                        {alias.length}/50 characters
                    </p>
                </div>

                {error && (
                    <p className="text-sm text-red-400">{error}</p>
                )}

                <div className="flex gap-3 pt-2">
                    <Button
                        variant="secondary"
                        onClick={handleClear}
                        disabled={isSaving || !currentAlias}
                        className="flex-1"
                    >
                        Clear
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-1"
                    >
                        {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
