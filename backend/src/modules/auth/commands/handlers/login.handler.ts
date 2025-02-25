import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginCommand } from '../impl/login.command';
import { User } from '../../../user/entities/user.entity';
import { JwtPayload } from '../../interfaces/jwt-payload.interface';
import { CustomLoggerService } from '../../../../core/logger/custom-logger.service';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private logger: CustomLoggerService,
  ) {}

  async execute(command: LoginCommand) {
    try {
      const { loginDto } = command;
      this.logger.debug(`Attempting login for user: ${loginDto.email}`);

      const user = await this.userRepository.findOne({
        where: { email: loginDto.email },
        select: ['id', 'email', 'password', 'fullName', 'role']
      });

      if (!user) {
        this.logger.warn(`Login failed: Email does not exist - ${loginDto.email}`);
        throw new BadRequestException('Email does not exist');
      }

      const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
      if (!isPasswordValid) {
        this.logger.warn(`Login failed: Incorrect password for user ${loginDto.email}`);
        throw new BadRequestException('Password is incorrect');
      }

      const payload: JwtPayload = {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      };

      const accessToken = await this.jwtService.signAsync(payload);
      this.logger.log(`User logged in successfully: ${user.email}`);

      return {
        message: 'Login successful',
        accessToken,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Error during login', error.stack);
      throw new InternalServerErrorException('Error during login');
    }
  }
} 