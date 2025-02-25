import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCommentsQuery } from '../impl/get-comments.query';
import { CommentRepository } from '../../repositories/comment.repository';

@QueryHandler(GetCommentsQuery)
export class GetCommentsHandler implements IQueryHandler<GetCommentsQuery> {
  constructor(private commentRepository: CommentRepository) {}

  async execute(query: GetCommentsQuery) {
    const { postId, page, limit } = query;
    const [comments, total] = await this.commentRepository.findAll(postId, page, limit);
    
    return {
      items: comments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
} 