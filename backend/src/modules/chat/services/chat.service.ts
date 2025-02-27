import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ChatRoom } from '../entities/chat-room.entity';
import { ChatMessage } from '../entities/chat-message.entity';
import { CustomLoggerService } from '../../../core/logger/custom-logger.service';
import { User } from '../../user/entities/user.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatRoom)
    private readonly chatRoomRepository: Repository<ChatRoom>,
    @InjectRepository(ChatMessage)
    private readonly chatMessageRepository: Repository<ChatMessage>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly logger: CustomLoggerService,
  ) {}

  async createRoom(name: string, createdById: number): Promise<ChatRoom> {
    try {
      const user = await this.userRepository.findOne({ where: { id: createdById } });
      if (!user) {
        throw new NotFoundException(`User with ID ${createdById} not found`);
      }

      const room = this.chatRoomRepository.create({
        name,
        createdBy: user,
        createdById: user.id
      });

      return await this.chatRoomRepository.save(room);
    } catch (error) {
      this.logger.error(`Error creating room: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findRoomById(id: string): Promise<ChatRoom> {
    try {
      const room = await this.chatRoomRepository.findOne({ 
        where: { id },
        relations: ['createdBy'] 
      });
      
      if (!room) {
        throw new NotFoundException(`Room with ID ${id} not found`);
      }
      
      return room;
    } catch (error) {
      this.logger.error(`Error finding room: ${error.message}`, error.stack);
      throw error;
    }
  }

  async saveMessage(content: string, userId: number, roomId: string): Promise<ChatMessage> {
    try {
      // Kiểm tra room có tồn tại không
      const room = await this.findRoomById(roomId);
      
      // Kiểm tra user có tồn tại không
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      
      // Tạo và lưu message
      const message = this.chatMessageRepository.create({
        content,
        user,
        room,
        userId: user.id,
        roomId: room.id
      });
      
      return await this.chatMessageRepository.save(message);
    } catch (error) {
      this.logger.error(`Error saving message: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getRoomMessages(roomId: string, limit: number = 50, before?: Date): Promise<ChatMessage[]> {
    try {
      const queryBuilder = this.chatMessageRepository.createQueryBuilder('message')
        .where('message.roomId = :roomId', { roomId })
        .leftJoinAndSelect('message.user', 'user')
        .orderBy('message.createdAt', 'DESC')
        .take(limit);
      
      // Nếu có tham số before, thêm điều kiện lọc
      if (before) {
        queryBuilder.andWhere('message.createdAt < :before', { before });
      }
      
      return await queryBuilder.getMany();
    } catch (error) {
      this.logger.error(`Error getting room messages: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getRooms(): Promise<ChatRoom[]> {
    try {
      return await this.chatRoomRepository.find({
        relations: ['createdBy'],
        order: { createdAt: 'DESC' }
      });
    } catch (error) {
      this.logger.error(`Error getting rooms: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getMessageById(id: string): Promise<ChatMessage> {
    return this.chatMessageRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async deleteMessage(id: string): Promise<void> {
    const result = await this.chatMessageRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
  }

  async updateMessage(id: string, content: string): Promise<ChatMessage> {
    const message = await this.getMessageById(id);
    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
    
    message.content = content;
    return this.chatMessageRepository.save(message);
  }
} 