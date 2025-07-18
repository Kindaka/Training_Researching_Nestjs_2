import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from '../dtos/auth.dto';
import { RegisterCommand } from '../commands/impl/register.command';
import { LoginCommand } from '../commands/impl/login.command';
import { ForgotPasswordCommand } from '../commands/impl/forgot-password.command';
import { ResetPasswordCommand } from '../commands/impl/reset-password.command';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../../user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly commandBus: CommandBus,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ message: string; accessToken: string; user: Partial<User> }> {
    return this.commandBus.execute(new RegisterCommand(registerDto));
  }

  async login(loginDto: LoginDto): Promise<{ message: string; accessToken: string }> {
    return this.commandBus.execute(new LoginCommand(loginDto));
  }
  

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    return this.commandBus.execute(new ForgotPasswordCommand(forgotPasswordDto));
  }
  
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    return this.commandBus.execute(new ResetPasswordCommand(resetPasswordDto));
  }

  async generateToken(user: User): Promise<string> {  
    const payload = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
    });
  }
} 