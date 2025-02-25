import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCategoriesQuery } from '../impl/get-categories.query';
import { CategoryRepository } from '../../repositories/category.repository';

@QueryHandler(GetCategoriesQuery)
export class GetCategoriesHandler implements IQueryHandler<GetCategoriesQuery> {
  constructor(private categoryRepository: CategoryRepository) {}

  async execute(query: GetCategoriesQuery) {
    return this.categoryRepository.findAll();
  }
} 