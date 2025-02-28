import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { BadRequestException } from '@nestjs/common';

export const multerConfig: MulterOptions = {
  limits: {
    // Giới hạn kích thước file
    fileSize: 5 * 1024 * 1024, // 5MB cho ảnh
  },
  fileFilter: (req, file, callback) => {
    // Validate file type
    if (file.fieldname === 'file') {
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return callback(
          new BadRequestException('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed'),
          false,
        );
      }
    }
    
    if (file.fieldname === 'video') {
      // Giới hạn kích thước cho video
      if (file.size && file.size > 50 * 1024 * 1024) {
        return callback(
          new BadRequestException('Video size should not exceed 50MB'),
          false,
        );
      }
      
      if (!file.mimetype.match(/\/(mp4|webm|ogg)$/)) {
        return callback(
          new BadRequestException('Only MP4, WebM, and OGG video files are allowed!'),
          false,
        );
      }
    }
    
    callback(null, true);
  },
}; 