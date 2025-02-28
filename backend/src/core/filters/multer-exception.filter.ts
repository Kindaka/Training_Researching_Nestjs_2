import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import * as multer from 'multer';

@Catch(multer.MulterError)
export class MulterExceptionFilter implements ExceptionFilter {
  catch(exception: multer.MulterError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    let statusCode = HttpStatus.BAD_REQUEST;
    let message = 'File upload error';
    
    switch (exception.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File size exceeds the allowed limit';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected field name for file upload';
        break;
      case 'LIMIT_PART_COUNT':
        message = 'Too many parts in the multipart form';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files uploaded';
        break;
      default:
        message = exception.message;
    }
    
    response.status(statusCode).json({
      statusCode,
      message,
      error: 'Bad Request',
      timestamp: new Date().toISOString(),
    });
  }
} 