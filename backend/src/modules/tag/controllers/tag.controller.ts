import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { TagService } from '../services/tag.service';
import { CreateTagDto } from '../dto/create-tag.dto';
import { UpdateTagDto } from '../dto/update-tag.dto';
import { Role } from '../../../core/enums/role.enum';
import { Roles } from '../../../core/decorators/roles.decorator';
import { Public } from '../../../core/decorators/public.decorator';
import { TagDtoResponse } from '../dto/tag-response.dto';
@ApiTags('Tags')
@Controller('api/v1/tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new tag' })
  // @ApiOkResponse(Tag)
  create(@Body() createTagDto: CreateTagDto) {
    return this.tagService.create(createTagDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all tags' })
  @ApiResponse({ status: 200, description: 'Get all tags successfully', type: TagDtoResponse, isArray: true })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.tagService.findAll(page, limit);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get tag by id' })
  @ApiResponse({ status: 200, description: 'Get tag by id successfully', type: TagDtoResponse })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tagService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.MOD)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update tag' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTagDto: UpdateTagDto,
  ) {
    return this.tagService.update(id, updateTagDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete tag' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tagService.remove(id);
  }
}
