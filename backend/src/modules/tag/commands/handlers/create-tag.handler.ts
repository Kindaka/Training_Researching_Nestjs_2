import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { CreateTagCommand } from '../impl/create-tag.command';
import { TagRepository } from '../../repositories/tag.repository';

@CommandHandler(CreateTagCommand)
export class CreateTagHandler implements ICommandHandler<CreateTagCommand> {
  constructor(private tagRepository: TagRepository) {}

  async execute(command: CreateTagCommand) {
    const { createTagDto } = command;
    
    // Check if slug exists
    const existingTag = await this.tagRepository.findBySlug(createTagDto.slug);
    if (existingTag) {
      throw new BadRequestException(`Tag with slug '${createTagDto.slug}' already exists`);
    }

    return this.tagRepository.create(createTagDto);
  }
} 