import { useState } from 'react';
import { Layout } from '../components/layout';
import { Button, Modal } from '../components/ui';
import { useAuth } from '../hooks/useAuth';

export function Settings() {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Username edit state
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const { user, logout, deleteAccount, updateProfile } = useAuth();

    const handleLogout = () => {
        logout();
    };

    const handleUpdateUsername = async () => {
        if (!newUsername.trim()) return;
        setIsUpdating(true);
        const success = await updateProfile({ username: newUsername });
        setIsUpdating(false);
        if (success) {
            setIsEditingUsername(false);
        }
    };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        await deleteAccount();
        setIsDeleting(false);
    };

    return (
        <Layout>
            <div className="max-w-2xl mx-auto px-4 py-12">
                <h1 className="text-3xl font-bold text-gray-100 mb-8">Settings</h1>

                {/* Profile Section */}
                <section className="bg-indigo/20 border border-indigo/30 rounded-2xl p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-100 mb-4">Profile</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Email</label>
                            <p className="text-gray-100">{user?.email || 'Not available'}</p>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Username</label>
                            {isEditingUsername ? (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newUsername}
                                        onChange={(e) => setNewUsername(e.target.value)}
                                        className="bg-navy border border-indigo/30 rounded-lg px-3 py-1 text-gray-100 focus:outline-none focus:border-indigo"
                                        placeholder="Enter username"
                                    />
                                    <Button size="sm" onClick={handleUpdateUsername} isLoading={isUpdating}>
                                        Save
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => setIsEditingUsername(false)}>
                                        Cancel
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <p className="text-gray-100">{user?.username || 'Not set'}</p>
                                    <button
                                        onClick={() => {
                                            setNewUsername(user?.username || '');
                                            setIsEditingUsername(true);
                                        }}
                                        className="text-xs text-indigo hover:text-indigo-light"
                                    >
                                        Edit
                                    </button>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Member Since</label>
                            <p className="text-gray-100">
                                {user?.createdAt
                                    ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })
                                    : 'Not available'
                                }
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Age Verification</label>
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${user?.isAdult ? 'bg-success' : 'bg-error'}`} />
                                <span className="text-gray-100">
                                    {user?.isAdult ? 'Verified (18+)' : 'Not verified'}
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Privacy Note */}
                <section className="bg-sand/10 border border-sand/20 rounded-2xl p-6 mb-6">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-sand/20 flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-sand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-medium text-sand mb-1">Your Privacy Matters</h3>
                            <p className="text-sm text-gray-300">
                                We only display non-identifiable profile information. Your real name,
                                phone number, and location are never shown to other users. Messages
                                are automatically deleted after your session ends.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Account Actions */}
                <section className="bg-indigo/20 border border-indigo/30 rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-gray-100 mb-4">Account</h2>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-navy/50 rounded-xl">
                            <div>
                                <p className="font-medium text-gray-100">Log Out</p>
                                <p className="text-sm text-gray-400">Sign out of your account</p>
                            </div>
                            <Button variant="secondary" onClick={handleLogout}>
                                Log Out
                            </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-error/10 border border-error/20 rounded-xl">
                            <div>
                                <p className="font-medium text-gray-100">Delete Account</p>
                                <p className="text-sm text-gray-400">Permanently delete your account and data</p>
                            </div>
                            <Button variant="danger" onClick={() => setIsDeleteModalOpen(true)}>
                                Delete
                            </Button>
                        </div>
                    </div>
                </section>
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Account"
                size="sm"
            >
                <div className="space-y-4">
                    <div className="p-4 bg-error/10 border border-error/20 rounded-xl">
                        <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-error flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div>
                                <p className="font-medium text-error">This action cannot be undone</p>
                                <p className="text-sm text-gray-300 mt-1">
                                    All your data, including chat history and account information,
                                    will be permanently deleted.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="ghost"
                            fullWidth
                            onClick={() => setIsDeleteModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            fullWidth
                            isLoading={isDeleting}
                            onClick={handleDeleteAccount}
                        >
                            Delete Account
                        </Button>
                    </div>
                </div>
            </Modal>
        </Layout>
    );
}
