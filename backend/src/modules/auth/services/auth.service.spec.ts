import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus } from '@nestjs/cqrs';
import { AuthService } from './auth.service';
import { RegisterCommand } from '../commands/impl/register.command';
import { LoginCommand } from '../commands/impl/login.command';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('AuthService', () => {
  let service: AuthService;
  let commandBus: CommandBus;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    fullName: 'Test User',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: CommandBus,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('mock-token'),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('some-secret'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    commandBus = module.get<CommandBus>(CommandBus);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should execute RegisterCommand', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'Test123',
        fullName: 'Test User',
      };

      jest.spyOn(commandBus, 'execute').mockResolvedValue(mockUser);

      const result = await service.register(registerDto);

      expect(commandBus.execute).toHaveBeenCalledWith(
        new RegisterCommand(registerDto),
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe('login', () => {
    it('should execute LoginCommand', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'Test123',
      };

      const mockLoginResponse = {
        message: 'Login successful',
        accessToken: 'mock-token',
      };

      jest.spyOn(commandBus, 'execute').mockResolvedValue(mockLoginResponse);

      const result = await service.login(loginDto);

      expect(commandBus.execute).toHaveBeenCalledWith(
        new LoginCommand(loginDto),
      );
      expect(result).toEqual(mockLoginResponse);
    });
  });
}); 