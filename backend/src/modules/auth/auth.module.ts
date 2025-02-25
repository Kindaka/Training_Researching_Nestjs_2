import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../user/entities/user.entity';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { RegisterHandler } from './commands/handlers/register.handler';
import { LoginHandler } from './commands/handlers/login.handler';
import { ForgotPasswordHandler } from './commands/handlers/forgot-password.handler';
import { ResetPasswordHandler } from './commands/handlers/reset-password.handler';
import { MailModule } from '../mail/mail.module';
import { LoggerModule } from '../../core/logger/logger.module';
import { CustomLoggerService } from '../../core/logger/custom-logger.service';

const CommandHandlers = [
  RegisterHandler,
  LoginHandler,
  ForgotPasswordHandler,
  ResetPasswordHandler,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    CqrsModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { 
          expiresIn: '1d',
        },
      }),
      inject: [ConfigService],
    }),
    MailModule,
    LoggerModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    CustomLoggerService,
    ...CommandHandlers,
  ],
})
export class AuthModule {} 