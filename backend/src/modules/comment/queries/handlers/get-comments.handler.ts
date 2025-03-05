import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCommentsQuery } from '../impl/get-comments.query';
import { CommentRepository } from '../../repositories/comment.repository';
import { CommentResponseDto } from '../../dto/comment-response.dto';
import { plainToInstance } from 'class-transformer';

@QueryHandler(GetCommentsQuery)
export class GetCommentsHandler implements IQueryHandler<GetCommentsQuery> {
  constructor(private commentRepository: CommentRepository) {}

  async execute(query: GetCommentsQuery) {
    const { postId, page, limit } = query;
    const [comments, total] = await this.commentRepository.findAll(postId, page, limit);
    

    const transformedComments = plainToInstance(CommentResponseDto, comments, {
      excludeExtraneousValues: false
    });

    return {
      items: transformedComments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
} 