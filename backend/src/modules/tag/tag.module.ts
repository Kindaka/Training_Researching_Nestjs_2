import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tag } from './entities/tag.entity';
import { TagController } from './controllers/tag.controller';
import { TagService } from './services/tag.service';
import { TagRepository } from './repositories/tag.repository';
import { CreateTagHandler } from './commands/handlers/create-tag.handler';
import { UpdateTagHandler } from './commands/handlers/update-tag.handler';
import { DeleteTagHandler } from './commands/handlers/delete-tag.handler';
import { GetTagsHandler } from './queries/handlers/get-tags.handler';
import { GetTagHandler } from './queries/handlers/get-tag.handler';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';

const CommandHandlers = [CreateTagHandler, UpdateTagHandler, DeleteTagHandler];
const QueryHandlers = [GetTagsHandler, GetTagHandler];

@Module({
  imports: [
    TypeOrmModule.forFeature([Tag]),
    CqrsModule,
    UserModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [TagController],
  providers: [
    TagService,
    TagRepository,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [TagRepository],
})
export class TagModule {}
