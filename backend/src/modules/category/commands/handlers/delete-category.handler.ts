import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { DeleteCategoryCommand } from '../impl/delete-category.command';
import { CategoryRepository } from '../../repositories/category.repository';

@CommandHandler(DeleteCategoryCommand)
export class DeleteCategoryHandler implements ICommandHandler<DeleteCategoryCommand> {
  constructor(private categoryRepository: CategoryRepository) {}

  async execute(command: DeleteCategoryCommand) {
    const { id } = command;
    
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    await this.categoryRepository.delete(id);
    return { message: 'Category deleted successfully' };
  }
} 