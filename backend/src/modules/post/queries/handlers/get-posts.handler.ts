import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPostsQuery } from '../impl/get-posts.query';
import { PostRepository } from '../../repositories/post.repository';

@QueryHandler(GetPostsQuery)
export class GetPostsHandler implements IQueryHandler<GetPostsQuery> {
  constructor(private postRepository: PostRepository) {}

  async execute(query: GetPostsQuery) {
    const { page, limit } = query;
    const [posts, total] = await this.postRepository.findAll(page, limit);
    
    return {
      items: posts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
} 