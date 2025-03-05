import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { GetCategoryByIdQuery } from '../impl/get-category-by-id.query';
import { CategoryRepository } from '../../repositories/category.repository';
import { plainToInstance } from 'class-transformer';
import { CategoryResponseDto } from '../../dto/category-response.dto';

@QueryHandler(GetCategoryByIdQuery)
export class GetCategoryByIdHandler implements IQueryHandler<GetCategoryByIdQuery> {
  constructor(private categoryRepository: CategoryRepository) {}

  async execute(query: GetCategoryByIdQuery) {
    const { id } = query;
    
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return plainToInstance(CategoryResponseDto, category, {
      excludeExtraneousValues: false
    });
  }
} 