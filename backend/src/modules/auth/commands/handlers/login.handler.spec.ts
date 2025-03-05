import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { LoginHandler } from './login.handler';
import { LoginCommand } from '../impl/login.command';
import { User } from '../../../user/entities/user.entity';
import { Role } from '../../../../core/enums/role.enum';
import { CustomLoggerService } from '../../../../core/logger/custom-logger.service';
import { UserService } from '../../../user/services/user.service';

jest.mock('bcrypt');

describe('LoginHandler', () => {
  let handler: LoginHandler;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

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
        LoginHandler,
        {
          provide: UserService,
          useValue: {
            findByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: CustomLoggerService,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<LoginHandler>(LoginHandler);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should successfully login user', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'Test123',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('mock-token');

      const result = await handler.execute(new LoginCommand(loginDto));

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
        select: ['id', 'email', 'password', 'fullName', 'role'],
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        id: mockUser.id,
        email: mockUser.email,
        fullName: mockUser.fullName,
        role: mockUser.role,
      });
      expect(result).toEqual({
        message: 'Login successful',
        accessToken: 'mock-token',
      });
    });

    it('should throw BadRequestException if user not found', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'Test123',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(
        handler.execute(new LoginCommand(loginDto)),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if password is incorrect', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        handler.execute(new LoginCommand(loginDto)),
      ).rejects.toThrow(BadRequestException);
    });
  });
}); 