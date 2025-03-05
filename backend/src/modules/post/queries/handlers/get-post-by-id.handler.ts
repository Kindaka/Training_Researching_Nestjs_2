import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { GetPostByIdQuery } from '../impl/get-post-by-id.query';
import { PostRepository } from '../../repositories/post.repository';
import { plainToInstance } from 'class-transformer';
import { PostResponseDto } from '../../dto/post-response.dto';

@QueryHandler(GetPostByIdQuery)
export class GetPostByIdHandler implements IQueryHandler<GetPostByIdQuery> {
  constructor(private postRepository: PostRepository) {}

  async execute(query: GetPostByIdQuery) {
    const { id } = query;
    
    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // Transform the post entity to the DTO
    return plainToInstance(PostResponseDto, post, {
      excludeExtraneousValues: false
    });
  }
} 