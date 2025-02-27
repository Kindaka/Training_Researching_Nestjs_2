import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { CustomLoggerService } from './core/logger/custom-logger.service';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { Controller, Get, Res } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('test-client.html')
  getTestClient(@Res() res) {
    return res.sendFile(join(__dirname, '..', 'public', 'test-client.html'));
  }
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter(app.get(CustomLoggerService)));

  // Cấu hình để phục vụ file tĩnh từ thư mục public
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Log đường dẫn để debug
  console.log('Static assets path:', join(__dirname, '..', 'public'));

  const configService = app.get(ConfigService);

  const port = configService.get<number>('PORT') || 3000;

  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('API documentation for the application')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);
  console.log(`🚀 Server is running on http://localhost:${port}`);
  console.log(`📜 Swagger Docs: http://localhost:${port}/api/docs`);
}
bootstrap();
