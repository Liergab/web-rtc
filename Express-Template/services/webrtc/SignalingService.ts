import { WebSocket, WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';

interface Room {
  id: string;
  clients: Map<string, WebSocket>;
}

class SignalingService {
  private wss: WebSocketServer | null = null;
  private rooms: Map<string, Room> = new Map();
  
  initialize(server: any) {
    this.wss = new WebSocketServer({ server });
    
    this.wss.on('connection', this.handleConnection.bind(this));
    
    console.log('WebRTC Signaling Service initialized');
  }
  
  private handleConnection(ws: WebSocket) {
    console.log('New WebSocket connection established');
    
    // We'll use the user ID from the client when they join
    // Default to a UUID but this will be overridden when they join a room
    let clientId = uuidv4();
    
    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message.toString());
        
        // If join message, use the provided userId
        if (data.type === 'join' && data.userId) {
          clientId = data.userId;
          console.log(`Client ID set to ${clientId} from join message`);
        }
        
        this.handleMessage(ws, clientId, data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      // Remove this client from all rooms
      this.rooms.forEach((room, roomId) => {
        if (room.clients.has(clientId)) {
          room.clients.delete(clientId);
          
          // Notify other clients in the room
          this.broadcastToRoom(roomId, {
            type: 'user-left',
            userId: clientId
          }, clientId);
          
          console.log(`User ${clientId} left room ${roomId}`);
          
          // Clean up empty rooms
          if (room.clients.size === 0) {
            this.rooms.delete(roomId);
            console.log(`Room ${roomId} deleted (empty)`);
          }
        }
      });
    });
  }
  
  private handleMessage(ws: WebSocket, clientId: string, data: any) {
    console.log(`Received message type: ${data.type} from client ${clientId}`);
    
    switch (data.type) {
      case 'join':
        this.handleJoin(ws, clientId, data.room);
        break;
      case 'leave':
        this.handleLeave(clientId, data.room);
        break;
      case 'offer':
        console.log(`Forwarding offer from ${data.userId} to ${data.targetUserId}`);
        // Forward signaling messages to the target peer
        this.forwardMessage(data);
        break;
      case 'answer':
        console.log(`Forwarding answer from ${data.userId} to ${data.targetUserId}`);
        this.forwardMessage(data);
        break;
      case 'ice-candidate':
        console.log(`Forwarding ICE candidate from ${data.userId} to ${data.targetUserId}`);
        this.forwardMessage(data);
        break;
      case 'chat-message':
        console.log(`Broadcasting chat message from ${data.userId} in room ${data.room}`);
        this.broadcastChatMessage(data);
        break;
      default:
        console.warn('Unknown message type:', data.type);
    }
  }
  
  private handleJoin(ws: WebSocket, clientId: string, roomId: string) {
    // Create the room if it doesn't exist
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        id: roomId,
        clients: new Map()
      });
      console.log(`Room ${roomId} created`);
    }
    
    const room = this.rooms.get(roomId)!;
    
    // Add the client to the room
    room.clients.set(clientId, ws);
    
    console.log(`User ${clientId} joined room ${roomId}`);
    
    // Notify the new client about existing clients in the room
    room.clients.forEach((_, existingClientId) => {
      if (existingClientId !== clientId) {
        // Tell the new user about existing users
        this.sendTo(ws, {
          type: 'user-joined',
          userId: existingClientId
        });
        
        // Tell existing users about the new user
        const existingClient = room.clients.get(existingClientId);
        if (existingClient) {
          this.sendTo(existingClient, {
            type: 'user-joined',
            userId: clientId
          });
        }
      }
    });
  }
  
  private handleLeave(clientId: string, roomId: string) {
    if (this.rooms.has(roomId)) {
      const room = this.rooms.get(roomId)!;
      
      // Remove the client from the room
      room.clients.delete(clientId);
      
      // Notify other clients in the room
      this.broadcastToRoom(roomId, {
        type: 'user-left',
        userId: clientId
      }, clientId);
      
      console.log(`User ${clientId} left room ${roomId}`);
      
      // Clean up empty rooms
      if (room.clients.size === 0) {
        this.rooms.delete(roomId);
        console.log(`Room ${roomId} deleted (empty)`);
      }
    }
  }
  
  private forwardMessage(data: any) {
    const { targetUserId } = data;
    
    // Find the target client in any room
    for (const room of this.rooms.values()) {
      if (room.clients.has(targetUserId)) {
        const targetWs = room.clients.get(targetUserId)!;
        this.sendTo(targetWs, data);
        return;
      }
    }
    
    console.warn(`Target client ${targetUserId} not found for message`);
  }
  
  private broadcastToRoom(roomId: string, data: any, excludeClientId?: string) {
    if (!this.rooms.has(roomId)) return;
    
    const room = this.rooms.get(roomId)!;
    
    room.clients.forEach((ws, id) => {
      if (!excludeClientId || id !== excludeClientId) {
        this.sendTo(ws, data);
      }
    });
  }
  
  private sendTo(ws: WebSocket, data: any) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  private broadcastChatMessage(data: any) {
    const { room, userId } = data;
    
    if (!room || !this.rooms.has(room)) {
      console.warn(`Attempted to send chat message to non-existent room: ${room}`);
      return;
    }
    
    // Broadcast to everyone in the room except the sender
    this.broadcastToRoom(room, data, userId);
    console.log(`Chat message broadcasted to room ${room}`);
  }
}

export default new SignalingService(); 