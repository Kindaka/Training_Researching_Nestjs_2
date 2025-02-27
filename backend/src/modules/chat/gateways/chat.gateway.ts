import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CustomLoggerService } from '../../../core/logger/custom-logger.service';
import { WsJwtGuard } from '../guards/ws-jwt.guard';
import { ChatService } from '../services/chat.service';
import { CreateRoomDto } from '../dto/create-room.dto';
import { JoinRoomDto } from '../dto/join-room.dto';
import { SendMessageDto } from '../dto/send-message.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer() server: Server;
  
  // Store active users and their rooms
  private activeUsers = new Map<string, { 
    userId: number, 
    username: string, 
    fullName?: string,
    socket: Socket 
  }>();
  private rooms = new Map<string, { name: string, users: Set<string> }>();

  constructor(
    private readonly logger: CustomLoggerService,
    private readonly jwtService: JwtService,
    private readonly chatService: ChatService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || 
                    client.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        this.logger.warn('Client tried to connect without token');
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      // Đảm bảo userId là số
      const userId = typeof payload.sub === 'string' ? parseInt(payload.sub, 10) : (payload.id || payload.sub);
      const username = payload.username;
      const fullName = payload.fullName; // Lấy fullName từ token

      // Lưu thông tin user vào socket data để dễ truy cập
      client.data = { userId, username, fullName };

      // Store user connection
      this.activeUsers.set(client.id, { 
        userId, 
        username, 
        fullName, // Lưu fullName
        socket: client 
      });
      
      this.logger.log(`Client connected: ${client.id}, User: ${fullName || username} (${userId})`);
      
      // Send list of available rooms to the user
      this.sendAvailableRooms(client);
    } catch (error) {
      this.logger.error('Error during WebSocket connection', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      // Lấy thông tin user từ activeUsers
      const user = this.activeUsers.get(client.id);
      if (user) {
        // Lưu thông tin user trước khi xóa
        const userId = user.userId;
        const username = user.username;
        const fullName = user.fullName;
        
        // Xóa user khỏi activeUsers
        this.activeUsers.delete(client.id);
        
        // Thông báo cho tất cả các room mà user đã tham gia
        this.rooms.forEach((room, roomId) => {
          if (room.users.has(client.id)) {
            // Xóa user khỏi room
            room.users.delete(client.id);
            
            // Thông báo cho các user khác trong room
            this.server.to(roomId).emit('userLeft', {
              userId,
              username,
              fullName // Thêm fullName vào thông báo
            });
            
            this.logger.log(`User ${fullName || username} (${userId}) left room: ${room.name} (${roomId})`);
            
            // Nếu room không còn user nào, xóa room khỏi memory
            if (room.users.size === 0) {
              this.rooms.delete(roomId);
              this.logger.log(`Room deleted from memory: ${room.name} (${roomId})`);
            }
          }
        });
        
        this.logger.log(`Client disconnected: ${client.id}, User: ${fullName || username} (${userId})`);
      } else {
        this.logger.log(`Client disconnected: ${client.id}, No user information found`);
      }
    } catch (error) {
      this.logger.error(`Error during WebSocket disconnection: ${error.message}`, error.stack);
    }
  }

  private sendAvailableRooms(client: Socket) {
    const rooms = Array.from(this.rooms.entries()).map(([id, room]) => ({
      id,
      name: room.name,
      userCount: room.users.size
    }));
    
    client.emit('availableRooms', rooms);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('createRoom')
  async createRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: CreateRoomDto
  ) {
    const user = this.activeUsers.get(client.id);
    
    try {
      // Save room to database
      const savedRoom = await this.chatService.createRoom(data.name, user.userId);
      const roomId = savedRoom.id;
      
      // Add to in-memory rooms
      this.rooms.set(roomId, {
        name: data.name,
        users: new Set<string>()
      });
      
      this.logger.log(`Room created: ${roomId}, Name: ${data.name}, By: ${user.username}`);
      
      // Broadcast to all clients that a new room is available
      this.server.emit('roomCreated', {
        id: roomId,
        name: data.name,
        createdBy: user.username
      });
      
      // Emit sự kiện trả về cho client gọi hàm
      client.emit('roomCreated', {
        id: roomId,
        name: data.name,
        createdBy: user.username
      });
      
      return { success: true, roomId };
    } catch (error) {
      this.logger.error(`Error creating room: ${error.message}`, error.stack);
      client.emit('error', { message: 'Failed to create room' });
      return { success: false, message: 'Failed to create room' };
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('joinRoom')
  async joinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinRoomDto
  ) {
    const { roomId, token } = data;
    
    try {
      // Kiểm tra room trong database
      const dbRoom = await this.chatService.findRoomById(roomId);
      if (!dbRoom) {
        this.logger.warn(`Room not found in database: ${roomId}`);
        client.emit('error', { message: 'Room not found' });
        return { success: false, message: 'Room not found' };
      }
      
      // Lấy thông tin user từ socket
      let user = this.activeUsers.get(client.id);
      
      // Nếu có token, extract thông tin user từ token
      if (token) {
        try {
          const payload = this.jwtService.verify(token);
          // Cập nhật thông tin user với fullName từ token
          if (user) {
            user = {
              ...user,
              userId: payload.id || payload.sub,
              username: payload.username,
              fullName: payload.fullName
            };
            this.activeUsers.set(client.id, user);
          }
        } catch (error) {
          this.logger.warn(`Invalid token provided: ${error.message}`);
        }
      }
      
      if (!user) {
        this.logger.warn(`User not found for client: ${client.id}`);
        client.emit('error', { message: 'User not authenticated' });
        return { success: false, message: 'User not authenticated' };
      }
      
      // Kiểm tra room trong memory
      let room = this.rooms.get(roomId);
      if (!room) {
        // Nếu room có trong database nhưng không có trong memory, tạo mới
        room = {
          name: dbRoom.name,
          users: new Set<string>()
        };
        this.rooms.set(roomId, room);
      }
      
      // Thêm user vào room
      room.users.add(client.id);
      
      // Join socket vào room
      await client.join(roomId);
      
      // Emit sự kiện joinedRoom cho client
      client.emit('joinedRoom', {
        roomId,
        roomName: room.name
      });
      
      // Thông báo cho các user khác trong room
      client.to(roomId).emit('userJoined', {
        userId: user.userId,
        username: user.username,
        fullName: user.fullName
      });
      
      this.logger.log(`User ${user.fullName || user.username} (${user.userId}) joined room: ${room.name} (${roomId})`);
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Error joining room: ${error.message}`, error.stack);
      client.emit('error', { message: 'Failed to join room' });
      return { success: false, message: 'Failed to join room' };
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('leaveRoom')
  leaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string }
  ) {
    const { roomId } = data;
    const room = this.rooms.get(roomId);
    
    if (!room) {
      client.emit('error', { message: 'Room not found' });
      return { success: false, message: 'Room not found' };
    }
    
    const user = this.activeUsers.get(client.id);
    
    // Remove user from room
    room.users.delete(client.id);
    
    // Leave the socket.io room
    client.leave(roomId);
    
    // Notify others in the room
    this.server.to(roomId).emit('userLeft', {
      userId: user.userId,
      username: user.username
    });
    
    this.logger.log(`User ${user.username} left room: ${room.name}`);
    
    // Emit sự kiện leftRoom cho client
    client.emit('leftRoom', { roomId });
    
    return { success: true };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('sendMessage')
  async sendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SendMessageDto
  ) {
    const { roomId, message, token } = data;
    
    this.logger.log(`Received message for room ${roomId}: ${message.substring(0, 30)}${message.length > 30 ? '...' : ''}`);
    
    try {
      // Kiểm tra room trong database
      const dbRoom = await this.chatService.findRoomById(roomId);
      if (!dbRoom) {
        this.logger.warn(`Room not found in database: ${roomId}`);
        client.emit('error', { message: 'Room not found' });
        return { success: false, message: 'Room not found' };
      }
      
      // Kiểm tra room trong memory
      const room = this.rooms.get(roomId);
      if (!room) {
        // Nếu room có trong database nhưng không có trong memory, tạo mới
        this.rooms.set(roomId, {
          name: dbRoom.name,
          users: new Set<string>([client.id])
        });
      } else if (!room.users.has(client.id)) {
        // Nếu user chưa join room, tự động join
        room.users.add(client.id);
        await client.join(roomId);
      }
      
      // Lấy thông tin user từ socket
      let user = this.activeUsers.get(client.id);
      
      // Nếu có token, extract thông tin user từ token
      if (token) {
        try {
          const payload = this.jwtService.verify(token);
          // Cập nhật thông tin user với fullName từ token
          if (user) {
            user = {
              ...user,
              userId: payload.id || payload.sub,
              username: payload.username,
              fullName: payload.fullName
            };
            this.activeUsers.set(client.id, user);
          }
        } catch (error) {
          this.logger.warn(`Invalid token provided: ${error.message}`);
        }
      }
      
      if (!user) {
        this.logger.warn(`User not found for client: ${client.id}`);
        client.emit('error', { message: 'User not authenticated' });
        return { success: false, message: 'User not authenticated' };
      }
      
      // Đảm bảo userId là số
      const userId = typeof user.userId === 'string' ? parseInt(user.userId, 10) : user.userId;
      
      // Save message to database
      const savedMessage = await this.chatService.saveMessage(
        message, 
        userId, 
        roomId
      );
      
      // Create message object
      const messageObj = {
        id: savedMessage.id,
        text: message,
        userId: userId,
        username: user.username,
        fullName: user.fullName,
        timestamp: new Date().toISOString()
      };
      
      // Send to everyone in the room including sender
      this.server.to(roomId).emit('newMessage', messageObj);
      
      this.logger.log(`Message sent in room ${roomId} by ${user.fullName || user.username} (${user.userId}): ${message.substring(0, 30)}${message.length > 30 ? '...' : ''}`);
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`, error.stack);
      client.emit('error', { message: 'Failed to send message' });
      return { success: false, message: 'Failed to send message' };
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('getRooms')
  getRooms() {
    const rooms = Array.from(this.rooms.entries()).map(([id, room]) => ({
      id,
      name: room.name,
      userCount: room.users.size
    }));
    
    return { success: true, rooms };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('getRoomMessages')
  async getRoomMessages(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string, limit?: number }
  ) {
    try {
      const messages = await this.chatService.getRoomMessages(data.roomId, data.limit);
      return { 
        success: true, 
        messages: messages.map(msg => ({
          id: msg.id,
          text: msg.content,
          userId: msg.userId,
          username: msg.user?.fullName || 'Unknown User',
          timestamp: msg.createdAt.toISOString()
        }))
      };
    } catch (error) {
      this.logger.error(`Error fetching room messages: ${error.message}`, error.stack);
      client.emit('error', { message: 'Failed to fetch messages' });
      return { success: false, message: 'Failed to fetch messages' };
    }
  }
} 