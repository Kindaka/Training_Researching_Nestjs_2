import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateCategoryCommand } from '../impl/update-category.command';
import { CategoryRepository } from '../../repositories/category.repository';
import { 
  CategoryNotFoundException, 
  CategoryAlreadyExistsException,
  InvalidCategoryDataException 
} from '../../../../common/exceptions/category.exception';
import { validate } from 'class-validator';

@CommandHandler(UpdateCategoryCommand)
export class UpdateCategoryHandler implements ICommandHandler<UpdateCategoryCommand> {
  constructor(private categoryRepository: CategoryRepository) {}

  async execute(command: UpdateCategoryCommand) {
    const { id, updateCategoryDto } = command;

    // Validate DTO
    const errors = await validate(updateCategoryDto);
    if (errors.length > 0) {
      const messages = errors.map(error => 
        Object.values(error.constraints).join(', ')
      );
      throw new InvalidCategoryDataException(messages);
    }

    // Check if category exists
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new CategoryNotFoundException(id);
    }

    // Check if slug is being updated and if it's already taken
    if (updateCategoryDto.slug && updateCategoryDto.slug !== category.slug) {
      const existingCategory = await this.categoryRepository.findBySlug(updateCategoryDto.slug);
      if (existingCategory && existingCategory.id !== id) {
        throw new CategoryAlreadyExistsException(updateCategoryDto.slug);
      }
    }

    return this.categoryRepository.update(id, updateCategoryDto);
  }
} 