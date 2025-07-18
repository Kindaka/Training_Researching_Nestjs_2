import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../../../user/entities/user.entity';
import { ResetPasswordCommand } from '../impl/reset-password.command';

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordHandler implements ICommandHandler<ResetPasswordCommand> {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async execute(command: ResetPasswordCommand) {
    try {
      const { token, password } = command.resetPasswordDto;

      // Verify token
      const payload = await this.jwtService.verifyAsync(token) as { id: number };
      const user = await this.userRepository.findOne({ where: { id: payload.id } });

      if (!user) {
        throw new BadRequestException('Invalid reset token');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update password
      await this.userRepository.update(user.id, { password: hashedPassword });

      return {
        message: 'Password has been reset successfully',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error during password reset');
    }
  }
} 