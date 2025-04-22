# WebRTC Video Chat Application

A real-time peer-to-peer video chat application using WebRTC, React, and Express. This implementation requires no third-party subscription services.

## Features

- Real-time video and audio communication
- Pure WebRTC implementation with no third-party services
- Room-based video chat with multiple participants
- Fully responsive UI
- Works across different networks using STUN servers (free Google STUN servers)

## Project Structure

This project consists of two main parts:

1. **Frontend (BGR-FE-TEMPLATE)**: React-based frontend with WebRTC client implementation
2. **Backend (Express-Template)**: Express.js based signaling server for WebRTC

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Running Frontend and Backend Concurrently

To set up and run both the frontend and backend with a single command:

1. Install dependencies for the entire project:
   ```
   npm run install-all
   ```

2. Start both servers concurrently:
   ```
   npm run dev
   ```

This will run both the backend and frontend servers simultaneously.

### Backend Setup (Individual)

1. Navigate to the Express-Template directory:
   ```
   cd Express-Template
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   npm run dev
   ```

The Express server will start on port 3000 (or the port specified in your environment) and will also serve as the WebSocket server for WebRTC signaling.

### Frontend Setup

1. Navigate to the BGR-FE-TEMPLATE directory:
   ```
   cd BGR-FE-TEMPLATE
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Update the WebSocket server URL:
   - Open `src/features/VideoChat/VideoChat.tsx`
   - Make sure the WebSocket server URL points to your backend server

4. Start the development server:
   ```
   npm run dev
   ```

The React application will start, typically on port 5173.

## Usage

1. Open your browser and navigate to the frontend application (e.g., http://localhost:5173)
2. Click on "Try Video Chat" in the homepage or navigate directly to /video-chat
3. Click "Start Video" to enable your camera and microphone
4. Enter a room ID (any string) and click "Join Room"
5. Share the room ID with others to have them join the same room
6. To leave the room, click "Leave Room"

## How It Works

### WebRTC Process

1. **User Media Access**: The application requests access to your camera and microphone
2. **Signaling**: When joining a room, the frontend connects to the signaling server via WebSockets
3. **Peer Discovery**: The signaling server informs all users in a room about each other
4. **Connection Establishment**: WebRTC uses ICE to establish the most efficient connection between peers
5. **Media Streaming**: Once connected, audio and video streams directly between peers without going through the server

### Signaling Server

The signaling server (Express backend) only facilitates the initial connection between peers. After the connection is established, all media data flows directly between the participants' browsers.

## Technologies Used

- **Frontend**:
  - React
  - TypeScript
  - WebRTC APIs
  - WebSockets
  - TailwindCSS

- **Backend**:
  - Express.js
  - TypeScript
  - WebSockets (ws)
  - UUID

## Limitations

- This implementation uses free public STUN servers for NAT traversal
- For users behind symmetric NATs or strict firewalls, a TURN server might be needed for connection (not included in this implementation)
- Video quality depends on network conditions and device capabilities

## License

This project is MIT licensed. See the LICENSE file for details. 