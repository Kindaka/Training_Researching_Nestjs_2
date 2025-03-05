import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTagQuery } from '../impl/get-tag.query';
import { TagRepository } from '../../repositories/tag.repository';
import { NotFoundException } from '@nestjs/common';
import { TagDtoResponse } from '../../dto/tag-response.dto';
import { plainToInstance } from 'class-transformer';

@QueryHandler(GetTagQuery)
export class GetTagHandler implements IQueryHandler<GetTagQuery> {
  constructor(private tagRepository: TagRepository) {}

  async execute(query: GetTagQuery) {
    const tag = await this.tagRepository.findById(query.id);
    if (!tag) {
      throw new NotFoundException(`Tag #${query.id} not found`);
    }
    return plainToInstance(TagDtoResponse, tag, {
      excludeExtraneousValues: false
    });
  }
} 