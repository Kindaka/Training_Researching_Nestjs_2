import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { CommentController } from './controllers/comment.controller';
import { CommentService } from './services/comment.service';
import { CommentRepository } from './repositories/comment.repository';
import { CreateCommentHandler } from './commands/handlers/create-comment.handler';
import { UpdateCommentHandler } from './commands/handlers/update-comment.handler';
import { DeleteCommentHandler } from './commands/handlers/delete-comment.handler';
import { GetCommentsHandler } from './queries/handlers/get-comments.handler';
import { GetCommentHandler } from './queries/handlers/get-comment.handler';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';

const CommandHandlers = [CreateCommentHandler, UpdateCommentHandler, DeleteCommentHandler];
const QueryHandlers = [GetCommentsHandler, GetCommentHandler];

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
    CqrsModule,
    UserModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [CommentController],
  providers: [
    CommentService,
    CommentRepository,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
})
export class CommentModule {}
