import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../services/cloudinary.service';
import { ApiTags, ApiConsumes, ApiBody, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Roles } from 'src/core/decorators/roles.decorator';
import { Role } from 'src/core/enums/role.enum';
import { AuthGuard } from 'src/core/guards/auth.guard';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { UploadLoggingInterceptor } from '../../../core/interceptors/upload-logging.interceptor';
import { ImageFileValidator, VideoFileValidator } from '../validators/file.validator';
import { diskStorage, memoryStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

@ApiTags('Upload')
@Controller('api/v1/upload')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(UploadLoggingInterceptor)
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('image')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiQuery({ name: 'postId', required: false, type: Number, description: 'ID of the post to attach the image to' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file (max 5MB)',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
    })
  )
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Query('postId', new ParseIntPipe({ optional: true })) postId?: number,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      // Upload file từ memory buffer lên Cloudinary
      const result = await this.cloudinaryService.uploadImage(file);
      
      // Nếu có postId, cập nhật post với URL ảnh mới
      if (postId) {
        await this.cloudinaryService.updatePostWithImage(postId, result.secure_url);
        return {
          url: result.secure_url,
          publicId: result.public_id,
          postId: postId,
          message: `Image attached to post #${postId} successfully`,
        };
      }
      
      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new BadRequestException('Failed to upload image: ' + error.message);
    }
  }

  @Post('video')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiQuery({ name: 'postId', required: false, type: Number, description: 'ID of the post to attach the video to' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Video file (max 50MB)',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
      },
      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = ['video/mp4', 'video/webm', 'video/ogg'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return callback(new Error('Only video files are allowed!'), false);
        }
        callback(null, true);
      },
    })
  )
  async uploadVideo(
    @UploadedFile() file: Express.Multer.File,
    @Query('postId', new ParseIntPipe({ optional: true })) postId?: number,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      // Upload file từ disk lên Cloudinary
      const result = await this.cloudinaryService.uploadVideo(file);
      
      
      // Nếu có postId, cập nhật post với URL video mới
      if (postId) {
        await this.cloudinaryService.updatePostWithVideo(postId, result.secure_url);
        return {
          url: result.secure_url,
          publicId: result.public_id,
          postId: postId,
          message: `Video attached to post #${postId} successfully`,
        };
      }
      
      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {     
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new BadRequestException('Failed to upload video: ' + error.message);
    }
  }

  @Delete(':publicId')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiQuery({ name: 'postId', required: false, type: Number, description: 'ID of the post to remove the media from' })
  async deleteFile(
    @Param('publicId') publicId: string,
    @Query('postId', new ParseIntPipe({ optional: true })) postId?: number,
  ) {
    try {
      // Xóa file từ Cloudinary
      await this.cloudinaryService.deleteFile(publicId);
      
      // Nếu có postId, cập nhật post để xóa liên kết với media
      if (postId) {
        // Xác định loại media (image hoặc video) dựa trên publicId
        const mediaType = publicId.includes('videos/') ? 'video' : 'image';
        
        if (mediaType === 'image') {
          await this.cloudinaryService.removeImageFromPost(postId);
        } else {
          await this.cloudinaryService.removeVideoFromPost(postId);
        }
        
        return { 
          message: `File deleted and removed from post #${postId} successfully` 
        };
      }
      
      return { message: 'File deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new BadRequestException('Failed to delete file: ' + error.message);
    }
  }
} 