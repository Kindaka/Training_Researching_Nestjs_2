import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { User } from '../../user/entities/user.entity';
import { CustomLoggerService } from '../../../core/logger/custom-logger.service';

@Injectable()
export class MailService {
  private frontendDomain: string;

  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
    private logger: CustomLoggerService,
  ) {
    this.frontendDomain = this.configService.get('FE_DOMAIN');
  }

  async sendWelcomeEmail(user: User) {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Welcome to Our Platform',
        template: './welcome', // welcome.hbs
        context: {
          title: 'Welcome to Our Platform!',
          fullName: user.fullName,
          frontendDomain: this.frontendDomain,
        },
      });
      this.logger.log(`Welcome email sent to ${user.email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${user.email}`, error.stack);
      throw error;
    }
  }

  async sendResetPasswordEmail(user: User, token: string) {
    const resetUrl = `${this.frontendDomain}/reset-password?token=${token}`;

    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Reset Your Password',
        template: './reset-password', // reset-password.hbs
        context: {
          title: 'Password Reset Request',
          fullName: user.fullName,
          resetUrl,
        },
      });
      this.logger.log(`Reset password email sent to ${user.email}`);
    } catch (error) {
      this.logger.error(`Failed to send reset password email to ${user.email}`, error.stack);
      throw error;
    }
  }
} 