import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class UploadLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('UploadInterceptor');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user } = request;
    const fileType = url.includes('image') ? 'image' : 'video';
    
    const startTime = Date.now();
    
    return next.handle().pipe(
      tap({
        next: (data) => {
          const responseTime = Date.now() - startTime;
          this.logger.log(
            `${method} ${url} - User: ${user?.id} - File type: ${fileType} - Response time: ${responseTime}ms`,
          );
        },
        error: (error) => {
          const responseTime = Date.now() - startTime;
          this.logger.error(
            `${method} ${url} - User: ${user?.id} - File type: ${fileType} - Error: ${error.message} - Response time: ${responseTime}ms`,
          );
        },
      }),
    );
  }
} 