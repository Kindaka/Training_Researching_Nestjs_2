import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { User } from 'src/modules/user/entities/user.entity';
type RequestWithUser = Request & {
  currentUser?: User;
};
@Injectable()
export class UploadLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('UploadInterceptor');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const method = request.method;
    const url = request.url;
    const user = request.currentUser;
    const fileType = url.includes('image') ? 'image' : 'video';

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - startTime;
          this.logger.log(
            `${method} ${url} - User: ${user?.id} - File type: ${fileType} - Response time: ${responseTime}ms`,
          );
        },
        error: (error: unknown) => {
          const responseTime = Date.now() - startTime;
          const err = error as { message?: string };
          this.logger.error(
            `${method} ${url} - User: ${user?.id} - File type: ${fileType} - Error: ${err.message} - Response time: ${responseTime}ms`,
          );
        },
      }),
    );
  }
}
