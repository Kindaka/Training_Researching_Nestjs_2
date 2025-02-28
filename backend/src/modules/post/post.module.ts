import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostController } from './controllers/post.controller';
import { PostService } from './services/post.service';
import { Post } from './entities/post.entity';
import { PostRepository } from './repositories/post.repository';
import { UserModule } from '../user/user.module';
import { Category } from '../category/entities/category.entity';
import { Tag } from '../tag/entities/tag.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

// Command Handlers
import { CreatePostHandler } from './commands/handlers/create-post.handler';
import { UpdatePostHandler } from './commands/handlers/update-post.handler';
import { DeletePostHandler } from './commands/handlers/delete-post.handler';

// Query Handlers
import { GetPostsHandler } from './queries/handlers/get-posts.handler';
import { GetPostByIdHandler } from './queries/handlers/get-post-by-id.handler';

const CommandHandlers = [
  CreatePostHandler,
  UpdatePostHandler,
  DeletePostHandler,
];

const QueryHandlers = [
  GetPostsHandler,
  GetPostByIdHandler,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Category, Tag]),
    CqrsModule,
    UserModule,
    CloudinaryModule,
  ],
  controllers: [PostController],
  providers: [
    PostService,
    PostRepository,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
})
export class PostModule {}
