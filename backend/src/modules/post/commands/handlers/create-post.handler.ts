import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePostCommand } from '../impl/create-post.command';
import { PostRepository } from '../../repositories/post.repository';
import { BadRequestException } from '@nestjs/common';

@CommandHandler(CreatePostCommand)
export class CreatePostHandler implements ICommandHandler<CreatePostCommand> {
  constructor(private postRepository: PostRepository) {}

  async execute(command: CreatePostCommand) {
    const { createPostDto, userId } = command;

    // Check if post with same slug exists
    const existingPost = await this.postRepository.findBySlug(createPostDto.slug);
    if (existingPost) {
      throw new BadRequestException(`Post with slug '${createPostDto.slug}' already exists`);
    }

    return this.postRepository.create(createPostDto, userId);
  }
} 