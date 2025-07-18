import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterCommand } from '../impl/register.command';
import { User } from '../../../user/entities/user.entity';
import { Role } from '../../../../core/enums/role.enum';
import { JwtPayload } from '../../interfaces/jwt-payload.interface';
import { MailService } from '../../../mail/services/mail.service';
import { CustomLoggerService } from '../../../../core/logger/custom-logger.service';

@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand> {
  // Danh sách domain email không hợp lệ
  private invalidEmailDomains = [
    'example.com',
    'test.com',
    'fake.com',
    'invalid.com',
    'temporary.com',
  ];

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private mailService: MailService,
    private logger: CustomLoggerService,
  ) {}

  private isValidEmailDomain(email: string): boolean {
    const domain = email.split('@')[1];
    return !this.invalidEmailDomains.includes(domain);
  }

  async execute(command: RegisterCommand) {
    try {
      const { registerDto } = command;
      this.logger.debug(`Processing registration for email: ${registerDto.email}`);

      // Validate email domain
      if (!this.isValidEmailDomain(registerDto.email)) {
        throw new BadRequestException('Please use a valid email address');
      }

      // Check email exists
      const existingUser = await this.userRepository.findOne({
        where: { email: registerDto.email },
      });

      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(registerDto.password, 10);

      // Create user
      const user = this.userRepository.create({
        email: registerDto.email,
        fullName: registerDto.fullName,
        password: hashedPassword,
        role: Role.USER,
      });

      const savedUser = await this.userRepository.save(user);

      // Send welcome email
      try {
        await this.mailService.sendWelcomeEmail(savedUser);
        this.logger.log(`Welcome email sent to ${savedUser.email}`);
      } catch (emailError) {
        this.logger.error(
          `Failed to send welcome email to ${savedUser.email}`,
          (emailError as Error).stack
        );
      }
      

      // Generate token
      const payload: JwtPayload = {
        id: savedUser.id,
        email: savedUser.email,
        fullName: savedUser.fullName,
        role: savedUser.role,
      };

      const accessToken = await this.jwtService.signAsync(payload);

      return {
        message: 'Register successful',
        accessToken,
        user: {
          id: savedUser.id,
          email: savedUser.email,
          fullName: savedUser.fullName,
          role: savedUser.role,
        }
      };
    } catch (error) {
      this.logger.error('Registration failed', (error as Error).stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error during registration');
    }
  }
} 