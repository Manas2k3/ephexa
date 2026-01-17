import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { useRef, useEffect } from 'react';

// ZegoCloud Credentials
const APP_ID = 1185534348;
const SERVER_SECRET = '46f2e56de25dc9c4b7130dee5a024ab5';

interface ZegoCallProps {
    roomId: string; // The callId from our matching system
    userId: string;
    userName: string;
    onEndCall: () => void;
}

export function ZegoCall({ roomId, userId, userName, onEndCall }: ZegoCallProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const zpRef = useRef<any>(null);

    useEffect(() => {
        const element = containerRef.current;
        if (!element || !roomId || !userId || !userName) return;

        console.log('ZegoCall: Initializing meeting for room', roomId);

        const initMeeting = async () => {
            try {
                // Generate Kit Token
                const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
                    APP_ID,
                    SERVER_SECRET,
                    roomId,
                    userId,
                    userName
                );

                // Create instance
                const zp = ZegoUIKitPrebuilt.create(kitToken);
                zpRef.current = zp;

                // Join the room
                zp.joinRoom({
                    container: element,
                    sharedLinks: [
                        {
                            name: 'Copy Link',
                            url: window.location.protocol + '//' + window.location.host + window.location.pathname + '?roomID=' + roomId,
                        },
                    ],
                    scenario: {
                        mode: ZegoUIKitPrebuilt.OneONoneCall,
                    },
                    showScreenSharingButton: false,
                    showPreJoinView: false,
                    turnOnMicrophoneWhenJoining: true,
                    turnOnCameraWhenJoining: true,
                    showMyCameraToggleButton: true,
                    showMyMicrophoneToggleButton: true,
                    showAudioVideoSettingsButton: true,
                    showTextChat: true,
                    showUserList: false,
                    maxUsers: 2,
                    layout: "Auto",
                    showLayoutButton: false,
                    onLeaveRoom: () => {
                        console.log('ZegoCall: onLeaveRoom triggered');
                        onEndCall();
                    },
                    onUserLeave: (user: any) => {
                        console.log('ZegoCall: onUserLeave triggered', user);
                        onEndCall();
                    }
                });
            } catch (err) {
                console.error('ZegoCall: Initialization failed', err);
            }
        };

        initMeeting();

        // Cleanup function
        return () => {
            console.log('ZegoCall: Cleaning up instance for room', roomId);
            if (zpRef.current) {
                zpRef.current.destroy();
                zpRef.current = null;
            }
        };
    }, [roomId, userId, userName, onEndCall]);

    return (
        <div
            ref={containerRef}
            className="w-full h-full bg-gray-900"
            style={{ width: '100vw', height: '100vh' }}
        />
    );
}
