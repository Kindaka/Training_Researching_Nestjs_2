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
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CommentService } from '../services/comment.service';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { RolesGuard } from '../../../core/guards/role.guard';
import { PermissionGuard } from '../../../core/helpers/check-permission.helper';

@ApiTags('Comments')
@Controller('api/v1/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @UseGuards(AuthGuard, new RolesGuard(['ADMIN']), PermissionGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new comment' })
  create(@Body() createCommentDto: CreateCommentDto, @Request() req) {
    return this.commentService.create(createCommentDto, req.currentUser.id);
  }

  @Get('post/:postId')
  @ApiOperation({ summary: 'Get all comments for a post' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Param('postId', ParseIntPipe) postId: number,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.commentService.findAll(postId, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get comment by id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.commentService.findOne(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard, new RolesGuard(['ADMIN', 'MOD']), PermissionGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update comment' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() req,
  ) {
    return this.commentService.update(id, updateCommentDto, req.currentUser.id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, new RolesGuard(['ADMIN']), PermissionGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete comment' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.commentService.remove(id, req.currentUser.id);
  }
}
