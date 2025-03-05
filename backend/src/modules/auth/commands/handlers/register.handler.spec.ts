import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterHandler } from './register.handler';
import { RegisterCommand } from '../impl/register.command';
import { User } from '../../../user/entities/user.entity';
import { Role } from '../../../../core/enums/role.enum';
import { CustomLoggerService } from '../../../../core/logger/custom-logger.service';
import { MailService } from '../../../mail/services/mail.service';

jest.mock('bcrypt');

describe('RegisterHandler', () => {
  let handler: RegisterHandler;
  let userRepository: Repository<User>;
  let jwtService: JwtService;
  let mailService: MailService;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword',
    fullName: 'Test User',
    role: Role.USER,
    posts: [],
    comments: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterHandler,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('mock-token'),
          },
        },
        {
          provide: CustomLoggerService,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendWelcomeEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<RegisterHandler>(RegisterHandler);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
    mailService = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should successfully register a new user', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'Test123',
        fullName: 'Test User',
      };

      const hashedPassword = 'hashedPassword123';
      const expectedResponse = {
        message: 'Register successful',
        accessToken: 'mock-token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          fullName: mockUser.fullName,
          role: mockUser.role,
        }
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      jest.spyOn(userRepository, 'create').mockReturnValue({
        ...mockUser,
        password: hashedPassword,
      });
      jest.spyOn(userRepository, 'save').mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      });

      jest.spyOn(mailService, 'sendWelcomeEmail').mockResolvedValue(undefined);

      const result = await handler.execute(new RegisterCommand(registerDto));

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(userRepository.create).toHaveBeenCalledWith({
        email: registerDto.email,
        fullName: registerDto.fullName,
        password: hashedPassword,
        role: Role.USER,
      });
      expect(userRepository.save).toHaveBeenCalled();
      expect(mailService.sendWelcomeEmail).toHaveBeenCalledWith({
        ...mockUser,
        password: hashedPassword,
      });
      expect(result).toEqual(expectedResponse);
    });

    it('should throw BadRequestException if email already exists', async () => {
      const registerDto = {
        email: 'existing@example.com',
        password: 'Test123',
        fullName: 'Test User',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

      await expect(
        handler.execute(new RegisterCommand(registerDto)),
      ).rejects.toThrow(BadRequestException);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
    });

    it('should throw InternalServerErrorException if password is too weak', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'weak',
        fullName: 'Test User',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      
      await expect(
        handler.execute(new RegisterCommand(registerDto)),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException if email is invalid', async () => {
      const registerDto = {
        email: 'invalid-email',
        password: 'Test123',
        fullName: 'Test User',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      
      await expect(
        handler.execute(new RegisterCommand(registerDto)),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
}); 