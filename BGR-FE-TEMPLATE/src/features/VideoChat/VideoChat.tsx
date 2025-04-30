import { useState, useEffect, useRef, memo, useCallback } from 'react';
import './VideoChat.css';
import { useReactMediaRecorder } from 'react-media-recorder';

interface PeerConnection {
  id: string;
  stream?: MediaStream;
  name?: string;
}

interface ChatMessage {
  userId: string;
  text: string;
  timestamp: number;
}

interface RecordingItem {
  _id: string;
  fileName: string;
  createdAt: string;
  duration: number;
}

// Add this memoized component near the top of the file, before the main VideoChat component
// This component will only re-render when its specific props change
const MemoizedPeerVideo = memo(
  ({
    peer,
    setVideoRef,
    hasStream,
    onRetry,
  }: {
    peer: PeerConnection;
    setVideoRef: (el: HTMLVideoElement | null) => void;
    hasStream: boolean;
    onRetry: (peerId: string) => void;
  }) => {
    console.log(`[Render] MemoizedPeerVideo for ${peer.id}`);

    return (
      <div
        key={`peer-${peer.id}`}
        className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden"
      >
        <video
          ref={setVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
          style={{ backgroundColor: '#1a1a1a' }}
        />
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 px-2 py-1 rounded text-white text-sm">
          {peer.name || peer.id}
        </div>
        {!hasStream && (
          <div className="absolute inset-0 flex items-center justify-center text-white bg-black bg-opacity-70 flex-col">
            <span>Connecting...</span>
            <button
              onClick={e => {
                e.stopPropagation(); // Prevent event bubbling
                onRetry(peer.id);
              }}
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function for React.memo
    // Only re-render if specific important props have changed
    return (
      prevProps.peer.id === nextProps.peer.id &&
      prevProps.peer.name === nextProps.peer.name &&
      prevProps.hasStream === nextProps.hasStream
    );
  }
);

// Add this memoized component for the local video
const MemoizedLocalVideo = memo(
  ({
    localVideoRef,
    userName,
    isVideoMuted,
    isAudioMuted,
  }: {
    localVideoRef: React.RefObject<HTMLVideoElement>;
    userName: string;
    isVideoMuted: boolean;
    isAudioMuted: boolean;
  }) => {
    console.log(`[Render] MemoizedLocalVideo, muted: ${isVideoMuted}`);

    return (
      <div className={`relative aspect-video bg-gray-800 rounded-lg overflow-hidden`}>
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'scaleX(-1)',
            backgroundColor: '#1a1a1a',
            display: isVideoMuted ? 'none' : 'block',
          }}
        />
        {isVideoMuted && (
          <div className="absolute inset-0 flex items-center justify-center text-white bg-black bg-opacity-70">
            <span>Video Off</span>
          </div>
        )}
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 px-2 py-1 rounded text-white text-sm">
          {userName || 'You'} {isAudioMuted && '🔇'}
        </div>
      </div>
    );
  }
);

// Also add a memoized screen share component
const MemoizedScreenShare = memo(
  ({
    isScreenSharing,
    screenVideoRef,
    remoteScreenShare,
  }: {
    isScreenSharing: boolean;
    screenVideoRef: React.RefObject<HTMLVideoElement>;
    remoteScreenShare: { userId: string; stream: MediaStream | null };
  }) => {
    console.log(
      `[Render] MemoizedScreenShare, sharing: ${isScreenSharing}, remote: ${!!remoteScreenShare.stream}`
    );

    return (
      <div
        className={`relative aspect-video bg-gray-800 rounded-lg overflow-hidden border-2 border-blue-500 col-span-full md:col-span-2`}
        style={{ zIndex: 10 }}
      >
        <video
          ref={screenVideoRef}
          key={`screen-video-${isScreenSharing ? 'local' : 'remote'}-${remoteScreenShare.userId || ''}`}
          autoPlay
          playsInline
          muted={isScreenSharing}
          className="w-full h-full object-contain"
          style={{ backgroundColor: 'black' }}
          controls={!isScreenSharing}
        />
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-80 px-3 py-2 rounded text-white text-sm font-bold">
          Screen Share from {isScreenSharing ? 'You' : remoteScreenShare.userId}
        </div>
      </div>
    );
  }
);

const VideoChat = () => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [peers, setPeers] = useState<PeerConnection[]>([]);
  const [roomId, setRoomId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordings, setRecordings] = useState<RecordingItem[]>([]);
  const [showRecordings, setShowRecordings] = useState<boolean>(false);
  const [recordingStatus, setRecordingStatus] = useState<string>('');
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(true);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const peerVideoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  // New: Record the entire video chat UI (screen/window/tab)
  const [isCallRecording, setIsCallRecording] = useState(false);
  const [callRecorder, setCallRecorder] = useState<MediaRecorder | null>(null);
  const [callRecordingStatus, setCallRecordingStatus] = useState('');
  const callRecordingChunks = useRef<Blob[]>([]);
  const [callRecordingStartTime, setCallRecordingStartTime] = useState<number | null>(null);
  const [callRecordingElapsed, setCallRecordingElapsed] = useState<number>(0);
  const callRecordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [callRecordingStream, setCallRecordingStream] = useState<MediaStream | null>(null);
  const [isCallRecordingMuted, setIsCallRecordingMuted] = useState(false);

  // Add new state for remote screen share
  const [remoteScreenShare, setRemoteScreenShare] = useState<{
    userId: string;
    stream: MediaStream | null;
    streamId?: string;
  }>({ userId: '', stream: null });

  // Add new state for video grid layout
  const [gridLayout, setGridLayout] = useState<boolean>(true);

  // Add state for user name and participant list visibility
  const [userName, setUserName] = useState<string>('');
  const [showParticipants, setShowParticipants] = useState<boolean>(false);

  // Add new ref for stable peer connections
  const stablePeerStreams = useRef<{ [key: string]: MediaStream }>({});

  // Add this after the stablePeerStreams ref
  const pendingIceCandidates = useRef<{ [key: string]: RTCIceCandidate[] }>({});

  // Add to the beginning of the component before any other refs
  const peerConnectionRetryTimesRef = useRef<{ [key: string]: number }>({});

  // Add this near the top of the component
  const screenShareTransceiverIds = useRef<{ [key: string]: string }>({});

  // WebRTC configuration
  const configuration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      {
        urls: 'turn:openrelay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject',
      },
      {
        urls: 'turn:openrelay.metered.ca:443',
        username: 'openrelayproject',
        credential: 'openrelayproject',
      },
      {
        urls: 'turn:openrelay.metered.ca:443?transport=tcp',
        username: 'openrelayproject',
        credential: 'openrelayproject',
      },
    ],
    iceCandidatePoolSize: 10,
  };

  // Add a ref to store connection objects separately from UI state
  const peerConnectionsRef = useRef<{ [key: string]: RTCPeerConnection }>({});

  // Add this before the startScreenShare function definition to store screen track senders
  const screenTrackSendersRef = useRef<RTCRtpSender[]>([]);

  // Add this stable function using useCallback to prevent recreating on every render
  const createVideoRefSetter = useCallback((peerId: string) => {
    return (el: HTMLVideoElement | null) => {
      // Only set the ref if it changes
      if (el !== peerVideoRefs.current[peerId]) {
        peerVideoRefs.current[peerId] = el;

        // If we have a video element and a stored stream, attach them right away
        if (el) {
          console.log(`[Render] Setting up video element for peer ${peerId}`);

          // Check if we have a stored stream for this peer
          const storedStream = stablePeerStreams.current[peerId];
          if (storedStream) {
            console.log(
              `[Render] Found stored stream for peer ${peerId}, attaching to video element`
            );
            el.srcObject = storedStream;
            el.play().catch(e => console.warn(`[Render] Error playing video for ${peerId}:`, e));
          }
        }
      }
    };
  }, []);

  const handleRetryConnection = useCallback((peerId: string) => {
    console.log(`[UI] Retry button clicked for peer ${peerId}`);
    // Force disconnect and retry connection immediately
    const pc = peerConnectionsRef.current[peerId];
    if (pc) {
      try {
        pc.close();
      } catch (e) {}
      delete peerConnectionsRef.current[peerId];
    }

    // Add small delay before retry to ensure UI updates
    setTimeout(() => {
      retryConnection(peerId);
    }, 500);
  }, []);

  // Add this function to force connection retry
  const retryConnection = (peerId: string) => {
    console.log(`[Retry] Attempting to reconnect with peer ${peerId}`);

    // Check if we've retried too recently to avoid infinite loops
    const lastRetryTime = peerConnectionRetryTimesRef.current[peerId] || 0;
    const now = Date.now();

    if (now - lastRetryTime < 5000) {
      console.log(`[Retry] Skipping retry for ${peerId} - retried too recently`);
      return null;
    }

    // Update the retry time
    peerConnectionRetryTimesRef.current[peerId] = now;

    // Close and remove the existing connection
    const existingConnection = peerConnectionsRef.current[peerId];
    if (existingConnection) {
      try {
        existingConnection.close();
      } catch (e) {
        console.error(`[Retry] Error closing existing connection:`, e);
      }
    }

    // Clear any cached streams for this peer
    if (stablePeerStreams.current[peerId]) {
      delete stablePeerStreams.current[peerId];
    }

    // Remove from refs
    delete peerConnectionsRef.current[peerId];

    // Determine initiator role based on ID comparison and create new connection
    const shouldInitiate = shouldBeInitiator(userId, peerId);
    console.log(`[Retry] Creating new connection with ${peerId}, initiator: ${shouldInitiate}`);
    const newConnection = createPeerConnection(peerId, shouldInitiate);

    // If we're the initiator, send a new offer
    if (shouldInitiate && newConnection) {
      setTimeout(() => {
        createAndSendOffer(newConnection, peerId);
      }, 1000); // Small delay to ensure connection is ready
    }

    // Notify the peer that we're reconnecting
    sendSignal({
      type: 'reconnect-request',
      userId: userId,
      targetUserId: peerId,
      room: roomId,
    });

    return newConnection;
  };

  // Add connection timeout monitoring
  const monitorConnectionTimeout = (peerId: string) => {
    // Set a timeout to check if the connection has been established
    setTimeout(() => {
      const pc = peerConnectionsRef.current[peerId];
      if (
        pc &&
        (pc.connectionState === 'new' ||
          pc.connectionState === 'connecting' ||
          pc.iceConnectionState === 'checking')
      ) {
        console.log(`[Monitor] Connection to peer ${peerId} still not established after timeout`);

        // Check if we already have peer video
        const hasStream = !!stablePeerStreams.current[peerId];
        if (!hasStream) {
          console.log(`[Monitor] No stream for peer ${peerId}, attempting retry`);
          retryConnection(peerId);
        }
      }
    }, 10000); // 10 seconds timeout
  };

  // Initialize WebRTC
  useEffect(() => {
    // Generate a random user ID if not already set
    if (!userId) {
      setUserId(`user-${Math.floor(Math.random() * 1000000)}`);
    }
  }, [userId]);

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Add this effect to update video elements when peers change
  useEffect(() => {
    peers.forEach(peer => {
      if (peer.stream && peerVideoRefs.current[peer.id]) {
        const videoEl = peerVideoRefs.current[peer.id];
        if (videoEl && videoEl.srcObject !== peer.stream) {
          console.log(`Setting video element for peer ${peer.id} with stream`);
          videoEl.srcObject = peer.stream;
        }
      }
    });
  }, [peers]);

  // React Media Recorder setup
  const {
    status,
    startRecording: startMediaRecording,
    stopRecording: stopMediaRecording,
    mediaBlobUrl,
    clearBlobUrl,
  } = useReactMediaRecorder({
    video: true,
    audio: true,
    blobPropertyBag: { type: 'video/webm' },
    onStart: () => {
      setIsRecording(true);
      setRecordingStatus('Recording started');
    },
    onStop: () => {
      setIsRecording(false);
      setRecordingStatus('Recording stopped - processing...');
    },
  });

  useEffect(() => {
    // Fetch recordings when room is connected
    if (isConnected && roomId) {
      fetchRecordings();
    }
  }, [isConnected, roomId]);

  const fetchRecordings = async () => {
    try {
      const response = await fetch(
        `http://${window.location.hostname}:8080/v1/api/recordings?roomId=${roomId}`
      );
      const data = await response.json();
      if (data.success) {
        setRecordings(data.recordings);
      }
    } catch (error) {
      console.error('Error fetching recordings:', error);
    }
  };

  // Add this function to properly add tracks to existing peer connections
  const addLocalTracksToExistingPeers = (stream: MediaStream) => {
    console.log(
      `[Media] Adding local tracks to ${Object.keys(peerConnectionsRef.current).length} existing peer connections`
    );

    Object.entries(peerConnectionsRef.current).forEach(([peerId, pc]) => {
      const senders = pc.getSenders();
      const existingVideoSender = senders.find(
        sender => sender.track && sender.track.kind === 'video'
      );
      const existingAudioSender = senders.find(
        sender => sender.track && sender.track.kind === 'audio'
      );

      // Add video track if not already present
      if (!existingVideoSender) {
        const videoTracks = stream.getVideoTracks();
        if (videoTracks.length > 0) {
          console.log(`[Media] Adding video track to peer ${peerId}`);
          try {
            pc.addTrack(videoTracks[0], stream);
          } catch (error) {
            console.error(`[Media] Error adding video track to peer ${peerId}:`, error);
          }
        }
      }

      // Add audio track if not already present
      if (!existingAudioSender) {
        const audioTracks = stream.getAudioTracks();
        if (audioTracks.length > 0) {
          console.log(`[Media] Adding audio track to peer ${peerId}`);
          try {
            pc.addTrack(audioTracks[0], stream);
          } catch (error) {
            console.error(`[Media] Error adding audio track to peer ${peerId}:`, error);
          }
        }
      }
    });
  };

  // Update the startVideo function to add tracks to existing peers
  const startVideo = async () => {
    try {
      console.log('Requesting user media...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: true,
      });

      console.log('Stream obtained:', stream);
      const videoTracks = stream.getVideoTracks();
      console.log('Video tracks:', videoTracks);

      if (videoTracks.length === 0) {
        throw new Error('No video track available');
      }

      // Ensure video tracks are enabled initially
      videoTracks.forEach(track => {
        track.enabled = true;
        console.log('Video track enabled initially:', track.label, track.enabled);
      });

      // Set the stream state
      setLocalStream(stream);
      setIsVideoMuted(false); // Ensure video is not muted initially

      // Add tracks to any existing peer connections
      if (Object.keys(peerConnectionsRef.current).length > 0) {
        console.log('Adding new local tracks to existing peer connections');
        addLocalTracksToExistingPeers(stream);
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert(
        'Error accessing camera. Please ensure you have granted camera permissions and try again.'
      );
      setLocalStream(null); // Ensure stream state is null on error
    }
  };

  // Refine useEffect for localStream attachment and playback
  useEffect(() => {
    const videoElement = localVideoRef.current;
    console.log(
      `useEffect[localStream] running. Stream exists: ${!!localStream}, Ref exists: ${!!videoElement}`
    );

    if (videoElement) {
      if (localStream) {
        // Attach stream if not already attached
        if (videoElement.srcObject !== localStream) {
          console.log('useEffect[localStream]: Attaching stream to video element');
          videoElement.srcObject = localStream;
        }

        // Add listeners only once or ensure cleanup
        const handleLoadedMetadata = () => {
          console.log('useEffect[localStream]: Video metadata loaded');
          videoElement
            .play()
            .catch(e => console.error('useEffect[localStream]: Error playing video:', e));
        };
        const handleError = (e: Event) => {
          console.error('useEffect[localStream]: Video element error:', e);
        };

        videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
        videoElement.addEventListener('error', handleError);

        // Attempt to play if metadata already loaded
        if (videoElement.readyState >= videoElement.HAVE_METADATA) {
          handleLoadedMetadata();
        }

        return () => {
          console.log('useEffect[localStream]: Cleanup - Removing listeners');
          videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
          videoElement.removeEventListener('error', handleError);
          // Detaching srcObject will be handled if localStream becomes null
        };
      } else {
        // Stream is null, detach if currently attached
        if (videoElement.srcObject) {
          console.log('useEffect[localStream]: Detaching null stream from video element');
          videoElement.srcObject = null;
        }
      }
    } else {
      // Log when the ref is null but the stream exists (the problematic case)
      if (localStream) {
        console.error('useEffect[localStream]: Ref is NULL even though localStream exists!');
      }
    }
    // This effect now depends on both the stream and the existence of the ref indirectly (by re-running on stream change)
  }, [localStream]);

  // Fix the useEffect for isVideoMuted to prevent errors when ref is null
  useEffect(() => {
    const videoElement = localVideoRef.current;
    console.log(
      `useEffect[isVideoMuted] running. isVideoMuted: ${isVideoMuted}, Ref exists: ${!!videoElement}`
    );

    if (videoElement) {
      console.log(
        `useEffect[isVideoMuted]: Setting video display to ${isVideoMuted ? 'none' : 'block'}`
      );
      videoElement.style.display = isVideoMuted ? 'none' : 'block';
    } else if (isVideoMuted === false) {
      // If ref is null but we're trying to show video, log warning but don't error
      console.log('useEffect[isVideoMuted]: Ref is NULL, will set display when ref is available');
    }
  }, [isVideoMuted]);

  const toggleAudio = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      if (audioTracks.length > 0) {
        const enabled = !isAudioMuted;
        audioTracks.forEach(track => {
          track.enabled = enabled;
        });
        setIsAudioMuted(!enabled);
      }
    }
  };

  // Update the toggleVideo function to ensure tracks are added correctly
  const toggleVideo = async () => {
    if (isVideoMuted) {
      // User wants to SHOW video
      if (!localStream) {
        // Stream doesn't exist, start it
        console.log('toggleVideo: localStream is null, calling startVideo()');
        await startVideo(); // startVideo should set isVideoMuted to false
      } else {
        // Stream exists, just enable tracks
        console.log('toggleVideo: Enabling existing video tracks');
        localStream.getVideoTracks().forEach(track => {
          track.enabled = true;
        });
        setIsVideoMuted(false);
      }
    } else {
      // User wants to HIDE video
      if (localStream) {
        console.log('toggleVideo: Disabling video tracks');
        localStream.getVideoTracks().forEach(track => {
          track.enabled = false;
        });
        setIsVideoMuted(true);
      }
    }
  };

  const startScreenShare = async () => {
    try {
      console.log('[ScreenShare] Starting screen share...');
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 },
        },
        audio: true,
      });

      console.log('[ScreenShare] Stream obtained:', stream);

      // Tag all tracks to help identify them as screen share
      stream.getTracks().forEach(track => {
        track.contentHint = 'screen';
        console.log(`[ScreenShare] Track ${track.id} (${track.kind}) set contentHint to 'screen'`);
      });

      setScreenStream(stream);
      setIsScreenSharing(true);

      // Store screen stream track senders to make removal easier later
      const screenTrackSenders: RTCRtpSender[] = [];

      // Add screen tracks to all peer connections
      Object.entries(peerConnectionsRef.current).forEach(([peerId, pc]) => {
        console.log(`[ScreenShare] Processing peer ${peerId} for screen share`);

        // Remove any existing screen share tracks first
        pc.getSenders().forEach(sender => {
          if (
            sender.track &&
            (sender.track.id.includes('screen') ||
              sender.track.contentHint === 'screen' ||
              sender.track.label.includes('screen') ||
              sender.track.label.includes('Capture') ||
              sender.track.label.includes('display'))
          ) {
            console.log(`[ScreenShare] Removing old screen track from peer ${peerId}`);
            pc.removeTrack(sender);
          }
        });

        // Setup a specific transceiver for screen video sharing to avoid issues
        let screenVideoTransceiver = pc.getTransceivers().find(transceiver => {
          // Check if we have marked this transceiver for screen share
          const isMarkedForScreen =
            screenShareTransceiverIds.current[`${peerId}-${transceiver.mid}`];

          // Or check if it's already being used for screen
          const hasScreenTrack =
            transceiver.sender.track?.contentHint === 'screen' &&
            transceiver.sender.track?.kind === 'video';

          return isMarkedForScreen || hasScreenTrack;
        });

        // Add each track from the screen share stream
        stream.getTracks().forEach(track => {
          console.log(
            `[ScreenShare] Adding screen track (${track.kind}) to peer ${peerId}, track ID: ${track.id}, label: ${track.label}`
          );

          try {
            let sender;
            // Use transceiver if we're dealing with video
            if (track.kind === 'video') {
              if (!screenVideoTransceiver) {
                console.log(`[ScreenShare] Creating new transceiver for screen video`);
                screenVideoTransceiver = pc.addTransceiver(track, {
                  direction: 'sendonly',
                  streams: [stream],
                });
                // Store the transceiver's mid in our map
                if (screenVideoTransceiver.mid) {
                  screenShareTransceiverIds.current[`${peerId}-${screenVideoTransceiver.mid}`] =
                    'screen-video';
                  console.log(
                    `[ScreenShare] Marked transceiver ${screenVideoTransceiver.mid} for screen sharing`
                  );
                }
              } else {
                console.log(`[ScreenShare] Using existing transceiver for screen video`);
                screenVideoTransceiver.sender.replaceTrack(track);
                screenVideoTransceiver.direction = 'sendonly';
              }
              sender = screenVideoTransceiver.sender;
            } else {
              // For audio tracks, use regular addTrack
              sender = pc.addTrack(track, stream);
            }

            if (sender) {
              screenTrackSenders.push(sender);

              // Set encoding parameters for better quality
              const params = sender.getParameters();
              if (params.encodings && params.encodings.length > 0) {
                params.encodings[0].maxBitrate = 2500000; // 2.5 Mbps
                params.encodings[0].maxFramerate = 30;
                sender
                  .setParameters(params)
                  .catch(e => console.warn(`[ScreenShare] Error setting encoding parameters:`, e));
              }
            }
          } catch (error) {
            console.error(`[ScreenShare] Error adding track to peer ${peerId}:`, error);
          }
        });

        // Force negotiation for all peers to ensure screen share is processed
        try {
          console.log(
            `[ScreenShare] Initiating renegotiation with peer ${peerId} for screen share`
          );
          // Delay slightly to ensure all tracks are added
          setTimeout(() => {
            createAndSendOffer(pc, peerId);
          }, 100);
        } catch (e) {
          console.error(`[ScreenShare] Error initiating renegotiation:`, e);
        }
      });

      // Store the senders in a ref for later cleanup
      screenTrackSendersRef.current = screenTrackSenders;

      // Handle stream end (user clicks "Stop sharing")
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };

      // Notify peers that we started screen sharing
      sendSignal({
        type: 'screen-sharing-started',
        userId: userId,
        room: roomId,
        streamId: stream.id,
      });

      // Notify peers individually to ensure they get the message
      Object.keys(peerConnectionsRef.current).forEach(peerId => {
        console.log(`[ScreenShare] Sending direct notification to peer ${peerId}`);
        sendSignal({
          type: 'screen-sharing-started',
          userId: userId,
          targetUserId: peerId,
          room: roomId,
          streamId: stream.id,
        });
      });

      // Attach to local video element
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = stream;
        screenVideoRef.current
          .play()
          .catch(e => console.warn('[ScreenShare] Error playing local screen share:', e));
      }
    } catch (error) {
      console.error('[ScreenShare] Error starting screen share:', error);
      setIsScreenSharing(false);
      setScreenStream(null);
    }
  };

  const stopScreenShare = () => {
    if (screenStream) {
      console.log('Stopping screen share...');

      // Remove screen tracks from all peer connections using the stored senders
      if (screenTrackSendersRef.current.length > 0) {
        screenTrackSendersRef.current.forEach(sender => {
          const pc = findPeerConnectionBySender(sender);
          if (pc) {
            console.log(`[ScreenShare] Removing screen track from a peer connection`);
            pc.removeTrack(sender);
          }
        });
        screenTrackSendersRef.current = [];
      }

      // Stop all tracks in the screen stream
      screenStream.getTracks().forEach(track => {
        console.log(`[ScreenShare] Stopping track: ${track.kind}`);
        track.stop();
      });

      // Clear screen stream state
      setScreenStream(null);
      setIsScreenSharing(false);

      // Notify peers that we stopped screen sharing
      sendSignal({
        type: 'screen-sharing-stopped',
        userId: userId,
        room: roomId,
      });
    }
  };

  // Helper function to find which peer connection a sender belongs to
  const findPeerConnectionBySender = (sender: RTCRtpSender): RTCPeerConnection | null => {
    for (const pc of Object.values(peerConnectionsRef.current)) {
      if (pc.getSenders().includes(sender)) {
        return pc;
      }
    }
    return null;
  };

  const connectToRoom = async () => {
    // Ensure name and room ID are provided
    if (!roomId || !userName) {
      alert('Please enter both your name and a room ID');
      return;
    }

    // Run WebRTC diagnosis
    diagnoseWebRTC();

    // Generate user ID if not present (can still be random)
    if (!userId) {
      setUserId(`user-${Math.floor(Math.random() * 1000000)}`);
    }

    // Connect to WebSocket server
    const serverUrl = `ws://${window.location.hostname}:8080`;
    wsRef.current = new WebSocket(serverUrl);

    wsRef.current.onopen = () => {
      console.log('Connected to signaling server');
      // Send join message
      sendSignal({
        type: 'join',
        room: roomId,
        userId: userId,
      });
      // Send name immediately after joining
      sendSignal({
        type: 'set-user-name',
        room: roomId,
        userId: userId,
        name: userName,
      });
      setIsConnected(true);
    };

    wsRef.current.onmessage = event => {
      const data = JSON.parse(event.data);
      handleSignalingData(data);
    };

    wsRef.current.onerror = error => {
      console.error('WebSocket error:', error);
    };

    wsRef.current.onclose = () => {
      console.log('Disconnected from signaling server');
      setIsConnected(false);
    };
  };

  // Keep existing functions first
  const createPeerConnection = (peerId: string, isInitiator: boolean) => {
    console.log(`Creating peer connection with ${peerId}, initiator: ${isInitiator}`);

    // Check if peer connection already exists in the REF
    if (peerConnectionsRef.current[peerId]) {
      console.log(
        `Peer connection for ${peerId} already exists in ref, not creating new connection`
      );
      return peerConnectionsRef.current[peerId];
    }

    // Check if peer already exists in state
    if (peers.find(peer => peer.id === peerId)) {
      console.log(`Peer ${peerId} already exists in state`);
    }

    const peerConnection = new RTCPeerConnection(configuration);

    // Store the connection in the ref IMMEDIATELY
    peerConnectionsRef.current[peerId] = peerConnection;
    console.log(`[Peer ${peerId}] Connection object created and stored in ref.`);

    // Add all local tracks to the peer connection
    const addTracks = () => {
      if (localStream) {
        localStream.getTracks().forEach(track => {
          if (localStream) {
            console.log(
              `[Peer ${peerId}] Adding LOCAL ${track.kind} track: ${track.id}, enabled: ${track.enabled}`
            );
            try {
              peerConnection.addTrack(track, localStream);
            } catch (error) {
              console.error(`[Peer ${peerId}] Error adding local ${track.kind} track:`, error);
            }
          }
        });
      }

      if (screenStream) {
        screenStream.getTracks().forEach(track => {
          if (screenStream) {
            console.log(`[Peer ${peerId}] Adding LOCAL screen ${track.kind} track: ${track.id}`);
            try {
              peerConnection.addTrack(track, screenStream);
            } catch (error) {
              console.error(
                `[Peer ${peerId}] Error adding local screen ${track.kind} track:`,
                error
              );
            }
          }
        });
      }
    };

    addTracks();

    // Handle ICE candidates
    peerConnection.onicecandidate = event => {
      if (event.candidate) {
        console.log(`[ICE] Generated candidate for peer ${peerId}`);
        sendSignal({
          type: 'ice-candidate',
          candidate: event.candidate,
          userId: userId,
          targetUserId: peerId,
          room: roomId,
        });
      } else {
        console.log(`[ICE] All candidates gathered for peer ${peerId}`);
      }
    };

    // Enhanced Connection State Logging and Recovery
    peerConnection.onconnectionstatechange = () => {
      console.log(
        `%c[Peer ${peerId}] Connection State: ${peerConnection.connectionState}`,
        'color: orange; font-weight: bold;'
      );

      if (peerConnection.connectionState === 'failed') {
        console.error(`[Peer ${peerId}] Connection failed! Attempting recovery...`);

        // Check if we've already attempted a retry recently to avoid infinite loops
        const lastRetryTime = peerConnectionRetryTimesRef.current[peerId] || 0;
        const now = Date.now();

        if (now - lastRetryTime > 10000) {
          // Limit retries to once per 10 seconds
          peerConnectionRetryTimesRef.current[peerId] = now;
          retryConnection(peerId);
        }
      } else if (peerConnection.connectionState === 'connected') {
        console.log(`[Peer ${peerId}] Successfully connected!`);
      }
    };

    // Also log ICE connection state for older browser compatibility / more detail
    peerConnection.oniceconnectionstatechange = () => {
      console.log(
        `%c[Peer ${peerId}] ICE Connection State: ${peerConnection.iceConnectionState}`,
        'color: cyan; font-weight: bold;'
      );

      if (peerConnection.iceConnectionState === 'failed') {
        console.error(`[Peer ${peerId}] ICE connection failed! Considering retry...`);
      } else if (peerConnection.iceConnectionState === 'connected') {
        console.log(`[Peer ${peerId}] ICE connection established!`);
      } else if (peerConnection.iceConnectionState === 'checking') {
        console.log(`[Peer ${peerId}] ICE connection checking...`);
      }
    };

    // Handle negotiation needed event
    peerConnection.onnegotiationneeded = () => {
      console.log(`[Peer ${peerId}] Negotiation needed event fired.`);
      if (isInitiator) {
        console.log(`[Peer ${peerId}] Handling negotiation as initiator`);
        createAndSendOffer(peerConnection, peerId);
      }
    };

    // Improved track handler
    peerConnection.ontrack = event => {
      console.log(
        `%c[Peer ${peerId}][ontrack] Received track kind: ${event.track.kind}, ID: ${event.track.id}, Label: ${event.track.label}, ContentHint: ${event.track.contentHint}, mid: ${event.transceiver?.mid || 'unknown'}`,
        'color: #4CAF50; font-weight: bold;'
      );

      // Ensure track is enabled
      if (!event.track.enabled) {
        console.log(`[Peer ${peerId}][ontrack] Enabling previously disabled track`);
        event.track.enabled = true;
      }

      const stream = event.streams[0];
      if (!stream) {
        console.error(`[Peer ${peerId}][ontrack] No stream available in track event!`);
        return;
      }

      console.log(
        `%c[Peer ${peerId}][ontrack] Stream ID: ${stream.id}, Video tracks: ${stream.getVideoTracks().length}, Audio tracks: ${stream.getAudioTracks().length}`,
        'color: #2196F3; font-weight: bold;'
      );

      // ENHANCED screen share detection - with more debugging
      const isTransceiverMarkedForScreen =
        event.transceiver?.mid &&
        screenShareTransceiverIds.current[`${peerId}-${event.transceiver.mid}`] === 'screen-video';

      const hasScreenContentHint = event.track.contentHint === 'screen';
      const matchesExpectedStreamId =
        remoteScreenShare.streamId && stream.id === remoteScreenShare.streamId;

      const nameBasedDetection =
        event.track.kind === 'video' &&
        (event.track.label.toLowerCase().includes('screen') ||
          event.track.label.toLowerCase().includes('display') ||
          event.track.label.toLowerCase().includes('capture') ||
          event.track.label.toLowerCase().includes('window') ||
          event.track.label.toLowerCase().includes('tab') ||
          event.track.id.toLowerCase().includes('screen') ||
          stream.id.toLowerCase().includes('screen') ||
          event.track.label.includes('Presentation') ||
          event.track.label.includes('surface'));

      const isScreenShare =
        isTransceiverMarkedForScreen ||
        hasScreenContentHint ||
        matchesExpectedStreamId ||
        nameBasedDetection ||
        remoteScreenShare.userId === peerId; // Also check if we're expecting a screen from this peer

      // Log detailed detection info
      console.log(
        `%c[Peer ${peerId}][ontrack] Screen Share Detection:
        - Transceiver marked for screen: ${isTransceiverMarkedForScreen}
        - Track has screen contentHint: ${hasScreenContentHint}
        - Matches expected stream ID: ${matchesExpectedStreamId}
        - Name-based detection: ${nameBasedDetection}
        - From expected screen share peer: ${remoteScreenShare.userId === peerId}
        - FINAL RESULT: ${isScreenShare ? 'IS SCREEN SHARE' : 'NOT screen share'}`,
        `color: ${isScreenShare ? '#e91e63' : '#607d8b'}; font-weight: bold;`
      );

      if (isScreenShare) {
        console.log(
          `%c[Peer ${peerId}][ontrack] ✅ DETECTED SCREEN SHARE stream (${stream.id})`,
          'color: #FF5722; font-size: 14px; font-weight: bold;'
        );

        // Always create a new dedicated stream for screen sharing to avoid mixing with other tracks
        const screenStream = new MediaStream([event.track]);

        // Store screen share info
        setRemoteScreenShare({
          userId: peerId,
          stream: screenStream,
          streamId: stream.id,
        });

        // Immediately try to attach to video element if it exists
        const videoEl = screenVideoRef.current;
        if (videoEl) {
          console.log(`[ScreenShare] Directly attaching screen stream to video element`);
          videoEl.srcObject = screenStream;
          videoEl
            .play()
            .then(() => console.log('[ScreenShare] Successfully playing remote screen share'))
            .catch(e => console.warn(`[ScreenShare] Error playing screen share video:`, e));
        } else {
          console.error('[ScreenShare] Screen video element ref is null!');
        }

        // Also store this track separately so we can keep it even if the peer's camera track changes
        if (!stablePeerStreams.current[`${peerId}-screen`]) {
          stablePeerStreams.current[`${peerId}-screen`] = screenStream;
        }
      } else {
        console.log(
          `[Peer ${peerId}][ontrack] Assigning regular stream ${stream.id} to peer state`
        );

        // Create a new MediaStream if this is the first track
        let peerStream = stablePeerStreams.current[peerId];
        if (!peerStream) {
          console.log(`[Peer ${peerId}][ontrack] Creating new MediaStream for peer`);
          peerStream = new MediaStream();
          stablePeerStreams.current[peerId] = peerStream;
        }

        // Check if this track is already in the stream
        const trackAlreadyExists = peerStream
          .getTracks()
          .some(existingTrack => existingTrack.id === event.track.id);

        if (!trackAlreadyExists) {
          console.log(
            `[Peer ${peerId}][ontrack] Adding new track to peer stream: ${event.track.kind}`
          );
          peerStream.addTrack(event.track);
        }

        // Immediately try to attach to video element if it exists
        const videoEl = peerVideoRefs.current[peerId];
        if (videoEl && videoEl.srcObject !== peerStream) {
          console.log(
            `[Peer ${peerId}][ontrack] Directly attaching stream to existing video element`
          );
          videoEl.srcObject = peerStream;
          videoEl.play().catch(e => console.warn(`Error playing video for ${peerId}:`, e));
        } else if (!videoEl) {
          console.log(
            `[Peer ${peerId}][ontrack] Video element not available yet, stream saved in ref for later`
          );
        }

        // Update React state to trigger re-render with a slight delay to ensure DOM is ready
        setTimeout(() => {
          setPeers(prevPeers => {
            const existingPeerIndex = prevPeers.findIndex(p => p.id === peerId);
            if (existingPeerIndex !== -1) {
              // Check if we need to update
              if (prevPeers[existingPeerIndex].stream === peerStream) {
                return prevPeers; // No change needed
              }

              // Create a new peer object with the stream
              const updatedPeers = [...prevPeers];
              updatedPeers[existingPeerIndex] = {
                ...updatedPeers[existingPeerIndex],
                stream: peerStream,
              };
              return updatedPeers;
            } else {
              console.warn(
                `[Peer ${peerId}][ontrack][setPeers] Peer ${peerId} not found! Adding now.`
              );
              return [...prevPeers, { id: peerId, name: undefined, stream: peerStream }];
            }
          });
        }, 500);
      }
    };

    // Ensure initial setPeers only adds id/name
    setPeers(prevPeers => {
      if (!prevPeers.some(p => p.id === peerId)) {
        console.log(`[Peer ${peerId}] Adding peer ID ${peerId} to peers STATE.`);
        return [...prevPeers, { id: peerId, name: undefined }]; // NO connection property
      }
      return prevPeers;
    });

    // Add detailed logging in createPeerConnection for initiator offer flow
    if (isInitiator) {
      console.log(`[Peer ${peerId}][Offer Init] Creating offer as initiator...`);
      createAndSendOffer(peerConnection, peerId);
    }

    // Start monitoring for connection timeouts
    monitorConnectionTimeout(peerId);

    return peerConnection;
  };

  // Helper function to create and send an offer
  const createAndSendOffer = async (peerConnection: RTCPeerConnection, peerId: string) => {
    try {
      const offer = await peerConnection.createOffer();
      console.log(
        `[Peer ${peerId}][Offer] Created offer. Current signaling state: ${peerConnection.signalingState}`
      );

      await peerConnection.setLocalDescription(offer);
      console.log(
        `[Peer ${peerId}][Offer] Set local description. New state: ${peerConnection.signalingState}`
      );

      if (peerConnection.localDescription) {
        console.log(`[Peer ${peerId}][Offer] Sending offer to ${peerId}`);
        sendSignal({
          type: 'offer',
          offer: peerConnection.localDescription,
          userId: userId,
          targetUserId: peerId,
          room: roomId,
        });
      } else {
        console.error(`[Peer ${peerId}][Offer] Error: Local description is null after set!`);
      }
    } catch (error) {
      console.error(`[Peer ${peerId}][Offer] Error creating/sending offer:`, error);
    }
  };

  // Enhanced handleIceCandidate function
  const handleIceCandidate = (data: any) => {
    const peerId = data.userId;
    const peerConnection = peerConnectionsRef.current[peerId];
    console.log(`[ICE] Received candidate from ${peerId}`);

    if (!peerConnection) {
      console.warn(`[ICE] No peer connection found for ${peerId}, buffering candidate`);
      const candidates = pendingIceCandidates.current[peerId] || [];
      candidates.push(new RTCIceCandidate(data.candidate));
      pendingIceCandidates.current[peerId] = candidates;
      return;
    }

    // If we have a connection but remote description is not set, buffer the candidate
    if (!peerConnection.remoteDescription || peerConnection.remoteDescription.type === 'rollback') {
      console.log(`[ICE] Remote description not set for ${peerId}, buffering candidate`);
      const candidates = pendingIceCandidates.current[peerId] || [];
      candidates.push(new RTCIceCandidate(data.candidate));
      pendingIceCandidates.current[peerId] = candidates;
      return;
    }

    // Otherwise add the candidate immediately
    console.log(`[ICE] Adding candidate for ${peerId}`);
    peerConnection
      .addIceCandidate(new RTCIceCandidate(data.candidate))
      .then(() => {
        console.log(`[ICE] Successfully added candidate for ${peerId}`);
      })
      .catch((error: any) => {
        console.error(`[ICE] Error adding candidate for ${peerId}:`, error);
      });
  };

  // Add this new function after the sendSignal function
  const shouldBeInitiator = (myId: string, peerId: string): boolean => {
    // Create deterministic initiator selection based on string comparison
    // This ensures both peers will agree on who initiates
    return myId.localeCompare(peerId) < 0;
  };

  // Update the handleSignalingData function - specifically the user-joined case
  const handleSignalingData = (data: any) => {
    console.log('Received signal:', data.type, 'from:', data.userId);
    switch (data.type) {
      case 'user-joined':
        console.log(`User ${data.userId} joined room ${data.room}`);
        if (data.userId !== userId && userName) {
          console.log(
            `[Signal Send] Preparing to send own name (${userName}) to new user ${data.userId}`
          );
          sendSignal({
            type: 'set-user-name',
            room: roomId,
            userId: userId,
            targetUserId: data.userId,
            name: userName,
          });
          console.log(`[Signal Send] Sent own name to ${data.userId}`);
        }
        if (data.userId !== userId) {
          // Determine which peer should initiate the connection
          const isInitiator = shouldBeInitiator(userId, data.userId);
          console.log(`Creating peer connection with ${data.userId}, initiator: ${isInitiator}`);
          createPeerConnection(data.userId, isInitiator);
        }
        break;
      case 'set-user-name':
        console.log(`[Signal Receive] Name update: User ${data.userId} = ${data.name}`);
        setPeers(currentPeers => {
          let peerUpdated = false;
          // Always create a new array using map
          const updatedPeers = currentPeers.map(peer => {
            if (peer.id === data.userId) {
              // If found, return a new object only if name needs update
              if (peer.name !== data.name) {
                console.log(
                  `[State Update] Updating peer ${peer.id}. Old name: '${peer.name}', New name: '${data.name}'`
                );
                peerUpdated = true;
                return { ...peer, name: data.name };
              }
            }
            return peer; // Return original peer object reference if no change needed
          });

          // Only log and return updatedPeers if a change actually occurred
          if (peerUpdated) {
            console.log('[State Update] Returning NEW peers array:', updatedPeers);
            return updatedPeers;
          }

          // If no peer was updated (either not found yet, or name was same)
          console.log(
            `[State Update] No changes made for ${data.userId}. Returning OLD peers array reference.`
          );
          return currentPeers; // Return original array reference
        });
        break;
      case 'user-left':
        console.log(`User ${data.userId} left room`);
        setPeers(peers => peers.filter(peer => peer.id !== data.userId));
        if (remoteScreenShare.userId === data.userId) {
          setRemoteScreenShare({ userId: '', stream: null });
        }
        break;
      case 'offer':
        // Ensure we only handle offers from specific target users
        if (data.targetUserId === userId) {
          console.log(`Handling offer from ${data.userId}`);
          handleOffer(data);
        } else {
          console.log(`Ignoring offer not targeted at this user (${userId})`);
        }
        break;
      case 'answer':
        // Ensure we only handle answers from specific target users
        if (data.targetUserId === userId) {
          console.log(`Handling answer from ${data.userId}`);
          handleAnswer(data);
        } else {
          console.log(`Ignoring answer not targeted at this user (${userId})`);
        }
        break;
      case 'ice-candidate':
        // Ensure we only handle candidates from specific target users
        if (data.targetUserId === userId) {
          console.log(`Handling ICE candidate from ${data.userId}`);
          handleIceCandidate(data);
        } else {
          console.log(`Ignoring ICE candidate not targeted at this user (${userId})`);
        }
        break;
      case 'chat-message':
        // Handle incoming chat message
        setChatMessages(prev => [
          ...prev,
          {
            userId: data.userId,
            text: data.text,
            timestamp: data.timestamp,
          },
        ]);
        break;
      case 'screen-sharing-started':
        console.log(
          `%c[ScreenShare] Peer ${data.userId} started screen sharing, streamId: ${data.streamId || 'unknown'}`,
          'color: #e91e63; font-weight: bold; font-size: 14px;'
        );

        // Update remote screen share state
        setRemoteScreenShare(prev => ({
          ...prev,
          userId: data.userId,
          streamId: data.streamId,
        }));

        // Look for any existing screen tracks from this peer and re-use them
        const screenKey = `${data.userId}-screen`;
        const existingScreenStream = stablePeerStreams.current[screenKey];
        if (existingScreenStream) {
          console.log(
            `[ScreenShare] Found existing screen stream for ${data.userId}, re-attaching`
          );
          setRemoteScreenShare(prev => ({
            ...prev,
            stream: existingScreenStream,
          }));

          // Try to attach immediately
          const videoEl = screenVideoRef.current;
          if (videoEl) {
            videoEl.srcObject = existingScreenStream;
            videoEl
              .play()
              .catch(e => console.warn('[ScreenShare] Error playing existing screen share:', e));
          }
        }

        // Force renegotiation with the peer that started screen sharing
        const screenPeerConn = peerConnectionsRef.current[data.userId];
        if (screenPeerConn) {
          console.log(`[ScreenShare] Notifying that we're ready to receive screen share`);

          // Send acknowledgment to the sender to ensure they know we're ready
          sendSignal({
            type: 'screen-share-ready',
            userId: userId,
            targetUserId: data.userId,
            room: roomId,
          });
        }
        break;
      case 'screen-sharing-stopped':
        console.log(`[ScreenShare] Peer ${data.userId} stopped screen sharing`);
        if (remoteScreenShare.userId === data.userId) {
          // Clear the remote screen share state
          setRemoteScreenShare({ userId: '', stream: null, streamId: '' });

          // If there's a video element showing this stream, clear it
          const screenVideoElement = screenVideoRef.current;
          if (screenVideoElement && screenVideoElement.srcObject) {
            console.log('[ScreenShare] Clearing remote screen share from video element');
            screenVideoElement.srcObject = null;
          }
        }
        break;
      case 'reconnect-request':
        if (data.targetUserId === userId) {
          console.log(`[Reconnect] Received reconnect request from ${data.userId}`);
          // Handle reconnection by creating a new connection if needed
          const existingConnection = peerConnectionsRef.current[data.userId];
          if (existingConnection) {
            if (
              existingConnection.connectionState === 'connected' ||
              existingConnection.iceConnectionState === 'connected'
            ) {
              console.log(
                `[Reconnect] Connection with ${data.userId} already connected, no action needed`
              );
            } else {
              console.log(
                `[Reconnect] Connection with ${data.userId} exists but not connected, retrying`
              );
              retryConnection(data.userId);
            }
          } else {
            console.log(`[Reconnect] No connection with ${data.userId}, creating new one`);
            // Create a new connection as non-initiator (the other peer will initiate)
            createPeerConnection(data.userId, false);
          }
        }
        break;
      case 'screen-share-ready':
        if (data.targetUserId === userId && isScreenSharing) {
          console.log(
            `[ScreenShare] Peer ${data.userId} is ready to receive screen share, forcing renegotiation`
          );
          const readyPeerConn = peerConnectionsRef.current[data.userId];
          if (readyPeerConn) {
            setTimeout(() => {
              try {
                createAndSendOffer(readyPeerConn, data.userId);
              } catch (e) {
                console.error('[ScreenShare] Error creating offer after screen-share-ready:', e);
              }
            }, 200);
          }
        }
        break;
      default:
        console.log('Unknown signal type:', data.type);
    }
  };

  // Update the processOffer function to properly handle SDP mismatch errors
  const processOffer = async (peerConnection: RTCPeerConnection, peerId: string, offer: any) => {
    try {
      console.log(
        `[Offer] Processing offer from ${peerId}. Current signaling state: ${peerConnection.signalingState}`
      );

      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      console.log(
        `[Offer] Set remote description for offer from ${peerId}. New state: ${peerConnection.signalingState}`
      );

      // Process any buffered ICE candidates
      const bufferedCandidates = pendingIceCandidates.current[peerId] || [];
      if (bufferedCandidates.length > 0) {
        console.log(
          `[Offer] Processing ${bufferedCandidates.length} buffered ICE candidates for ${peerId}`
        );

        for (const candidate of bufferedCandidates) {
          try {
            await peerConnection.addIceCandidate(candidate);
            console.log(`[Offer] Successfully added buffered candidate for ${peerId}`);
          } catch (error) {
            console.error(`[Offer] Error adding buffered candidate for ${peerId}:`, error);
          }
        }

        // Clear the buffer
        pendingIceCandidates.current[peerId] = [];
      }

      const answer = await peerConnection.createAnswer();
      console.log(`[Offer] Created answer for ${peerId}`);

      await peerConnection.setLocalDescription(answer);
      console.log(
        `[Offer] Set local description for answer to ${peerId}. New state: ${peerConnection.signalingState}`
      );

      sendSignal({
        type: 'answer',
        answer: peerConnection.localDescription,
        userId: userId,
        targetUserId: peerId,
        room: roomId,
      });
      console.log(`[Offer] Sent answer to ${peerId}`);
    } catch (error: any) {
      console.error(`[Offer] Error processing offer from ${peerId}:`, error);

      // Check if this is an SDP mismatch error
      if (
        error.message &&
        error.message.includes("order of m-lines in subsequent offer doesn't match")
      ) {
        console.warn(`[Offer] SDP m-line order mismatch detected. Recreating connection...`);

        // Close the existing connection
        try {
          peerConnection.close();
        } catch (e) {
          console.error(`[Offer] Error closing connection during recovery:`, e);
        }

        // Remove from our refs
        delete peerConnectionsRef.current[peerId];

        // Create a new connection
        console.log(`[Offer] Creating fresh connection for ${peerId}`);
        const newPc = createPeerConnection(peerId, false);

        // Send a reconnect request to the peer
        sendSignal({
          type: 'reconnect-request',
          userId: userId,
          targetUserId: peerId,
          room: roomId,
        });
      }
    }
  };

  // Update the handleOffer function to better handle SDP mismatch errors
  const handleOffer = async (data: any) => {
    const peerId = data.userId;
    console.log(`[Offer] Handling offer from ${peerId}`, data);

    // First check if we already have an ongoing connection and its signaling state
    const existingConnection = peerConnectionsRef.current[peerId];
    if (existingConnection) {
      const currentState = existingConnection.signalingState;

      // If we're already in a state that can't accept an offer, we need to decide what to do
      if (currentState === 'have-local-offer') {
        // Both peers are trying to be the initiator - resolve based on ID comparison
        const shouldIBeInitiator = shouldBeInitiator(userId, peerId);

        if (shouldIBeInitiator) {
          // We should be the initiator, so ignore their offer
          console.warn(
            `[Offer] Both peers trying to be initiator. I (${userId}) win based on ID comparison. Ignoring offer from ${peerId}`
          );
          return;
        } else {
          // They should be the initiator, so we roll back our offer and accept theirs
          console.warn(
            `[Offer] Both peers trying to be initiator. They (${peerId}) win based on ID comparison. Resetting our connection.`
          );
          try {
            // Close and recreate the connection to start fresh
            existingConnection.close();
            delete peerConnectionsRef.current[peerId];

            // Clear any cached streams
            if (stablePeerStreams.current[peerId]) {
              delete stablePeerStreams.current[peerId];
            }

            // Create new connection as non-initiator
            const newConnection = createPeerConnection(peerId, false);

            // Process the offer with the new connection
            await processOffer(newConnection, peerId, data.offer);
            return;
          } catch (error) {
            console.error(`[Offer] Error resetting connection:`, error);
          }
        }
      } else if (
        ['have-remote-offer', 'have-local-pranswer', 'have-remote-pranswer'].includes(currentState)
      ) {
        console.warn(
          `[Offer] Ignoring duplicate offer from ${peerId} because connection is in ${currentState} state`
        );
        return;
      }
    }

    // At this point either we have no connection, or we've cleaned up an invalid one,
    // or we have a connection in a state that can accept an offer (stable)
    if (!peerConnectionsRef.current[peerId]) {
      console.log(`[Offer] No peer connection found for ${peerId}, creating one as non-initiator`);
      createPeerConnection(peerId, false);
    }

    // Get from REF (after potentially creating a new one above)
    const peerConnection = peerConnectionsRef.current[peerId];

    if (peerConnection) {
      // Continue with the existing logic for processing the offer
      await processOffer(peerConnection, peerId, data.offer);
    } else {
      console.error(
        `[Offer] Error: Peer connection NOT FOUND in ref for ${peerId} when handling offer.`
      );
    }
  };

  // Update the handleAnswer function to better handle errors
  const handleAnswer = async (data: any) => {
    const peerId = data.userId;
    const peerConnection = peerConnectionsRef.current[peerId];
    console.log(`[Answer] Handling answer from ${peerId}`);

    if (!peerConnection) {
      console.error(`[Answer] No peer connection found for ${peerId}, cannot process answer`);
      return;
    }

    console.log(
      `[Answer] Found peer connection in ref for ${peerId}. Current signaling state: ${peerConnection.signalingState}`
    );

    // Only proceed if we're in have-local-offer state (waiting for an answer)
    if (peerConnection.signalingState !== 'have-local-offer') {
      console.warn(
        `[Answer] Cannot process answer from ${peerId} because connection is in ${peerConnection.signalingState} state, not have-local-offer`
      );
      return;
    }

    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
      console.log(
        `[Answer] Successfully set remote description for ${peerId}. New state: ${peerConnection.signalingState}`
      );

      // Process any buffered ICE candidates
      const bufferedCandidates = pendingIceCandidates.current[peerId] || [];
      if (bufferedCandidates.length > 0) {
        console.log(
          `[Answer] Processing ${bufferedCandidates.length} buffered ICE candidates for ${peerId}`
        );

        for (const candidate of bufferedCandidates) {
          try {
            await peerConnection.addIceCandidate(candidate);
            console.log(`[Answer] Successfully added buffered candidate for ${peerId}`);
          } catch (error) {
            console.error(`[Answer] Error adding buffered candidate for ${peerId}:`, error);
          }
        }

        // Clear the buffer
        pendingIceCandidates.current[peerId] = [];
      }
    } catch (error) {
      console.error(`[Answer] Error setting remote description for ${peerId}:`, error);

      // If we have an error setting the remote description, the connection is likely in a bad state
      // Consider resetting it
      console.warn(
        `[Answer] Connection with ${peerId} may be in a bad state, attempting recovery...`
      );
      try {
        // Close the existing connection
        peerConnection.close();

        // Remove from our refs
        delete peerConnectionsRef.current[peerId];

        // Create a new connection, with initiator role based on ID comparison
        const shouldInitiate = shouldBeInitiator(userId, peerId);
        console.log(`[Answer] Recreating connection with ${peerId}, initiator: ${shouldInitiate}`);
        createPeerConnection(peerId, shouldInitiate);

        // If we should initiate, start a new offer
        if (shouldInitiate && peerConnectionsRef.current[peerId]) {
          createAndSendOffer(peerConnectionsRef.current[peerId], peerId);
        }
      } catch (recoveryError) {
        console.error(`[Answer] Recovery failed:`, recoveryError);
      }
    }
  };

  const sendSignal = (signal: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(signal));
    }
  };

  const leaveRoom = () => {
    console.log('Leaving room...');

    // 1. Stop local media tracks
    if (localStream) {
      console.log('Stopping local stream tracks');
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    // 2. Stop screen sharing if active
    if (isScreenSharing) {
      stopScreenShare(); // This already handles stopping tracks and signaling
    }

    // 3. Stop call recording if active
    if (isCallRecording) {
      stopCallRecording();
    }

    // 4. Signal departure to server
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('Sending leave signal');
      sendSignal({
        type: 'leave',
        room: roomId,
        userId: userId,
      });
      // Close WebSocket connection
      console.log('Closing WebSocket');
      wsRef.current.close();
      wsRef.current = null;
    }

    // 5. Close all peer connections
    console.log('Closing peer connections');
    Object.values(peerConnectionsRef.current).forEach(pc => {
      try {
        pc.close();
      } catch (e) {
        console.warn('Error closing peer connection:', e);
      }
    });
    peerConnectionsRef.current = {}; // Clear the ref

    // Reset UI state
    console.log('[Leave] Resetting component state');
    setPeers([]); // Clear the UI peers list (which has no .connection)
    setIsConnected(false);
    setChatMessages([]);
    // Don't reset roomId automatically, user might want to rejoin the same room
    // setRoomId('');
    setMessageInput('');
    setIsAudioMuted(false);
    setIsVideoMuted(true);
    setRemoteScreenShare({ userId: '', stream: null });
    // Reset recording states if necessary
    setRecordingStatus('');
    setCallRecordingStatus('');
  };

  const sendChatMessage = () => {
    if (!messageInput.trim() || !isConnected) return;

    const chatMessage = {
      type: 'chat-message',
      userId: userId,
      text: messageInput,
      timestamp: Date.now(),
      room: roomId,
    };

    // Add message to local chat
    setChatMessages(prev => [
      ...prev,
      {
        userId: userId,
        text: messageInput,
        timestamp: Date.now(),
      },
    ]);

    // Send message to all peers
    sendSignal(chatMessage);

    // Clear input
    setMessageInput('');
  };

  // Format timestamp for chat messages
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Handle enter key in chat input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendChatMessage();
    }
  };

  // Start recording
  const startRecording = () => {
    startMediaRecording();
  };

  // Stop recording and save to device instead of uploading to server
  const stopRecording = async () => {
    stopMediaRecording();

    // Wait for the mediaBlobUrl to be available (it's set asynchronously)
    setTimeout(async () => {
      if (mediaBlobUrl) {
        try {
          setRecordingStatus('Preparing download...');

          // Fetch the blob from the mediaBlobUrl
          const response = await fetch(mediaBlobUrl);
          const blob = await response.blob();

          // Create a file name
          const fileName = `recording-${roomId}-${Date.now()}.webm`;

          // Create a download link
          const downloadLink = document.createElement('a');
          downloadLink.href = URL.createObjectURL(blob);
          downloadLink.download = fileName;

          // Trigger download
          document.body.appendChild(downloadLink);
          downloadLink.click();

          // Cleanup
          document.body.removeChild(downloadLink);
          URL.revokeObjectURL(downloadLink.href);

          setRecordingStatus('Recording saved to your device!');

          // Clear the blob URL to free memory
          clearBlobUrl();
        } catch (error) {
          console.error('Error saving recording:', error);
          setRecordingStatus('Error saving recording');
        }
      }
    }, 1000);
  };

  // New: Record the entire video chat UI (screen/window/tab)
  const startCallRecording = async () => {
    try {
      setCallRecordingStatus('');
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      setCallRecordingStream(stream);
      setIsCallRecordingMuted(false);
      const recorder = new MediaRecorder(stream);
      callRecordingChunks.current = [];
      recorder.ondataavailable = e => {
        if (e.data.size > 0) callRecordingChunks.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(callRecordingChunks.current, { type: 'video/webm' });
        const fileName = `call-recording-${roomId}-${Date.now()}.webm`;
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = fileName;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(downloadLink.href);
        setCallRecordingStatus('Call recording saved to your device!');
        setIsCallRecording(false);
        setCallRecordingStartTime(null);
        setCallRecordingElapsed(0);
        if (callRecordingTimerRef.current) {
          clearInterval(callRecordingTimerRef.current);
          callRecordingTimerRef.current = null;
        }
        setCallRecordingStream(null);
        setIsCallRecordingMuted(false);
      };
      recorder.start();
      setCallRecorder(recorder);
      setIsCallRecording(true);
      setCallRecordingStatus('Call recording in progress...');
      setCallRecordingStartTime(Date.now());
      setCallRecordingElapsed(0);
      if (callRecordingTimerRef.current) clearInterval(callRecordingTimerRef.current);
      callRecordingTimerRef.current = setInterval(() => {
        setCallRecordingElapsed(prev => {
          if (callRecordingStartTime) {
            return Math.floor((Date.now() - callRecordingStartTime) / 1000);
          }
          return prev + 1;
        });
      }, 1000);
      // Stop recording if user stops sharing
      stream.getVideoTracks()[0].onended = () => {
        if (recorder.state !== 'inactive') {
          recorder.stop();
        }
      };
    } catch (err) {
      setCallRecordingStatus('Screen recording was cancelled or failed.');
      setIsCallRecording(false);
      setCallRecordingStartTime(null);
      setCallRecordingElapsed(0);
      if (callRecordingTimerRef.current) {
        clearInterval(callRecordingTimerRef.current);
        callRecordingTimerRef.current = null;
      }
      setCallRecordingStream(null);
      setIsCallRecordingMuted(false);
    }
  };

  const stopCallRecording = () => {
    if (callRecorder && callRecorder.state !== 'inactive') {
      callRecorder.stop();
    }
    setCallRecordingStartTime(null);
    setCallRecordingElapsed(0);
    if (callRecordingTimerRef.current) {
      clearInterval(callRecordingTimerRef.current);
      callRecordingTimerRef.current = null;
    }
    if (callRecordingStream) {
      callRecordingStream.getTracks().forEach(track => track.stop());
      setCallRecordingStream(null);
    }
    setIsCallRecordingMuted(false);
  };

  // Mute/unmute call recording audio
  const toggleCallRecordingMute = () => {
    if (callRecordingStream) {
      callRecordingStream.getAudioTracks().forEach(track => {
        track.enabled = isCallRecordingMuted;
      });
      setIsCallRecordingMuted(muted => !muted);
    }
  };

  // Helper to format seconds as mm:ss
  const formatElapsed = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Add useEffect to handle srcObject setting
  useEffect(() => {
    // Handle screen share video
    const videoElement = isScreenSharing ? screenVideoRef.current : null;
    if (
      videoElement &&
      ((isScreenSharing && screenStream) || (!isScreenSharing && remoteScreenShare.stream))
    ) {
      videoElement.srcObject = isScreenSharing ? screenStream : remoteScreenShare.stream;
    }
  }, [isScreenSharing, screenStream, remoteScreenShare.stream]);

  // Add this to fix infinite console logging
  useEffect(() => {
    // Ensure we don't run this effect too frequently
    let lastRenderTime = 0;

    // Replace the video attachment logic for peers
    const updatePeerVideos = () => {
      const now = Date.now();
      if (now - lastRenderTime < 1000) {
        return; // Skip if we updated less than 1 second ago
      }

      lastRenderTime = now;

      peers.forEach(peer => {
        if (peer.stream && peerVideoRefs.current[peer.id]) {
          const videoEl = peerVideoRefs.current[peer.id];
          if (videoEl && videoEl.srcObject !== peer.stream) {
            console.log(`Setting video element for peer ${peer.id} with stream`);
            videoEl.srcObject = peer.stream;
          }
        }
      });
    };

    updatePeerVideos();

    // Set up a cleanup function
    return () => {
      // Any cleanup needed
    };
  }, [peers]);

  // Add this after the useEffect for isVideoMuted
  // Enhanced useEffect to handle screen share attachment
  useEffect(() => {
    const videoElement = screenVideoRef.current;

    if (!videoElement) {
      console.log('[useEffect][ScreenShare] No screen video element found');
      return;
    }

    console.log('[useEffect][ScreenShare] Screen video ref exists, checking streams');
    console.log(
      `[useEffect][ScreenShare] isScreenSharing: ${isScreenSharing}, localStream: ${!!screenStream}, remoteStream: ${!!remoteScreenShare.stream}, remoteUserId: ${remoteScreenShare.userId}`
    );

    if (isScreenSharing && screenStream) {
      // We are sharing our screen
      console.log('[useEffect][ScreenShare] Setting local screen share stream to video element');
      if (videoElement.srcObject !== screenStream) {
        videoElement.srcObject = screenStream;
        videoElement
          .play()
          .then(() => console.log('[useEffect][ScreenShare] Local screen playing successfully'))
          .catch(e => console.warn('[useEffect][ScreenShare] Error playing video:', e));
      }
    } else if (!isScreenSharing && remoteScreenShare.stream) {
      // Someone else is sharing their screen
      console.log('[useEffect][ScreenShare] Setting remote screen share stream to video element');
      if (videoElement.srcObject !== remoteScreenShare.stream) {
        videoElement.srcObject = remoteScreenShare.stream;
        videoElement
          .play()
          .then(() => console.log('[useEffect][ScreenShare] Remote screen playing successfully'))
          .catch(e => console.warn('[useEffect][ScreenShare] Error playing video:', e));
      }
    } else {
      // No screen sharing active
      if (videoElement.srcObject) {
        console.log('[useEffect][ScreenShare] Clearing screen video element');
        videoElement.srcObject = null;
      }
    }
  }, [isScreenSharing, screenStream, remoteScreenShare.stream, remoteScreenShare.userId]);

  // Add after the startScreenShare function
  // Helper function to diagnose WebRTC capabilities
  const diagnoseWebRTC = () => {
    console.log('%c[WebRTC Diagnosis]', 'color: #9C27B0; font-weight: bold; font-size: 14px;');

    // Check RTCPeerConnection support
    if (typeof RTCPeerConnection !== 'undefined') {
      console.log('[WebRTC] ✅ RTCPeerConnection is supported');
    } else {
      console.log('[WebRTC] ❌ RTCPeerConnection is NOT supported');
    }

    // Check MediaDevices support
    if (navigator.mediaDevices) {
      console.log('[WebRTC] ✅ navigator.mediaDevices is supported');

      // Check specific methods
      if ('getUserMedia' in navigator.mediaDevices) {
        console.log('[WebRTC] ✅ getUserMedia is supported');
      } else {
        console.log('[WebRTC] ❌ getUserMedia is NOT supported');
      }

      if ('getDisplayMedia' in navigator.mediaDevices) {
        console.log('[WebRTC] ✅ getDisplayMedia is supported');
      } else {
        console.log('[WebRTC] ❌ getDisplayMedia is NOT supported');
      }
    } else {
      console.log('[WebRTC] ❌ navigator.mediaDevices is NOT supported');
    }

    // Check browser info
    console.log(`[WebRTC] 🌐 Browser: ${navigator.userAgent}`);
  };

  // --- UI ---
  // Zoom-like layout with Tailwind
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-2 py-4">
      {/* App Header */}
      <div className="w-full bg-gray-900 text-center py-4">
        <h1 className="text-3xl font-bold text-white">Video Chat</h1>
        <p className="text-gray-400">Connect with others using peer-to-peer video calling</p>
      </div>

      {/* Join Room UI */}
      {!isConnected && (
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 flex flex-col items-center mt-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Join a Meeting</h2>
          <input
            type="text"
            placeholder="Enter Your Name"
            value={userName}
            onChange={e => setUserName(e.target.value.trim())}
            className="w-full mb-4 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={e => setRoomId(e.target.value.trim())}
            className="w-full mb-4 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={connectToRoom}
            disabled={!roomId || !userName}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Join Room
          </button>
        </div>
      )}

      {/* Main Video Call UI */}
      {isConnected && (
        <div className="w-full max-w-7xl bg-gray-800 rounded-xl shadow-2xl flex flex-col overflow-hidden">
          {/* Top Bar */}
          <div className="flex items-center justify-between px-6 py-3 bg-gray-900 border-b border-gray-700">
            <div className="text-gray-300 font-semibold text-lg">
              Meeting ID: <span className="font-mono">{roomId}</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setGridLayout(!gridLayout)}
                className="text-white bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded"
              >
                {gridLayout ? 'Speaker View' : 'Grid View'}
              </button>
              <button
                onClick={() => setShowParticipants(!showParticipants)}
                className="text-white bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded flex items-center space-x-1"
                title="Show Participants"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0110 11.5a5 5 0 01-1.57-3.17A6.97 6.97 0 007 16c0 .34.024.673.07 1H4a2 2 0 01-2-2v-1.5a.5.5 0 01.5-.5h1.38l.06-.09a6.99 6.99 0 001.68-1.99l.14-.25H3.5a.5.5 0 01-.5-.5v-1.5a2 2 0 012-2h1.77a5.008 5.008 0 015.46 0H14.5a2 2 0 012 2v1.5a.5.5 0 01-.5.5h-1.7l.14.25a6.99 6.99 0 001.68 1.99l.06.09H15.5a.5.5 0 01.5.5V15a2 2 0 01-2 2h-1.07z" />
                </svg>
                <span>{1 + peers.length}</span> {/* Total participants = You + Peers */}
              </button>
            </div>
          </div>

          {/* Video Grid */}
          <div className="flex-1 flex">
            <div className="flex-1 relative bg-black p-4">
              <div
                className={`grid gap-4 h-full ${
                  gridLayout ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3' : 'grid-cols-1'
                }`}
              >
                {/* Local user video */}
                <MemoizedLocalVideo
                  localVideoRef={localVideoRef}
                  userName={userName}
                  isVideoMuted={isVideoMuted}
                  isAudioMuted={isAudioMuted}
                />

                {/* Peer videos - using memoized component */}
                {peers.map(peer => (
                  <MemoizedPeerVideo
                    key={`peer-video-${peer.id}`}
                    peer={peer}
                    setVideoRef={createVideoRefSetter(peer.id)}
                    hasStream={!!stablePeerStreams.current[peer.id]}
                    onRetry={handleRetryConnection}
                  />
                ))}

                {/* Screen share */}
                {(isScreenSharing || remoteScreenShare.stream) && (
                  <MemoizedScreenShare
                    isScreenSharing={isScreenSharing}
                    screenVideoRef={screenVideoRef}
                    remoteScreenShare={remoteScreenShare}
                  />
                )}
              </div>
            </div>

            {/* Side Panels Container */}
            <div className="w-80 flex flex-col border-l border-gray-700">
              {/* Participants Drawer (conditional) */}
              {showParticipants &&
                (() => {
                  // Log the peers state here
                  console.log('[Render] Participant list rendering with peers:', peers);
                  return (
                    <div className="bg-gray-850 text-white flex-1 flex flex-col">
                      <div className="px-4 py-2 font-semibold border-b border-gray-700 flex justify-between items-center">
                        <span>Participants ({1 + peers.length})</span>
                        <button
                          onClick={() => setShowParticipants(false)}
                          className="text-gray-400 hover:text-white"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {/* Local User */}
                        <div className="flex items-center space-x-3">
                          <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span>
                          <span className="truncate" title={userName || userId}>
                            {userName || 'You'} (You)
                          </span>
                        </div>
                        {/* Peers */}
                        {peers.map(peer => (
                          <div key={peer.id} className="flex items-center space-x-3">
                            <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span>
                            <span className="truncate" title={peer.name || peer.id}>
                              {peer.name || peer.id}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

              {/* Chat Panel (conditional or always visible below participants) */}
              {/* Adjust logic if you want chat and participants visible simultaneously */}
              {!showParticipants && (
                <div className="bg-gray-900 flex-1 flex flex-col">
                  <div className="bg-blue-600 text-white px-4 py-2 font-semibold">Chat</div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {chatMessages.length === 0 ? (
                      <div className="text-gray-400 text-center italic">No messages yet</div>
                    ) : (
                      chatMessages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`rounded-lg px-3 py-2 ${
                            msg.userId === userId
                              ? 'bg-blue-100 text-blue-900 ml-auto'
                              : 'bg-gray-700 text-white mr-auto'
                          }`}
                        >
                          <div className="text-xs font-bold mb-1">
                            {msg.userId === userId ? 'You' : msg.userId}
                          </div>
                          <div>{msg.text}</div>
                          <div className="text-[10px] text-gray-400 text-right mt-1">
                            {formatTime(msg.timestamp)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-2 border-t border-gray-700 flex">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={e => setMessageInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="flex-1 px-2 py-1 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none"
                    />
                    <button
                      onClick={sendChatMessage}
                      disabled={!messageInput.trim()}
                      className="ml-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded disabled:bg-gray-600"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between px-6 py-4 bg-gray-900 border-t border-gray-700">
            <div className="flex space-x-4">
              <button
                onClick={toggleAudio}
                className={`px-4 py-2 rounded-full flex items-center space-x-2 ${
                  isAudioMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                <span>{isAudioMuted ? '🔇 Unmute' : '🎤 Mute'}</span>
              </button>
              <button
                onClick={toggleVideo}
                className={`px-4 py-2 rounded-full flex items-center space-x-2 ${
                  isVideoMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                <span>{isVideoMuted ? '📷 Show Video' : '📷 Hide Video'}</span>
              </button>
              <button
                onClick={isScreenSharing ? stopScreenShare : startScreenShare}
                className={`px-4 py-2 rounded-full flex items-center space-x-2 ${
                  isScreenSharing
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                <span>{isScreenSharing ? '🖥️ Stop Sharing' : '🖥️ Share Screen'}</span>
              </button>
              <button
                onClick={isCallRecording ? stopCallRecording : startCallRecording}
                className={`px-4 py-2 rounded-full flex items-center space-x-2 ${
                  isCallRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                <span>{isCallRecording ? '⏹️ Stop Recording' : '⏺️ Record'}</span>
              </button>
            </div>
            <button
              onClick={leaveRoom}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full"
            >
              Leave Meeting
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoChat;
