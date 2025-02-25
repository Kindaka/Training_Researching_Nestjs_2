import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdatePostCommand } from '../impl/update-post.command';
import { PostRepository } from '../../repositories/post.repository';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';

@CommandHandler(UpdatePostCommand)
export class UpdatePostHandler implements ICommandHandler<UpdatePostCommand> {
  constructor(private postRepository: PostRepository) {}

  async execute(command: UpdatePostCommand) {
    const { id, updatePostDto, userId } = command;
    console.log('🔍 Handler - Update Command:', { id, updatePostDto, userId });

    const post = await this.postRepository.findById(id);
    console.log('🔍 Handler - Found Post:', post);

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // Check if user is the author
    if (post.author.id !== userId) {
      throw new ForbiddenException('You can only update your own posts');
    }

    // Check if new slug is already taken
    if (updatePostDto.slug && updatePostDto.slug !== post.slug) {
      const existingPost = await this.postRepository.findBySlug(updatePostDto.slug);
      if (existingPost && existingPost.id !== id) {
        throw new BadRequestException(`Post with slug '${updatePostDto.slug}' already exists`);
      }
    }

    const result = await this.postRepository.update(id, updatePostDto);
    console.log('✅ Handler - Update Result:', result);
    return result;
  }
} 