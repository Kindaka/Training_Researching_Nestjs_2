import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class ImageFileValidator implements PipeTransform {
  transform(value: Express.Multer.File, metadata: ArgumentMetadata) {
    if (!value) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(value.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed');
    }

    // Validate file size
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (value.size > maxSize) {
      throw new BadRequestException(`File size exceeds the limit of ${maxSize / (1024 * 1024)}MB`);
    }

    return value;
  }
}

@Injectable()
export class VideoFileValidator implements PipeTransform {
  transform(value: Express.Multer.File, metadata: ArgumentMetadata) {
    if (!value) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type
    const allowedMimeTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    if (!allowedMimeTypes.includes(value.mimetype)) {
      throw new BadRequestException('Invalid file type. Only MP4, WebM, and OGG are allowed');
    }

    // Validate file size
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (value.size > maxSize) {
      throw new BadRequestException(`File size exceeds the limit of ${maxSize / (1024 * 1024)}MB`);
    }

    return value;
  }
} 