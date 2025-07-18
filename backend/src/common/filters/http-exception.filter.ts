import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';
import { CustomLoggerService } from '../../core/logger/custom-logger.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private logger: CustomLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';
    let stack = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
    
      if (typeof res === 'object' && res !== null) {
        const safeResponse = res as { message?: string | string[], error?: string };
      
        if (Array.isArray(safeResponse.message)) {
          message = safeResponse.message.join(', ');
        } else {
          message = safeResponse.message || exception.message;
        }
      
        error = safeResponse.error || exception.name;
      }
      
    
      stack = exception.stack;
    } 
    else if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST;
      const queryError = exception as QueryFailedError & { detail?: string };
      message = queryError.detail || queryError.message;
      error = 'Database Error';
      stack = exception.stack;
    }
    else if (exception instanceof Error) {
      message = exception.message;
      stack = exception.stack;
    }
    

    // Log error with details
    this.logger.error(`${error}: ${message}`, {
      exception: {
        name: error,
        message,
        stack
      },
      request: {
        method: request.method,
        url: request.url,
        body: request.body,
        headers: request.headers,
        ip: request.ip
      },
      statusCode: status
    });

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error,
      message,
    });
  }
} 