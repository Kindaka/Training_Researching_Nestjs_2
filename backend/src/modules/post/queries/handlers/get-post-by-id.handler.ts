import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { GetPostByIdQuery } from '../impl/get-post-by-id.query';
import { PostRepository } from '../../repositories/post.repository';

@QueryHandler(GetPostByIdQuery)
export class GetPostByIdHandler implements IQueryHandler<GetPostByIdQuery> {
  constructor(private postRepository: PostRepository) {}

  async execute(query: GetPostByIdQuery) {
    const { id } = query;
    
    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return post;
  }
} 