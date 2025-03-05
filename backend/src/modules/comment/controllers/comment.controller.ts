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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { CommentService } from '../services/comment.service';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { Public } from '../../../core/decorators/public.decorator';
import { Role } from '../../../core/enums/role.enum';
import { Roles } from '../../../core/decorators/roles.decorator';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { CommentResponseDto } from '../dto/comment-response.dto';
@ApiTags('Comments')
@Controller('api/v1/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new comment' })
  create(@Body() createCommentDto: CreateCommentDto, @Request() req) {
    return this.commentService.create(createCommentDto, req.currentUser.id);
  }

  @Get('post/:postId')
  @Public()
  @ApiOperation({ summary: 'Get all comments for a post' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 201, description: 'Get all comments for a post successfully', type: CommentResponseDto, isArray: true })
  findAll(
    @Param('postId', ParseIntPipe) postId: number,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.commentService.findAll(postId, page, limit);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get comment by id' })
  @ApiResponse({ status: 201, description: 'Get comment by id successfully', type: CommentResponseDto })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.commentService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.MOD)
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
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete comment' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.commentService.remove(id, req.currentUser.id);
  }
}
