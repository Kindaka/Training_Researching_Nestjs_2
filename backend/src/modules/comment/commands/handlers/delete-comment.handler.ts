import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { DeleteCommentCommand } from '../impl/delete-comment.command';
import { CommentRepository } from '../../repositories/comment.repository';

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentHandler implements ICommandHandler<DeleteCommentCommand> {
  constructor(private commentRepository: CommentRepository) {}

  async execute(command: DeleteCommentCommand) {
    const { id, userId } = command;

    const comment = await this.commentRepository.findById(id);
    if (!comment) {
      throw new NotFoundException(`Comment #${id} not found`);
    }

    if (comment.user.id !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.commentRepository.delete(id);
    return { message: 'Comment deleted successfully' };
  }
} 