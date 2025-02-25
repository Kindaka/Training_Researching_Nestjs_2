import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateCommentCommand } from '../impl/create-comment.command';
import { CommentRepository } from '../../repositories/comment.repository';

@CommandHandler(CreateCommentCommand)
export class CreateCommentHandler implements ICommandHandler<CreateCommentCommand> {
  constructor(private commentRepository: CommentRepository) {}

  async execute(command: CreateCommentCommand) {
    const { createCommentDto, userId } = command;
    return this.commentRepository.create(createCommentDto, userId);
  }
} 