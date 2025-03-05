import { Controller, Get, Res } from '@nestjs/common';
import { CustomLoggerService } from './core/logger/custom-logger.service';
import { join } from 'path';
import { Response } from 'express';
import { Public } from './core/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly logger: CustomLoggerService) {}

  @Get('test-log')
  @Public()
  testLog() {
    this.logger.log('This is an info message');
    this.logger.error('This is an error message');
    this.logger.warn('This is a warning message');
    this.logger.debug('This is a debug message');
    this.logger.verbose('This is a verbose message');
    
    return 'Logs generated!';
  }

  @Get('test-client')
  @Public()
  getTestClient(@Res() res: Response) {
    return res.sendFile(join(__dirname, '..', 'public', 'test-client.html'));
  }
}
