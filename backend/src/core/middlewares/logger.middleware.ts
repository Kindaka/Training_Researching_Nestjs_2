import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CustomLoggerService } from '../logger/custom-logger.service';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private logger: CustomLoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const { method, originalUrl, ip, body } = req;

    // Log request
    this.logger.log(`Incoming Request: ${method} ${originalUrl} from ${ip}`, {
      method,
      url: originalUrl,
      body: JSON.stringify(body),
      headers: req.headers,
      ip
    });

    // Capture response using event listener
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const { statusCode } = res;

      // Log response
      this.logger.log(`Outgoing Response: ${statusCode} ${method} ${originalUrl} - ${duration}ms`, {
        method,
        url: originalUrl,
        statusCode,
        duration,
        ip
      });
    });

    next();
  }
}
