import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../../user/entities/user.entity';
import { ForgotPasswordCommand } from '../impl/forgot-password.command';
import { MailService } from '../../../mail/services/mail.service';
import { CustomLoggerService } from '../../../../core/logger/custom-logger.service';

@CommandHandler(ForgotPasswordCommand)
export class ForgotPasswordHandler implements ICommandHandler<ForgotPasswordCommand> {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private mailService: MailService,
    private logger: CustomLoggerService,
  ) {}

  async execute(command: ForgotPasswordCommand) {
    try {
      const { email } = command.forgotPasswordDto;
      this.logger.debug(`Processing forgot password request for email: ${email}`);

      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        this.logger.warn(`Forgot password failed: Email does not exist - ${email}`);
        throw new BadRequestException('Email does not exist');
      }

      // Generate reset token
      const resetToken = await this.jwtService.signAsync(
        { id: user.id },
        { expiresIn: '15m' },
      );

      // Send reset password email with user information
      try {
        await this.mailService.sendResetPasswordEmail(user, resetToken);
        this.logger.log(`Reset password email sent to ${user.email}`);
      } catch (emailError) {
        this.logger.error(
          `Failed to send reset password email to ${user.email}`,
          (emailError as Error).stack
        );
      }
      

      return {
        message: 'Reset password instructions have been sent to your email',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Error during forgot password process', (error as Error).stack);
      throw new InternalServerErrorException('Error during forgot password process');
    }
  }
} 