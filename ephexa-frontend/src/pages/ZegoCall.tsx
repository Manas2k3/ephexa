import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { useCallback, useRef, useEffect } from 'react';

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
    const zpRef = useRef<any>(null);

    const myMeeting = useCallback((element: HTMLDivElement | null) => {
        if (!element) return;

        const initMeeting = async () => {
            // Generate Kit Token (Client-side for MVP)
            // In production, this should be generated on backend for security
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
                    mode: ZegoUIKitPrebuilt.OneONoneCall, // 1-on-1 calls
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
                    onEndCall();
                },
                onUserLeave: () => {
                    onEndCall();
                }
            });
        };

        initMeeting();

    }, [roomId, userId, userName, onEndCall]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (zpRef.current) {
                zpRef.current.destroy();
            }
        };
    }, []);

    return (
        <div
            ref={myMeeting}
            className="w-full h-full bg-gray-900"
            style={{ width: '100vw', height: '100vh' }}
        />
    );
}
