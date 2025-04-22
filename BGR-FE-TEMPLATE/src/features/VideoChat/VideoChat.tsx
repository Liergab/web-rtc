import { useState, useEffect, useRef } from 'react';
import './VideoChat.css';
import { useReactMediaRecorder } from 'react-media-recorder';

interface PeerConnection {
  id: string;
  connection: RTCPeerConnection;
  stream?: MediaStream;
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

const VideoChat = () => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
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
  const wsRef = useRef<WebSocket | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const peerVideoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

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

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setLocalStream(stream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const connectToRoom = () => {
    if (!roomId || !localStream) {
      alert('Please enter a room ID and start your video');
      return;
    }

    // Connect to WebSocket server
    const serverUrl = `ws://${window.location.hostname}:8080`;
    wsRef.current = new WebSocket(serverUrl);

    wsRef.current.onopen = () => {
      console.log('Connected to signaling server');
      sendSignal({
        type: 'join',
        room: roomId,
        userId: userId,
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

  const handleSignalingData = (data: any) => {
    switch (data.type) {
      case 'user-joined':
        // Create a new peer connection for the user who joined
        createPeerConnection(data.userId, true);
        break;
      case 'user-left':
        // Remove the peer connection for the user who left
        setPeers(peers => peers.filter(peer => peer.id !== data.userId));
        break;
      case 'offer':
        handleOffer(data);
        break;
      case 'answer':
        handleAnswer(data);
        break;
      case 'ice-candidate':
        handleIceCandidate(data);
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
      default:
        console.log('Unknown signal type:', data.type);
    }
  };

  const createPeerConnection = (peerId: string, isInitiator: boolean) => {
    console.log(`Creating peer connection with ${peerId}, initiator: ${isInitiator}`);

    // Check if peer already exists
    if (peers.find(peer => peer.id === peerId)) {
      console.log(`Peer ${peerId} already exists, not creating new connection`);
      return;
    }

    // STUN and TURN servers for NAT traversal
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        // Add free TURN servers
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

    const peerConnection = new RTCPeerConnection(configuration);

    // Add local stream to peer connection
    if (localStream) {
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
      });
    }

    // Handle ICE candidates
    peerConnection.onicecandidate = event => {
      if (event.candidate) {
        console.log(`Sending ICE candidate to ${peerId}`);
        sendSignal({
          type: 'ice-candidate',
          candidate: event.candidate,
          userId: userId,
          targetUserId: peerId,
        });
      }
    };

    // Track connection state changes
    peerConnection.oniceconnectionstatechange = () => {
      console.log(`ICE connection state with ${peerId}: ${peerConnection.iceConnectionState}`);
      if (
        peerConnection.iceConnectionState === 'failed' ||
        peerConnection.iceConnectionState === 'disconnected' ||
        peerConnection.iceConnectionState === 'closed'
      ) {
        console.log(`Connection with ${peerId} ${peerConnection.iceConnectionState}, cleaning up`);
        setPeers(prevPeers => prevPeers.filter(p => p.id !== peerId));
      }
    };

    // Handle incoming streams
    peerConnection.ontrack = event => {
      console.log(`Received tracks from ${peerId}`, event.streams);
      const stream = event.streams[0];

      if (!stream) {
        console.error(`No stream received from ${peerId}`);
        return;
      }

      console.log(`Stream from ${peerId} has video tracks:`, stream.getVideoTracks().length);
      console.log(`Stream from ${peerId} has audio tracks:`, stream.getAudioTracks().length);

      setPeers(prevPeers => {
        // First check if this peer already exists
        const peerExists = prevPeers.some(p => p.id === peerId);

        if (peerExists) {
          // Update the existing peer with the stream
          console.log(`Updating existing peer ${peerId} with new stream`);
          return prevPeers.map(peer => {
            if (peer.id === peerId) {
              return { ...peer, stream };
            }
            return peer;
          });
        } else {
          // Add new peer with stream
          console.log(`Adding new peer ${peerId} with stream`);
          return [...prevPeers, { id: peerId, connection: peerConnection, stream }];
        }
      });
    };

    // Add the new peer to the state without the stream initially
    setPeers(prevPeers => {
      if (!prevPeers.some(p => p.id === peerId)) {
        return [...prevPeers, { id: peerId, connection: peerConnection }];
      }
      return prevPeers;
    });

    // If this peer is the initiator, create and send an offer
    if (isInitiator && localStream) {
      console.log(`Creating offer for ${peerId}`);
      peerConnection
        .createOffer()
        .then(offer => {
          console.log(`Setting local description for ${peerId}`);
          return peerConnection.setLocalDescription(offer);
        })
        .then(() => {
          console.log(`Sending offer to ${peerId}`);
          sendSignal({
            type: 'offer',
            offer: peerConnection.localDescription,
            userId: userId,
            targetUserId: peerId,
          });
        })
        .catch(error => console.error('Error creating offer:', error));
    }

    return peerConnection;
  };

  const handleOffer = async (data: any) => {
    const peerId = data.userId;
    console.log(`Received offer from ${peerId}`);

    let peerConnection = peers.find(peer => peer.id === peerId)?.connection;

    if (!peerConnection) {
      console.log(`Creating new peer connection for ${peerId} as answer`);
      peerConnection = createPeerConnection(peerId, false);
    }

    if (peerConnection) {
      console.log(`Setting remote description for ${peerId}`);
      await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));

      console.log(`Creating answer for ${peerId}`);
      const answer = await peerConnection.createAnswer();

      console.log(`Setting local description for ${peerId}`);
      await peerConnection.setLocalDescription(answer);

      console.log(`Sending answer to ${peerId}`);
      sendSignal({
        type: 'answer',
        answer: peerConnection.localDescription,
        userId: userId,
        targetUserId: peerId,
      });
    }
  };

  const handleAnswer = (data: any) => {
    const peerId = data.userId;
    console.log(`Received answer from ${peerId}`);

    const peerConnection = peers.find(peer => peer.id === data.userId)?.connection;

    if (peerConnection) {
      console.log(`Setting remote description for ${peerId} from answer`);
      peerConnection
        .setRemoteDescription(new RTCSessionDescription(data.answer))
        .then(() => console.log(`Successfully set remote description for ${peerId}`))
        .catch(error => console.error(`Error setting remote description for ${peerId}:`, error));
    } else {
      console.error(`No peer connection found for ${peerId}`);
    }
  };

  const handleIceCandidate = (data: any) => {
    const peerId = data.userId;
    console.log(`Received ICE candidate from ${peerId}`);

    const peerConnection = peers.find(peer => peer.id === data.userId)?.connection;

    if (peerConnection) {
      console.log(`Adding ICE candidate for ${peerId}`);
      peerConnection
        .addIceCandidate(new RTCIceCandidate(data.candidate))
        .then(() => console.log(`Successfully added ICE candidate for ${peerId}`))
        .catch(error => console.error(`Error adding ICE candidate for ${peerId}:`, error));
    } else {
      console.error(`No peer connection found for ${peerId} to add ICE candidate`);
    }
  };

  const sendSignal = (signal: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(signal));
    }
  };

  const leaveRoom = () => {
    if (wsRef.current) {
      sendSignal({
        type: 'leave',
        room: roomId,
        userId: userId,
      });

      wsRef.current.close();
    }

    // Close all peer connections
    peers.forEach(peer => {
      peer.connection.close();
    });

    setPeers([]);
    setIsConnected(false);
    setChatMessages([]);
    setRecordings([]);
    setShowRecordings(false);
  };

  const stopVideo = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
    }
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

  // Stop recording and upload to server
  const stopRecording = async () => {
    stopMediaRecording();

    // Wait for the mediaBlobUrl to be available (it's set asynchronously)
    setTimeout(async () => {
      if (mediaBlobUrl) {
        try {
          setRecordingStatus('Uploading recording...');

          // Fetch the blob from the mediaBlobUrl
          const response = await fetch(mediaBlobUrl);
          const blob = await response.blob();

          // Convert blob to base64
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = async () => {
            const base64data = reader.result;

            // Prepare the recording data
            const recordingData = {
              userId,
              roomId,
              fileName: `recording-${roomId}-${Date.now()}.webm`,
              fileData: base64data,
              mimeType: blob.type,
              duration: 0, // We don't have duration info easily available
            };

            // Upload to server
            const uploadResponse = await fetch(
              `http://${window.location.hostname}:8080/v1/api/recordings`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(recordingData),
              }
            );

            const result = await uploadResponse.json();

            if (result.success) {
              setRecordingStatus('Recording uploaded successfully!');
              // Clear the blob URL to free memory
              clearBlobUrl();
              // Refresh the recordings list
              fetchRecordings();
            } else {
              setRecordingStatus('Failed to upload recording');
            }
          };
        } catch (error) {
          console.error('Error uploading recording:', error);
          setRecordingStatus('Error uploading recording');
        }
      }
    }, 1000);
  };

  const downloadRecording = (id: string, fileName: string) => {
    window.open(`http://${window.location.hostname}:8080/v1/api/recordings/${id}`, '_blank');
  };

  return (
    <div className="video-chat-container">
      <h1>WebRTC Video Chat</h1>

      <div className="setup-container">
        <div className="room-controls">
          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={e => setRoomId(e.target.value)}
            disabled={isConnected}
          />
          {!isConnected ? (
            <button
              onClick={connectToRoom}
              disabled={!localStream || !roomId}
              className="connect-btn"
            >
              Join Room
            </button>
          ) : (
            <button onClick={leaveRoom} className="leave-btn">
              Leave Room
            </button>
          )}
        </div>

        <div className="video-controls">
          {!localStream ? (
            <button onClick={startVideo} className="start-video-btn">
              Start Video
            </button>
          ) : (
            <button onClick={stopVideo} className="stop-video-btn">
              Stop Video
            </button>
          )}

          {isConnected && localStream && (
            <>
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="record-btn"
                  disabled={status === 'recording'}
                >
                  Start Recording
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="stop-record-btn"
                  disabled={status !== 'recording'}
                >
                  Stop Recording
                </button>
              )}

              <button onClick={() => setShowRecordings(!showRecordings)} className="recordings-btn">
                {showRecordings ? 'Hide Recordings' : 'Show Recordings'}
              </button>
            </>
          )}
        </div>
      </div>

      {recordingStatus && <div className="recording-status">{recordingStatus}</div>}

      {showRecordings && (
        <div className="recordings-list">
          <h3>Recordings</h3>
          {recordings.length === 0 ? (
            <p>No recordings yet</p>
          ) : (
            <ul>
              {recordings.map(recording => (
                <li key={recording._id}>
                  <span>{recording.fileName}</span>
                  <span>{new Date(recording.createdAt).toLocaleString()}</span>
                  <button onClick={() => downloadRecording(recording._id, recording.fileName)}>
                    Download
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="video-and-chat-container">
        <div className="video-grid">
          <div className="video-item local-video">
            <video ref={localVideoRef} autoPlay muted playsInline />
            <div className="video-label">You</div>
          </div>

          {peers.map(peer => (
            <div key={peer.id} className="video-item">
              <video
                autoPlay
                playsInline
                ref={el => {
                  peerVideoRefs.current[peer.id] = el;
                  if (el && peer.stream && el.srcObject !== peer.stream) {
                    console.log(`Initializing video element for peer ${peer.id}`);
                    el.srcObject = peer.stream;
                  }
                }}
              />
              <div className="video-label">{peer.id}</div>
            </div>
          ))}
        </div>

        {isConnected && (
          <div className="chat-container">
            <div className="chat-header">
              <h3>Chat</h3>
            </div>
            <div className="chat-messages" ref={chatContainerRef}>
              {chatMessages.length === 0 ? (
                <div className="no-messages">No messages yet</div>
              ) : (
                chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`chat-message ${msg.userId === userId ? 'my-message' : 'other-message'}`}
                  >
                    <div className="message-sender">
                      {msg.userId === userId ? 'You' : msg.userId}
                    </div>
                    <div className="message-content">{msg.text}</div>
                    <div className="message-time">{formatTime(msg.timestamp)}</div>
                  </div>
                ))
              )}
            </div>
            <div className="chat-input">
              <input
                type="text"
                placeholder="Type a message..."
                value={messageInput}
                onChange={e => setMessageInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={!isConnected}
              />
              <button onClick={sendChatMessage} disabled={!isConnected || !messageInput.trim()}>
                Send
              </button>
            </div>
          </div>
        )}
      </div>

      {isConnected && (
        <div className="room-info">
          <p>
            Room ID: <strong>{roomId}</strong>
          </p>
          <p>
            Connected Users: <strong>{peers.length + 1}</strong>
          </p>
        </div>
      )}
    </div>
  );
};

export default VideoChat;
