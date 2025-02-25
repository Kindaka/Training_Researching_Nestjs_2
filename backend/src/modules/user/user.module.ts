import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { RegisterUserHandler } from './commands/handlers/register-user.handler';
import { LoginUserHandler } from './commands/handlers/login-user.handler';
import { UpdateUserHandler } from './commands/handlers/update-user.handler';
import { DeleteUserHandler } from './commands/handlers/delete-user.handler';
import { GetUsersHandler } from './queries/handlers/get-users.handler';
import { GetUserHandler } from './queries/handlers/get-user.handler';
import { GetUserByEmailHandler } from './queries/handlers/get-user-by-email.handler';
import { LoggerMiddleware } from 'src/core/middlewares/logger.middleware';
import { AuthService } from '../../modules/user/services/auth.service';

const CommandHandlers = [
  RegisterUserHandler,
  LoginUserHandler,
  UpdateUserHandler,
  DeleteUserHandler,
];

const QueryHandlers = [
  GetUsersHandler,
  GetUserHandler,
  GetUserByEmailHandler,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    CqrsModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    ...CommandHandlers,
    ...QueryHandlers,
    AuthService,
  ],
  exports: [UserService],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
