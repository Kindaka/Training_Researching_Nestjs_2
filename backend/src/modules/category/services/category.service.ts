import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { CreateCategoryCommand } from '../commands/impl/create-category.command';
import { UpdateCategoryCommand } from '../commands/impl/update-category.command';
import { DeleteCategoryCommand } from '../commands/impl/delete-category.command';
import { GetCategoriesQuery } from '../queries/impl/get-categories.query';
import { GetCategoryByIdQuery } from '../queries/impl/get-category-by-id.query';

@Injectable()
export class CategoryService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    return this.commandBus.execute(new CreateCategoryCommand(createCategoryDto));
  }

  async findAll() {
    return this.queryBus.execute(new GetCategoriesQuery());
  }

  async findOne(id: number) {
    return this.queryBus.execute(new GetCategoryByIdQuery(id));
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return this.commandBus.execute(new UpdateCategoryCommand(id, updateCategoryDto));
  }

  async remove(id: number) {
    return this.commandBus.execute(new DeleteCategoryCommand(id));
  }
}
