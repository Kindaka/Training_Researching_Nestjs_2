import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true,  }));

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  const configService = app.get(ConfigService);

  const port = configService.get('PORT') || 3000;

  const config = new DocumentBuilder()
  .setTitle('Blog Management')
  .setDescription('API for blog management')
  .setVersion('1.0')
  .addBearerAuth() // JWT Authentication
  .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);
  console.log(`🚀 Server is running on http://localhost:${port}`);
  console.log(`📜 Swagger Docs: http://localhost:${port}/api/docs`);
}
bootstrap();
