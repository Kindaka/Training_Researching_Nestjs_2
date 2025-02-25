import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UpdateCommentCommand } from '../impl/update-comment.command';
import { CommentRepository } from '../../repositories/comment.repository';

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentHandler implements ICommandHandler<UpdateCommentCommand> {
  constructor(private commentRepository: CommentRepository) {}

  async execute(command: UpdateCommentCommand) {
    const { id, updateCommentDto, userId } = command;

    const comment = await this.commentRepository.findById(id);
    if (!comment) {
      throw new NotFoundException(`Comment #${id} not found`);
    }

    if (comment.user.id !== userId) {
      throw new ForbiddenException('You can only update your own comments');
    }

    return this.commentRepository.update(id, updateCommentDto);
  }
} 