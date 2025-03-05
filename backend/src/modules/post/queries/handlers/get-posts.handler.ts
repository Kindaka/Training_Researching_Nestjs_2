import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPostsQuery } from '../impl/get-posts.query';
import { PostRepository } from '../../repositories/post.repository';
import { plainToInstance } from 'class-transformer';
import { PostResponseDto } from '../../dto/post-response.dto';

@QueryHandler(GetPostsQuery)
export class GetPostsHandler implements IQueryHandler<GetPostsQuery> {
  constructor(private postRepository: PostRepository) {}

  async execute(query: GetPostsQuery) {
    const { page, limit } = query;
    const [posts, total] = await this.postRepository.findAll(page, limit);
    
    // Transform the post entities to DTOs
    const transformedPosts = plainToInstance(PostResponseDto, posts, {
      excludeExtraneousValues: false
    });
    
    return {
      items: transformedPosts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
} 