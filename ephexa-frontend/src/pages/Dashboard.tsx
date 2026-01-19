import { useState, useEffect, useRef } from 'react';
import { Layout } from '../components/layout';
import { Button } from '../components/ui';
import { ChatListItem, MessageBubble, MessageInput, TypingIndicator, NewChatModal, ReportModal } from '../components/chat';
import { FriendsModal } from '../components/friends';
import { useChat } from '../hooks/useChat';
import { useFriends } from '../hooks/useFriends';
import { useUIStore } from '../stores/uiStore';
import { useChatStore } from '../stores/chatStore';
import type { ReportReason } from '../types';

export function Dashboard() {
    const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
    const [isFriendsModalOpen, setIsFriendsModalOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const {
        chatRooms,
        activeRoom,
        activeRoomId,
        activeMessages,
        activeTypingUsers,
        isLoading,
        createOrJoinChat,
        leaveChatRoom,
        selectRoom,
        sendChatMessage,
        setTyping,
        reportUser,
    } = useChat();

    const {
        isReportModalOpen,
        reportTargetUserId,
        reportTargetMessageId,
        closeReportModal
    } = useUIStore();

    const { isConnected } = useChatStore();

    const {
        friends,
        pendingRequests,
        isLoading: isFriendsLoading,
        acceptFriendRequest,
        declineFriendRequest,
        updateFriendAlias,
        removeFriend,
    } = useFriends();

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeMessages]);

    const handleReportSubmit = async (reason: ReportReason, description?: string) => {
        if (!reportTargetUserId) return;

        await reportUser({
            reportedUserId: reportTargetUserId,
            reason,
            messageId: reportTargetMessageId || undefined,
            description,
        });
    };

    return (
        <Layout hideFooter>
            <div className="h-[calc(100vh-4rem)] flex flex-row relative overflow-hidden">
                {/* Sidebar - Chat List */}
                <aside className={`
                    w-full md:w-80 bg-navy-dark border-r border-indigo/30 flex flex-col z-10
                    ${activeRoomId ? 'hidden md:flex' : 'flex'}
                `}>
                    {/* Sidebar Header */}
                    <div className="p-4 border-b border-indigo/30">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-semibold text-gray-100">Chats</h2>
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success' : 'bg-gray-400'}`} />
                                <span className="text-xs text-gray-400">
                                    {isConnected ? 'Online' : 'Offline'}
                                </span>
                            </div>
                        </div>
                        <Button
                            fullWidth
                            onClick={() => setIsNewChatModalOpen(true)}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            New Chat
                        </Button>
                        <Button
                            fullWidth
                            variant="secondary"
                            onClick={() => window.location.href = '/call'}
                            className="mt-2"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Video Call
                        </Button>
                        <Button
                            fullWidth
                            variant="ghost"
                            onClick={() => setIsFriendsModalOpen(true)}
                            className="mt-2 relative"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Friends
                            {pendingRequests.length > 0 && (
                                <span className="absolute top-1 right-3 w-5 h-5 bg-indigo-500 text-white text-xs rounded-full flex items-center justify-center">
                                    {pendingRequests.length}
                                </span>
                            )}
                        </Button>
                    </div>

                    {/* Chat List */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        {isLoading && chatRooms.length === 0 ? (
                            <div className="flex items-center justify-center h-32">
                                <div className="animate-spin w-6 h-6 border-2 border-sand border-t-transparent rounded-full" />
                            </div>
                        ) : chatRooms.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo/30 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-indigo" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <p className="text-gray-400">No chats yet</p>
                                <p className="text-sm text-gray-500">Start a new conversation!</p>
                            </div>
                        ) : (
                            chatRooms.map(room => (
                                <ChatListItem
                                    key={room.id}
                                    room={room}
                                    isActive={activeRoom?.id === room.id}
                                    onClick={() => selectRoom(room.id)}
                                />
                            ))
                        )}
                    </div>
                </aside>

                {/* Main Chat Area */}
                <main className={`
                    flex-1 flex flex-col bg-navy relative z-0
                    ${activeRoomId ? 'flex' : 'hidden md:flex'}
                `}>
                    {!activeRoom ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
                            <div className="w-24 h-24 mb-6 rounded-3xl bg-indigo/10 flex items-center justify-center">
                                <svg className="w-12 h-12 text-indigo" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-200 mb-2">Select a Conversation</h3>
                            <p className="max-w-xs text-center">Choose a chat from the sidebar or start a new one to begin messaging.</p>
                        </div>
                    ) : (
                        <>
                            {/* Chat Header */}
                            <div className="h-16 px-4 md:px-6 border-b border-indigo/30 flex items-center justify-between bg-navy-dark/50 backdrop-blur-sm">
                                <div className="flex items-center gap-3">
                                    {/* Mobile Back Button */}
                                    <button
                                        onClick={() => selectRoom(null as any)}
                                        className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>

                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-100 line-clamp-1">
                                            {activeRoom.name || activeRoom.participants.find(p => p.id !== 'current-user-id')?.displayName || 'Chat'}
                                        </h3>
                                        <p className="text-xs text-indigo-300">
                                            {activeRoom.interest ? `${activeRoom.interest} Interest` : 'Direct Message'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => leaveChatRoom(activeRoom.id)}
                                        className="p-2 text-gray-400 hover:text-warning transition-colors"
                                        title="Leave Chat"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {activeMessages.map((message) => {
                                    return (
                                        <MessageBubble
                                            key={message.id}
                                            message={message}
                                        />
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Typing Indicators */}
                            {activeTypingUsers.length > 0 && (
                                <div className="px-6 py-2">
                                    <TypingIndicator typingUsers={activeTypingUsers} />
                                </div>
                            )}

                            {/* Input Area */}
                            <div className="p-4 border-t border-indigo/30 bg-navy-dark/30">
                                <MessageInput
                                    onSend={(content) => sendChatMessage(content)}
                                    onTyping={(isTyping) => setTyping(isTyping)}
                                    disabled={false}
                                />
                            </div>
                        </>
                    )}
                </main>
            </div>

            <NewChatModal
                isOpen={isNewChatModalOpen}
                onClose={() => setIsNewChatModalOpen(false)}
                onSelectInterest={(interest) => {
                    createOrJoinChat(interest);
                    setIsNewChatModalOpen(false); // Close on selection
                }}
                isLoading={isLoading}
            />

            <ReportModal
                isOpen={isReportModalOpen}
                onClose={closeReportModal}
                onSubmit={handleReportSubmit}
            />

            <FriendsModal
                isOpen={isFriendsModalOpen}
                onClose={() => setIsFriendsModalOpen(false)}
                friends={friends}
                pendingRequests={pendingRequests}
                isLoading={isFriendsLoading}
                onAcceptRequest={acceptFriendRequest}
                onDeclineRequest={declineFriendRequest}
                onUpdateAlias={updateFriendAlias}
                onRemoveFriend={removeFriend}
            />
        </Layout>
    );
}
