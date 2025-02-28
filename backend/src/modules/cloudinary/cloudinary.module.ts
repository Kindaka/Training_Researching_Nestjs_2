import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { CloudinaryService } from './services/cloudinary.service';
import { CloudinaryProvider } from '../../core/provider/cloudinary.provider';
import { CloudinaryController } from './controllers/cloudinary.controller';
import { ContentTypeMiddleware } from '../../core/middlewares/content-type.middleware';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '../post/entities/post.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post]),
    UserModule,
  ],
  controllers: [CloudinaryController],
  providers: [CloudinaryService, CloudinaryProvider],
  exports: [CloudinaryService],
})
export class CloudinaryModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ContentTypeMiddleware)
      .forRoutes(
        { path: 'api/v1/upload/image', method: RequestMethod.POST },
        { path: 'api/v1/upload/video', method: RequestMethod.POST }
      );
  }
} 