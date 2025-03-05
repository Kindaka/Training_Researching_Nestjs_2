import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTagsQuery } from '../impl/get-tags.query';
import { TagRepository } from '../../repositories/tag.repository';
import { TagDtoResponse } from '../../dto/tag-response.dto';
import { plainToInstance } from 'class-transformer';

@QueryHandler(GetTagsQuery)
export class GetTagsHandler implements IQueryHandler<GetTagsQuery> {
  constructor(private tagRepository: TagRepository) {}

  async execute(query: GetTagsQuery) {
    const { page, limit } = query;
    const [tags, total] = await this.tagRepository.findAll(page, limit);
    
    const transformedTags = plainToInstance(TagDtoResponse, tags, {
      excludeExtraneousValues: false
    });

    return {
      items: transformedTags,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
} 