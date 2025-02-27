import { Controller, Get, Post, Body, Param, UseGuards, Request, Delete, Patch, Query, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ChatService } from '../services/chat.service';
import { CreateRoomDto } from '../dto/create-room.dto';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { SendMessageDto } from '../dto/send-message.dto';

@ApiTags('Chat')
@ApiBearerAuth()
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @ApiOperation({ summary: 'Create a new chat room' })
  @ApiResponse({ status: 201, description: 'Room created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(AuthGuard)
  @Post('rooms')
  async createRoom(@Request() req, @Body() createRoomDto: CreateRoomDto) {
    const room = await this.chatService.createRoom(createRoomDto.name, req.user.id);
    return { success: true, room };
  }

  @ApiOperation({ summary: 'Get all chat rooms' })
  @ApiResponse({ status: 200, description: 'Return all chat rooms' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(AuthGuard)
  @Get('rooms')
  async getRooms() {
    const rooms = await this.chatService.getRooms();
    return { success: true, rooms };
  }

  @ApiOperation({ summary: 'Get messages from a specific room' })
  @ApiParam({ name: 'id', description: 'Room ID' })
  @ApiQuery({ name: 'limit', required: false, description: 'Maximum number of messages to return' })
  @ApiQuery({ name: 'before', required: false, description: 'Get messages before this timestamp (ISO format)' })
  @ApiResponse({ status: 200, description: 'Return messages from the room' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  @UseGuards(AuthGuard)
  @Get('rooms/:id/messages')
  async getRoomMessages(
    @Param('id') id: string,
    @Query('limit') limit?: number,
    @Query('before') before?: string
  ) {
    // Chuyển đổi tham số before thành Date nếu có
    const beforeDate = before ? new Date(before) : undefined;
    
    const messages = await this.chatService.getRoomMessages(id, limit ? parseInt(limit.toString()) : 50, beforeDate);
    
    return messages.map(message => ({
      id: message.id,
      content: message.content,
      userId: message.userId,
      username: message.user?.fullName || 'Unknown User',
      createdAt: message.createdAt
    }));
  }

  @ApiOperation({ summary: 'Send a message to a room' })
  @ApiParam({ name: 'id', description: 'Room ID' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  @UseGuards(AuthGuard)
  @Post('rooms/:id/messages')
  async sendMessage(
    @Param('id') id: string,
    @Body() sendMessageDto: SendMessageDto,
    @Request() req
  ) {
    const room = await this.chatService.findRoomById(id);
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    
    const message = await this.chatService.saveMessage(
      sendMessageDto.message,
      req.user.id,
      id
    );
    
    return { success: true, message };
  }

  @ApiOperation({ summary: 'Delete a message' })
  @ApiParam({ name: 'id', description: 'Message ID' })
  @ApiResponse({ status: 200, description: 'Message deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not message owner' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  @UseGuards(AuthGuard)
  @Delete('messages/:id')
  async deleteMessage(
    @Param('id') id: string,
    @Request() req
  ) {
    const message = await this.chatService.getMessageById(id);
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    
    // Only allow message owner or admin to delete
    if (message.userId !== req.user.id && req.user.role !== 'ADMIN') {
      throw new ForbiddenException('You can only delete your own messages');
    }
    
    await this.chatService.deleteMessage(id);
    return { success: true };
  }

  @ApiOperation({ summary: 'Edit a message' })
  @ApiParam({ name: 'id', description: 'Message ID' })
  @ApiResponse({ status: 200, description: 'Message updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not message owner' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  @UseGuards(AuthGuard)
  @Patch('messages/:id')
  async updateMessage(
    @Param('id') id: string,
    @Body() updateMessageDto: { content: string },
    @Request() req
  ) {
    const message = await this.chatService.getMessageById(id);
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    
    // Only allow message owner to edit
    if (message.userId !== req.user.id) {
      throw new ForbiddenException('You can only edit your own messages');
    }
    
    const updatedMessage = await this.chatService.updateMessage(id, updateMessageDto.content);
    return { success: true, message: updatedMessage };
  }
} 