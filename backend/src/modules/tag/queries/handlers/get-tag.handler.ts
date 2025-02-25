import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTagQuery } from '../impl/get-tag.query';
import { TagRepository } from '../../repositories/tag.repository';

@QueryHandler(GetTagQuery)
export class GetTagHandler implements IQueryHandler<GetTagQuery> {
  constructor(private tagRepository: TagRepository) {}

  async execute(query: GetTagQuery) {
    return this.tagRepository.findById(query.id);
  }
} 