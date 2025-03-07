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
import { Roles } from '../../../core/decorators/roles.decorator';
import { Role } from '../../../core/enums/role.enum';
import { Public } from '../../../core/decorators/public.decorator';
import { CategoryResponseDto } from '../dto/category-response.dto';
import { ApiResponse } from '@nestjs/swagger';

@ApiTags('Categories')
@ApiBearerAuth()
@Controller('api/v1/categories')
export class CategoryController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({ status: 200, description: 'Get all categories successfully', type: CategoryResponseDto, isArray: true })
  async findAll() {
    return this.queryBus.execute(new GetCategoriesQuery());
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get category by id' })
  @ApiResponse({ status: 200, description: 'Get category by id successfully', type: CategoryResponseDto })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.queryBus.execute(new GetCategoryByIdQuery(id));
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new category' })
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.commandBus.execute(
      new CreateCategoryCommand(createCategoryDto)
    );
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.MOD)
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
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete category' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.commandBus.execute(new DeleteCategoryCommand(id));
  }
}
