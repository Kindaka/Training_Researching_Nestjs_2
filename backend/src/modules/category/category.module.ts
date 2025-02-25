import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Category } from './entities/category.entity';
import { CategoryController } from './controllers/category.controller';
import { CategoryRepository } from './repositories/category.repository';
import { CategoryService } from './services/category.service';
import { UserModule } from '../user/user.module';
import { LoggerModule } from '../../core/logger/logger.module';
import { CustomLoggerService } from '../../core/logger/custom-logger.service';

// Command Handlers
import { CreateCategoryHandler } from './commands/handlers/create-category.handler';
import { UpdateCategoryHandler } from './commands/handlers/update-category.handler';
import { DeleteCategoryHandler } from './commands/handlers/delete-category.handler';

// Query Handlers
import { GetCategoriesHandler } from './queries/handlers/get-categories.handler';
import { GetCategoryByIdHandler } from './queries/handlers/get-category-by-id.handler';

const CommandHandlers = [
  CreateCategoryHandler,
  UpdateCategoryHandler,
  DeleteCategoryHandler,
];

const QueryHandlers = [
  GetCategoriesHandler,
  GetCategoryByIdHandler,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([Category]),
    CqrsModule,
    UserModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    LoggerModule,
  ],
  controllers: [CategoryController],
  providers: [
    CategoryRepository,
    CategoryService,
    CustomLoggerService,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
})
export class CategoryModule {}
