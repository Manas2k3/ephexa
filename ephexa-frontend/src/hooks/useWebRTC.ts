import { useState, useEffect, useRef, useCallback } from 'react';
import { socketService } from '../services/socket';
import type { CallState, CallFoundPayload } from '../types';

// ICE Server configuration (STUN/TURN) - using free servers
const iceServers: RTCConfiguration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' },
    ],
};

interface UseWebRTCOptions {
    onCallEnded?: (reason: string) => void;
    onError?: (error: string) => void;
}

export function useWebRTC(options: UseWebRTCOptions = {}) {
    const [callState, setCallState] = useState<CallState>('idle');
    const [callId, setCallId] = useState<string | null>(null);
    const [peerId, setPeerId] = useState<string | null>(null);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Refs for WebRTC
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const localStream = useRef<MediaStream | null>(null);
    const remoteStream = useRef<MediaStream | null>(null);
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
    const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);
    const isInitiator = useRef(false);

    // Cleanup function
    const cleanup = useCallback(() => {
        // Close peer connection
        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }

        // Stop local stream tracks
        if (localStream.current) {
            localStream.current.getTracks().forEach(track => track.stop());
            localStream.current = null;
        }

        // Clear remote stream
        remoteStream.current = null;

        // Clear pending candidates
        pendingCandidates.current = [];

        // Reset state
        setCallId(null);
        setPeerId(null);
        setError(null);
    }, []);

    // Get local media stream
    const getLocalStream = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
            localStream.current = stream;

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            return stream;
        } catch (err) {
            const errorMessage = 'Failed to access camera/microphone. Please grant permissions.';
            setError(errorMessage);
            options.onError?.(errorMessage);
            throw err;
        }
    }, [options]);

    // Create RTCPeerConnection
    const createPeerConnection = useCallback(async () => {
        const pc = new RTCPeerConnection(iceServers);
        peerConnection.current = pc;

        // Create remote stream container
        remoteStream.current = new MediaStream();
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream.current;
        }

        // Add local tracks to connection
        if (localStream.current) {
            localStream.current.getTracks().forEach(track => {
                pc.addTrack(track, localStream.current!);
            });
        }

        // Handle incoming tracks
        pc.ontrack = (event) => {
            event.streams[0].getTracks().forEach(track => {
                remoteStream.current?.addTrack(track);
            });
        };

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                const candidateInit = event.candidate.toJSON();
                socketService.sendIceCandidate({
                    candidate: candidateInit.candidate || '',
                    sdpMLineIndex: candidateInit.sdpMLineIndex,
                    sdpMid: candidateInit.sdpMid,
                });
            }
        };

        // Handle connection state
        pc.onconnectionstatechange = () => {
            console.log('Connection state:', pc.connectionState);
            if (pc.connectionState === 'connected') {
                setCallState('connected');
            } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
                setError('Connection lost');
                setCallState('ended');
            }
        };

        // Handle ICE connection state
        pc.oniceconnectionstatechange = () => {
            console.log('ICE state:', pc.iceConnectionState);
        };

        // Process any pending ICE candidates
        for (const candidate of pendingCandidates.current) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
        pendingCandidates.current = [];

        return pc;
    }, []);

    // Create and send offer (initiator only)
    const createOffer = useCallback(async () => {
        console.log('createOffer called, peerConnection:', !!peerConnection.current);
        if (!peerConnection.current) {
            console.error('No peer connection when trying to create offer!');
            return;
        }

        try {
            console.log('Creating WebRTC offer...');
            const offer = await peerConnection.current.createOffer();
            console.log('Offer created, setting local description...');
            await peerConnection.current.setLocalDescription(offer);
            console.log('Local description set, sending offer via socket...');
            socketService.sendOffer({ type: 'offer', sdp: offer.sdp! });
            console.log('Offer sent to peer via signaling server');
        } catch (err) {
            console.error('Error creating offer:', err);
            setError('Failed to create connection');
        }
    }, []);

    // Handle incoming offer
    const handleOffer = useCallback(async (sdp: RTCSessionDescriptionInit) => {
        console.log('handleOffer called, peerConnection:', !!peerConnection.current);
        if (!peerConnection.current) {
            console.log('No peer connection, getting local stream...');
            await getLocalStream();
            await createPeerConnection();
        }

        try {
            console.log('Setting remote description (offer)...');
            await peerConnection.current!.setRemoteDescription(new RTCSessionDescription(sdp));
            console.log('Creating answer...');
            const answer = await peerConnection.current!.createAnswer();
            console.log('Setting local description (answer)...');
            await peerConnection.current!.setLocalDescription(answer);
            console.log('Sending answer via socket...');
            socketService.sendAnswer({ type: 'answer', sdp: answer.sdp! });
            console.log('Answer sent to peer');
        } catch (err) {
            console.error('Error handling offer:', err);
            setError('Failed to connect');
        }
    }, [getLocalStream, createPeerConnection]);

    // Handle incoming answer
    const handleAnswer = useCallback(async (sdp: RTCSessionDescriptionInit) => {
        if (!peerConnection.current) return;

        try {
            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(sdp));
        } catch (err) {
            console.error('Error handling answer:', err);
        }
    }, []);

    // Handle incoming ICE candidate
    const handleIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
        if (!peerConnection.current || !peerConnection.current.remoteDescription) {
            // Queue candidate if we don't have remote description yet
            pendingCandidates.current.push(candidate);
            return;
        }

        try {
            await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
            console.error('Error adding ICE candidate:', err);
        }
    }, []);

    // Start searching for a call
    const findCall = useCallback(async (interest?: string) => {
        cleanup();
        setCallState('searching');

        try {
            await getLocalStream();
        } catch {
            setCallState('idle');
            return;
        }

        socketService.findCall(interest);
    }, [cleanup, getLocalStream]);

    // Cancel searching
    const cancelFind = useCallback(() => {
        socketService.cancelFind();
        cleanup();
        setCallState('idle');
    }, [cleanup]);

    // End current call
    const endCall = useCallback(() => {
        socketService.endCall();
        cleanup();
        setCallState('ended');
        options.onCallEnded?.('You ended the call');
    }, [cleanup, options]);

    // Skip to next stranger
    const nextCall = useCallback(async (interest?: string) => {
        cleanup();
        setCallState('searching');

        try {
            await getLocalStream();
        } catch {
            setCallState('idle');
            return;
        }

        socketService.nextCall(interest);
    }, [cleanup, getLocalStream]);

    // Toggle audio
    const toggleAudio = useCallback(() => {
        if (localStream.current) {
            const audioTrack = localStream.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsAudioEnabled(audioTrack.enabled);
            }
        }
    }, []);

    // Toggle video
    const toggleVideo = useCallback(() => {
        if (localStream.current) {
            const videoTrack = localStream.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoEnabled(videoTrack.enabled);
            }
        }
    }, []);

    // Set video refs
    const setLocalVideoElement = useCallback((element: HTMLVideoElement | null) => {
        localVideoRef.current = element;
        if (element && localStream.current) {
            element.srcObject = localStream.current;
        }
    }, []);

    const setRemoteVideoElement = useCallback((element: HTMLVideoElement | null) => {
        remoteVideoRef.current = element;
        if (element && remoteStream.current) {
            element.srcObject = remoteStream.current;
        }
    }, []);

    // Socket event handlers
    useEffect(() => {
        // Handle match found
        const handleCallFound = async (data: CallFoundPayload) => {
            console.log('Call found:', data);
            setCallId(data.callId);
            setPeerId(data.peerId);
            isInitiator.current = data.isInitiator;
            setCallState('connecting');

            await createPeerConnection();

            if (data.isInitiator) {
                // Initiator creates the offer
                console.log('I am initiator, creating offer...');
                await createOffer();
            } else {
                console.log('I am not initiator, waiting for offer...');
            }
        };

        // Handle call ended by peer
        const handleCallEnded = (data: { reason: string }) => {
            console.log('Call ended:', data.reason);
            cleanup();
            setCallState('ended');
            options.onCallEnded?.(data.reason);
        };

        // Handle peer disconnected
        const handlePeerDisconnected = () => {
            console.log('Peer disconnected');
            cleanup();
            setCallState('ended');
            options.onCallEnded?.('Peer disconnected');
        };

        // Handle searching
        const handleSearching = () => {
            console.log('Searching for match...');
            setCallState('searching');
        };

        // Handle WebRTC offer - MUST be async
        const handleWebRTCOffer = async (data: { sdp: RTCSessionDescriptionInit }) => {
            console.log('Received WebRTC offer');
            await handleOffer(data.sdp);
        };

        // Handle WebRTC answer - MUST be async
        const handleWebRTCAnswer = async (data: { sdp: RTCSessionDescriptionInit }) => {
            console.log('Received WebRTC answer');
            await handleAnswer(data.sdp);
        };

        // Handle ICE candidate - MUST be async
        const handleICECandidate = async (data: { candidate: RTCIceCandidateInit }) => {
            console.log('Received ICE candidate');
            await handleIceCandidate(data.candidate);
        };

        // Register event listeners
        socketService.onCallFound(handleCallFound);
        socketService.onCallEnded(handleCallEnded);
        socketService.onPeerDisconnected(handlePeerDisconnected);
        socketService.onSearching(handleSearching);
        socketService.onWebRTCOffer(handleWebRTCOffer);
        socketService.onWebRTCAnswer(handleWebRTCAnswer);
        socketService.onIceCandidate(handleICECandidate);

        // Cleanup on unmount
        return () => {
            cleanup();
            socketService.clearCallListeners();
        };
    }, [cleanup, createPeerConnection, createOffer, handleOffer, handleAnswer, handleIceCandidate, options]);

    return {
        // State
        callState,
        callId,
        peerId,
        isAudioEnabled,
        isVideoEnabled,
        error,

        // Actions
        findCall,
        cancelFind,
        endCall,
        nextCall,
        toggleAudio,
        toggleVideo,

        // Video refs
        setLocalVideoElement,
        setRemoteVideoElement,
    };
}
