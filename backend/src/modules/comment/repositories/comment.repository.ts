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
    const [rootComments, total] = await this.repository.findAndCount({
      where: { 
        post: { id: postId },
        parent: IsNull()
      },
      relations: [
        'user',
        'post',
        'replies',
        'replies.user'
      ],
      select: {
        user: {
          id: true,
          email: true,
          fullName: true,
          createdAt: true,
          updatedAt: true,
        },
        replies: {
          id: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          user: {
            id: true,
            email: true,
            fullName: true,
            createdAt: true,
            updatedAt: true,
          }
        }
      },  
      skip: (page - 1) * limit,
      take: limit,
      order: { 
        createdAt: 'DESC',
        replies: {
          createdAt: 'ASC'
        }
      },
    });

    return [rootComments, total];
  }

  async findById(id: number): Promise<Comment> {
    const comment = await this.repository.findOne({
      where: { id },
      relations: [
        'user',
        'post',
        'parent',
        'replies',
        'replies.user'
      ],
      select: {
        user: {
          id: true,
          email: true,
          fullName: true,
          createdAt: true,
          updatedAt: true,
        },
        replies: {
          id: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          user: {
            id: true,
            email: true,
            fullName: true,
            createdAt: true,
            updatedAt: true,
          }
        }
      },
    });
    
    if (!comment) {
      throw new NotFoundException(`Comment #${id} not found`);
    }

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