import { useNavigate } from 'react-router-dom';
import { useState, useCallback } from 'react';
import { Layout } from '../components/layout';
import { Button } from '../components/ui';
import { useWebRTC } from '../hooks/useWebRTC';
import { useSocket } from '../hooks/useSocket';
import { useChatStore } from '../stores/chatStore';
import { INTEREST_CATEGORIES } from '../types';

export function VideoCall() {
    const navigate = useNavigate();
    const [selectedInterest, setSelectedInterest] = useState<string | undefined>(undefined);
    const [endReason, setEndReason] = useState<string | null>(null);

    // Ensure socket is connected (useSocket establishes the connection)
    useSocket();
    const { isConnected } = useChatStore();
    const socketReady = isConnected;

    // Memoize the callback to prevent useWebRTC options from changing on every render
    const handleCallEndedCb = useCallback((reason: string) => {
        setEndReason(reason);
    }, []);

    const {
        callState,
        peerId,
        isAudioEnabled,
        isVideoEnabled,
        error,
        findCall,
        cancelFind,
        endCall,
        nextCall,
        toggleAudio,
        toggleVideo,
        setLocalVideoElement,
        setRemoteVideoElement,
    } = useWebRTC({
        onCallEnded: handleCallEndedCb,
    });

    const handleStartCall = useCallback(() => {
        setEndReason(null);
        findCall(selectedInterest);
    }, [findCall, selectedInterest]);

    const handleNextCall = useCallback(() => {
        setEndReason(null);
        nextCall(selectedInterest);
    }, [nextCall, selectedInterest]);

    const handleEndCall = useCallback(() => {
        endCall();
        setEndReason(null);
    }, [endCall]);

    const handleGoBack = useCallback(() => {
        if (callState !== 'idle' && callState !== 'ended') {
            endCall();
        }
        navigate('/dashboard');
    }, [callState, endCall, navigate]);

    return (
        <Layout hideFooter>
            <div className="h-[calc(100vh-4rem)] flex flex-col bg-navy">
                {/* Header */}
                <div className="px-6 py-4 border-b border-indigo/30 bg-navy-light flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleGoBack}
                            className="text-gray-400 hover:text-gray-200 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-100">Video Call</h1>
                            <p className="text-sm text-gray-400">
                                {callState === 'idle' && 'Start a random video call'}
                                {callState === 'searching' && 'Looking for a stranger...'}
                                {callState === 'connecting' && 'Connecting...'}
                                {callState === 'connected' && 'Connected to a stranger'}
                                {callState === 'ended' && 'Call ended'}
                            </p>
                        </div>
                    </div>

                    {/* Interest Selector */}
                    <div className="flex items-center gap-3">
                        <label className="text-sm text-gray-400">Interest:</label>
                        <select
                            value={selectedInterest || ''}
                            onChange={(e) => setSelectedInterest(e.target.value || undefined)}
                            disabled={callState !== 'idle' && callState !== 'ended'}
                            className="bg-navy-dark border border-indigo/30 rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-sand/50"
                        >
                            <option value="">Any</option>
                            {INTEREST_CATEGORIES.map((interest) => (
                                <option key={interest} value={interest}>
                                    {interest}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Main Video Area */}
                <div className="flex-1 flex flex-col md:flex-row gap-4 p-4 relative overflow-hidden">
                    {/* Remote Video (Large) */}
                    <div className="flex-1 relative bg-navy-dark rounded-2xl overflow-hidden flex items-center justify-center">
                        {callState === 'connected' ? (
                            <video
                                ref={setRemoteVideoElement}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="text-center p-8">
                                {callState === 'idle' && (
                                    <>
                                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-sand/20 to-blush/20 flex items-center justify-center">
                                            <svg className="w-12 h-12 text-sand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <h2 className="text-xl font-semibold text-gray-100 mb-2">Ready to Chat?</h2>
                                        <p className="text-gray-400 mb-4">Click start to match with a random stranger</p>
                                        {!socketReady && (
                                            <p className="text-yellow-400 text-sm mb-4">Connecting to server...</p>
                                        )}
                                        <Button size="lg" onClick={handleStartCall} disabled={!socketReady}>
                                            {socketReady ? 'Start Video Call' : 'Connecting...'}
                                        </Button>
                                    </>
                                )}

                                {callState === 'searching' && (
                                    <>
                                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-sand/20 to-blush/20 flex items-center justify-center animate-pulse">
                                            <svg className="w-12 h-12 text-sand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                        <h2 className="text-xl font-semibold text-gray-100 mb-2">Finding a stranger...</h2>
                                        <p className="text-gray-400 mb-6">Please wait while we find someone for you</p>
                                        <Button variant="secondary" onClick={cancelFind}>
                                            Cancel
                                        </Button>
                                    </>
                                )}

                                {callState === 'connecting' && (
                                    <>
                                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-sand/20 to-blush/20 flex items-center justify-center">
                                            <div className="w-8 h-8 border-4 border-sand border-t-transparent rounded-full animate-spin" />
                                        </div>
                                        <h2 className="text-xl font-semibold text-gray-100 mb-2">Connecting...</h2>
                                        <p className="text-gray-400">Establishing peer-to-peer connection</p>
                                    </>
                                )}

                                {callState === 'ended' && (
                                    <>
                                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500/20 to-red-600/20 flex items-center justify-center">
                                            <svg className="w-12 h-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
                                            </svg>
                                        </div>
                                        <h2 className="text-xl font-semibold text-gray-100 mb-2">Call Ended</h2>
                                        <p className="text-gray-400 mb-6">{endReason || 'The call has ended'}</p>
                                        <div className="flex gap-3 justify-center">
                                            <Button onClick={handleStartCall}>
                                                Find Another
                                            </Button>
                                            <Button variant="secondary" onClick={handleGoBack}>
                                                Back to Chat
                                            </Button>
                                        </div>
                                    </>
                                )}

                                {error && (
                                    <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                                        <p className="text-red-300 text-sm">{error}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Peer ID Badge (when connected) */}
                        {callState === 'connected' && peerId && (
                            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
                                <span className="text-sm text-gray-300">Stranger</span>
                            </div>
                        )}
                    </div>

                    {/* Local Video (Small, overlayed) */}
                    {(callState === 'searching' || callState === 'connecting' || callState === 'connected') && (
                        <div className="absolute bottom-20 right-8 w-48 h-36 md:w-56 md:h-42 bg-navy-dark rounded-xl overflow-hidden shadow-xl border border-indigo/30">
                            <video
                                ref={setLocalVideoElement}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover mirror"
                            />
                            <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5">
                                <span className="text-xs text-gray-300">You</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Control Bar */}
                {(callState === 'searching' || callState === 'connecting' || callState === 'connected') && (
                    <div className="px-6 py-4 border-t border-indigo/30 bg-navy-light">
                        <div className="flex items-center justify-center gap-4">
                            {/* Mute Button */}
                            <button
                                onClick={toggleAudio}
                                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isAudioEnabled
                                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                    : 'bg-red-500 hover:bg-red-600 text-white'
                                    }`}
                            >
                                {isAudioEnabled ? (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                    </svg>
                                )}
                            </button>

                            {/* Video Toggle Button */}
                            <button
                                onClick={toggleVideo}
                                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isVideoEnabled
                                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                    : 'bg-red-500 hover:bg-red-600 text-white'
                                    }`}
                            >
                                {isVideoEnabled ? (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                                    </svg>
                                )}
                            </button>

                            {/* End Call Button */}
                            <button
                                onClick={handleEndCall}
                                className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
                                </svg>
                            </button>

                            {/* Next Button (only when connected) */}
                            {callState === 'connected' && (
                                <button
                                    onClick={handleNextCall}
                                    className="w-14 h-14 rounded-full bg-sand hover:bg-sand-dark text-navy-dark flex items-center justify-center transition-all"
                                    title="Next stranger"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Mirror CSS for local video */}
            <style>{`
                .mirror {
                    transform: scaleX(-1);
                }
            `}</style>
        </Layout>
    );
}
