import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateCategoryCommand } from '../impl/create-category.command';
import { CategoryRepository } from '../../repositories/category.repository';
import { CategoryAlreadyExistsException, InvalidCategoryDataException } from '../../../../common/exceptions/category.exception';
import { validate } from 'class-validator';

@CommandHandler(CreateCategoryCommand)
export class CreateCategoryHandler implements ICommandHandler<CreateCategoryCommand> {
  constructor(private categoryRepository: CategoryRepository) {}

  async execute(command: CreateCategoryCommand) {
    const { createCategoryDto } = command;

    // Validate DTO
    const errors = await validate(createCategoryDto);
    if (errors.length > 0) {
      const messages = errors.map(error => 
        Object.values(error.constraints).join(', ')
      );
      throw new InvalidCategoryDataException(messages);
    }

    // Check if category with same slug exists
    const existingCategory = await this.categoryRepository.findBySlug(createCategoryDto.slug);
    if (existingCategory) {
      throw new CategoryAlreadyExistsException(createCategoryDto.slug);
    }

    return this.categoryRepository.create(createCategoryDto);
  }
} 