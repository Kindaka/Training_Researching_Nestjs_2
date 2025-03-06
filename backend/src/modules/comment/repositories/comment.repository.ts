import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { IsNull } from 'typeorm';

@Injectable()
export class CommentRepository {
  constructor(
    @InjectRepository(Comment)
    private readonly repository: Repository<Comment>,
  ) {}

  async findAll(postId: number, page: number = 1, limit: number = 10): Promise<[Comment[], number]> {
    // Lấy root comments
    const [rootComments, total] = await this.repository.findAndCount({
      where: { 
        post: { id: postId },
        parent: IsNull()
      },
      relations: ['user', 'post'],
      select: {
        user: {
          id: true,
          email: true,
          fullName: true,
          createdAt: true,
          updatedAt: true,
        }
      },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' }
    });

    // Lấy tất cả replies cho mỗi root comment
    for (const comment of rootComments) {
      comment.replies = await this.findRepliesRecursively(comment.id);
    }

    return [rootComments, total];
  }

  // Hàm đệ quy để lấy tất cả replies và replies của replies
  async findRepliesRecursively(parentId: number): Promise<Comment[]> {
    const replies = await this.repository.find({
      where: { parent: { id: parentId } },
      relations: ['user'],
      select: {
        user: {
          id: true,
          email: true,
          fullName: true,
          createdAt: true,
          updatedAt: true,
        }
      },
      order: { createdAt: 'ASC' }
    });

    // Đệ quy lấy replies cho mỗi reply
    for (const reply of replies) {
      reply.replies = await this.findRepliesRecursively(reply.id);
    }

    return replies;
  }

  async findById(id: number): Promise<Comment> {
    const comment = await this.repository.findOne({
      where: { id },
      relations: [
        'user',
        'post',
        'parent'
      ],
      select: {
        user: {
          id: true,
          email: true,
          fullName: true,
          createdAt: true,
          updatedAt: true,
        }
      },
    });
    
    if (!comment) {
      throw new NotFoundException(`Comment #${id} not found`);
    }

    // Lấy tất cả replies đệ quy
    comment.replies = await this.findRepliesRecursively(comment.id);

    return comment;
  }

  async create(createCommentDto: CreateCommentDto, userId: number): Promise<Comment> {
    const comment = this.repository.create({
      content: createCommentDto.content,
      user: { id: userId },
      post: { id: createCommentDto.postId },
    });

    if (createCommentDto.parentId) {
      const parentComment = await this.repository.findOne({
        where: { id: createCommentDto.parentId }
      });
      
      if (!parentComment) {
        throw new NotFoundException(`Parent comment #${createCommentDto.parentId} not found`);
      }
      
      comment.parent = parentComment;
    }

    console.log('Creating comment:', comment);
    return this.repository.save(comment);
  }

  async update(id: number, updateCommentDto: UpdateCommentDto): Promise<Comment> {
    const comment = await this.findById(id);
    
    if (updateCommentDto.content) {
      comment.content = updateCommentDto.content;
    }

    return this.repository.save(comment);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
} 