import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../../user/entities/user.entity';
import { ForgotPasswordCommand } from '../impl/forgot-password.command';
import { MailService } from '../../../mail/services/mail.service';

@CommandHandler(ForgotPasswordCommand)
export class ForgotPasswordHandler implements ICommandHandler<ForgotPasswordCommand> {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async execute(command: ForgotPasswordCommand) {
    try {
      const { email } = command.forgotPasswordDto;

      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        throw new BadRequestException('Email does not exist');
      }

      // Generate reset token
      const resetToken = await this.jwtService.signAsync(
        { id: user.id },
        { expiresIn: '15m' },
      );

      // Send reset password email with user information
      await this.mailService.sendResetPasswordEmail(user, resetToken);

      return {
        message: 'Reset password instructions have been sent to your email',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error during forgot password process');
    }
  }
} 