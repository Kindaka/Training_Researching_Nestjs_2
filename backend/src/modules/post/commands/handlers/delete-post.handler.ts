import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeletePostCommand } from '../impl/delete-post.command';
import { PostRepository } from '../../repositories/post.repository';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

@CommandHandler(DeletePostCommand)
export class DeletePostHandler implements ICommandHandler<DeletePostCommand> {
  constructor(private postRepository: PostRepository) {}

  async execute(command: DeletePostCommand) {
    const { id, userId } = command;

    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // Check if user is the author
    if (post.author.id !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.postRepository.delete(id);
    return { message: 'Post deleted successfully' };
  }
} 