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
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PostService } from '../services/post.service';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { PermissionGuard } from 'src/core/helpers/check-permission.helper';
import { RolesGuard } from 'src/core/guards/role.guard';

@ApiTags('Posts')
@Controller('api/v1/posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post('create-post')
  @UseGuards(AuthGuard, new RolesGuard(['ADMIN']), PermissionGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new post' })
  create(@Body() createPostDto: CreatePostDto, @Request() req) {
    return this.postService.create(createPostDto, req.user.id);
  }

  @Get('get-all-posts')
  @ApiOperation({ summary: 'Get all posts' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.postService.findAll(page, limit);
  }

  @Get('get-post-by-id/:id')
  @ApiOperation({ summary: 'Get post by id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postService.findOne(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard, new RolesGuard(['ADMIN', 'MOD']), PermissionGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update post' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
    @Request() req,
  ) {
    try {
      // Kiểm tra user authentication
      if (!req.user || !req.currentUser) {
        throw new UnauthorizedException('User not authenticated');
      }

      console.log('🔍 Update Request:', {
        postId: id,
        updateData: updatePostDto,
        user: {
          id: req.currentUser.id,
          email: req.currentUser.email,
          role: req.currentUser.role
        }
      });

      // Kiểm tra post tồn tại
      const existingPost = await this.postService.findOne(id);
      if (!existingPost) {
        throw new NotFoundException(`Post #${id} not found`);
      }

      // Kiểm tra quyền (sử dụng currentUser)
      if (existingPost.author.id !== req.currentUser.id && req.currentUser.role !== 'ADMIN') {
        throw new ForbiddenException('You can only update your own posts');
      }

      const result = await this.postService.update(id, updatePostDto, req.currentUser.id);
      return result;

    } catch (error) {
      console.error('❌ Update Error:', error);
      throw error;
    }
  }

  @Delete('delete-post/:id')
  @UseGuards(AuthGuard, new RolesGuard(['ADMIN']), PermissionGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete post' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.postService.remove(id, req.user.id);
  }
}
