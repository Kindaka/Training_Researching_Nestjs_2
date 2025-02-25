import { Controller, Get } from '@nestjs/common';
import { CustomLoggerService } from './core/logger/custom-logger.service';

@Controller()
export class AppController {
  constructor(private readonly logger: CustomLoggerService) {}

  @Get('test-log')
  testLog() {
    this.logger.log('This is an info message');
    this.logger.error('This is an error message');
    this.logger.warn('This is a warning message');
    this.logger.debug('This is a debug message');
    this.logger.verbose('This is a verbose message');
    
    return 'Logs generated!';
  }
}
