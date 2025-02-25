import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTagsQuery } from '../impl/get-tags.query';
import { TagRepository } from '../../repositories/tag.repository';

@QueryHandler(GetTagsQuery)
export class GetTagsHandler implements IQueryHandler<GetTagsQuery> {
  constructor(private tagRepository: TagRepository) {}

  async execute(query: GetTagsQuery) {
    const { page, limit } = query;
    const [tags, total] = await this.tagRepository.findAll(page, limit);
    
    return {
      items: tags,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
} 