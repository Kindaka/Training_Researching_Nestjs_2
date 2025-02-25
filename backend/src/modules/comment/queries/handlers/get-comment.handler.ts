import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { GetCommentQuery } from '../impl/get-comment.query';
import { CommentRepository } from '../../repositories/comment.repository';

@QueryHandler(GetCommentQuery)
export class GetCommentHandler implements IQueryHandler<GetCommentQuery> {
  constructor(private commentRepository: CommentRepository) {}

  async execute(query: GetCommentQuery) {
    const comment = await this.commentRepository.findById(query.id);
    if (!comment) {
      throw new NotFoundException(`Comment #${query.id} not found`);
    }
    return comment;
  }
} 