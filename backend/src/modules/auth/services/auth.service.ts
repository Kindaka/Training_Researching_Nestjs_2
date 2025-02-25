import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from '../dtos/auth.dto';
import { RegisterCommand } from '../commands/impl/register.command';
import { LoginCommand } from '../commands/impl/login.command';
import { ForgotPasswordCommand } from '../commands/impl/forgot-password.command';
import { ResetPasswordCommand } from '../commands/impl/reset-password.command';

@Injectable()
export class AuthService {
  constructor(private readonly commandBus: CommandBus) {}

  async register(registerDto: RegisterDto) {
    return this.commandBus.execute(new RegisterCommand(registerDto));
  }

  async login(loginDto: LoginDto) {
    return this.commandBus.execute(new LoginCommand(loginDto));
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    return this.commandBus.execute(new ForgotPasswordCommand(forgotPasswordDto));
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    return this.commandBus.execute(new ResetPasswordCommand(resetPasswordDto));
  }
} 