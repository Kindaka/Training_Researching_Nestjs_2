import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { UpdateTagCommand } from '../impl/update-tag.command';
import { TagRepository } from '../../repositories/tag.repository';

@CommandHandler(UpdateTagCommand)
export class UpdateTagHandler implements ICommandHandler<UpdateTagCommand> {
  constructor(private tagRepository: TagRepository) {}

  async execute(command: UpdateTagCommand) {
    const { id, updateTagDto } = command;

    if (updateTagDto.slug) {
      const existingTag = await this.tagRepository.findBySlug(updateTagDto.slug);
      if (existingTag && existingTag.id !== id) {
        throw new BadRequestException(`Tag with slug '${updateTagDto.slug}' already exists`);
      }
    }

    return this.tagRepository.update(id, updateTagDto);
  }
} 