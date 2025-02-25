import { 
  Controller, Get, Post, Put, Delete, Body, Param,
  ParseIntPipe, UseGuards 
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { CreateCategoryCommand } from '../commands/impl/create-category.command';
import { UpdateCategoryCommand } from '../commands/impl/update-category.command';
import { DeleteCategoryCommand } from '../commands/impl/delete-category.command';
import { GetCategoriesQuery } from '../queries/impl/get-categories.query';
import { GetCategoryByIdQuery } from '../queries/impl/get-category-by-id.query';
import { Roles } from 'src/core/decorators/roles.decorator';
import { UserRole } from '../../user/entities/user.entity';
@ApiTags('Categories')
@ApiBearerAuth()
@Controller('api/v1/categories')
export class CategoryController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  async findAll() {
    return this.queryBus.execute(new GetCategoriesQuery());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by id' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.queryBus.execute(new GetCategoryByIdQuery(id));
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new category' })
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.commandBus.execute(
      new CreateCategoryCommand(createCategoryDto)
    );
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.MOD)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update category' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.commandBus.execute(
      new UpdateCategoryCommand(id, updateCategoryDto)
    );
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete category' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.commandBus.execute(new DeleteCategoryCommand(id));
  }
}
