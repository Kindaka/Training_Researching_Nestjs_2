import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCategoriesQuery } from '../impl/get-categories.query';
import { CategoryRepository } from '../../repositories/category.repository';
import { plainToInstance } from 'class-transformer';
import { CategoryResponseDto } from '../../dto/category-response.dto';

@QueryHandler(GetCategoriesQuery)
export class GetCategoriesHandler implements IQueryHandler<GetCategoriesQuery> {
  constructor(private categoryRepository: CategoryRepository) {}

  async execute(query: GetCategoriesQuery) {
    const categories = await this.categoryRepository.findAll();
    return plainToInstance(CategoryResponseDto, categories, {
      excludeExtraneousValues: false
    });
  }
} 