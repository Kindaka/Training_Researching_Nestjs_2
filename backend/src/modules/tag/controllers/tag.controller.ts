import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { TagService } from '../services/tag.service';
import { CreateTagDto } from '../dto/create-tag.dto';
import { UpdateTagDto } from '../dto/update-tag.dto';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { RolesGuard } from '../../../core/guards/role.guard';
import { PermissionGuard } from '../../../core/helpers/check-permission.helper';

@ApiTags('Tags')
@Controller('api/v1/tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post()
  @UseGuards(AuthGuard, new RolesGuard(['ADMIN']), PermissionGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new tag' })
  create(@Body() createTagDto: CreateTagDto) {
    return this.tagService.create(createTagDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tags' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.tagService.findAll(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tag by id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tagService.findOne(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard, new RolesGuard(['ADMIN', 'MOD']), PermissionGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update tag' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTagDto: UpdateTagDto,
  ) {
    return this.tagService.update(id, updateTagDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, new RolesGuard(['ADMIN']), PermissionGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete tag' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tagService.remove(id);
  }
}
