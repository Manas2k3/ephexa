import { useState, useCallback, useEffect } from 'react';
import { Layout } from '../components/layout';
import { Button } from '../components/ui';
import { useSocket } from '../hooks/useSocket';
import { useChatStore } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';
import { INTEREST_CATEGORIES } from '../types';
import { ZegoCall } from './ZegoCall';
import { socketService } from '../services/socket';

export function VideoCall() {
    const [selectedInterest, setSelectedInterest] = useState<string | undefined>(undefined);
    const [isSearching, setIsSearching] = useState(false);
    const [callId, setCallId] = useState<string | null>(null);
    const { isConnected } = useChatStore();
    const { user } = useAuthStore();

    // Initial connection check
    useSocket();

    // Call finding logic
    const handleStartSearch = useCallback(() => {
        setIsSearching(true);
        socketService.findCall(selectedInterest);
    }, [selectedInterest]);

    const handleCancelSearch = useCallback(() => {
        setIsSearching(false);
        socketService.cancelFind();
    }, []);

    const handleEndCall = useCallback(() => {
        setCallId(null);
        socketService.endCall(); // Notify backend we left
        // Optionally restart search automatically or go back to idle
        setIsSearching(false);
    }, []);

    const handleNextCall = useCallback(() => {
        setCallId(null);
        // Small delay to ensure cleanup
        setTimeout(() => {
            setIsSearching(true);
            socketService.nextCall(selectedInterest);
        }, 100);
    }, [selectedInterest]);

    // Socket listeners for matching
    useEffect(() => {
        const handleCallFound = (data: { callId: string; peerId: string; isInitiator: boolean }) => {
            console.log('Call found:', data);
            setIsSearching(false);
            setCallId(data.callId);
        };

        const handleCallEnded = (data: { reason: string }) => {
            console.log('Peer ended call:', data.reason);
            // Zego handles the UI for ending, but we reset state here
            setCallId(null);
            setIsSearching(false);
        };

        socketService.onCallFound(handleCallFound);
        socketService.onCallEnded(handleCallEnded);

        return () => {
            socketService.offCallFound(handleCallFound);
            socketService.offCallEnded(handleCallEnded);
            // Ensure we leave the queue if we unmount
            socketService.cancelFind();
        };
    }, []);


    // Render Zego Call if active
    if (callId && user) {
        return (
            <div className="fixed inset-0 z-50 bg-black">
                <ZegoCall
                    roomId={callId}
                    userId={user.id}
                    userName={'Anonymous'}
                    onEndCall={handleEndCall}
                />

                {/* Overlay controls if needed, or rely on Zego UI */}
                <div className="absolute top-4 right-4 z-[60] flex gap-2">
                    <Button variant="secondary" onClick={handleNextCall}>
                        Skip & Next
                    </Button>
                    <Button variant="danger" onClick={handleEndCall}>
                        End Call
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <Layout>
            <div className="h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4 bg-gray-50">
                <div className="w-full max-w-lg space-y-8 text-center">
                    <div className="space-y-4">
                        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-4xl">📹</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {isSearching ? 'Finding connection...' : 'Start Random Video Call'}
                        </h1>
                        <p className="text-gray-500 text-lg">
                            {isSearching
                                ? 'Looking for someone to talk to...'
                                : 'Meet strangers from around the world in random 1-on-1 video chats.'}
                        </p>
                    </div>

                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100 space-y-6">
                        {/* Interest Selection */}
                        <div className="space-y-3 text-left">
                            <label className="text-sm font-medium text-gray-700 block">
                                Add Interests (Optional)
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {INTEREST_CATEGORIES.map((interest) => (
                                    <button
                                        key={interest}
                                        onClick={() => setSelectedInterest(
                                            selectedInterest === interest ? undefined : interest
                                        )}
                                        disabled={isSearching}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                                            ${selectedInterest === interest
                                                ? 'bg-indigo-600 text-white shadow-md transform scale-105'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            } ${isSearching ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {interest}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-4">
                            {!isConnected ? (
                                <Button className="w-full py-4 text-lg" disabled>
                                    Connecting to server...
                                </Button>
                            ) : isSearching ? (
                                <div className="space-y-4">
                                    <div className="flex justify-center py-8">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                                    </div>
                                    <Button
                                        variant="danger"
                                        className="w-full py-3"
                                        onClick={handleCancelSearch}
                                    >
                                        Cancel Search
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    className="w-full py-4 text-lg shadow-lg hover:shadow-xl transition-shadow"
                                    onClick={handleStartSearch}
                                >
                                    Start Video Call
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
