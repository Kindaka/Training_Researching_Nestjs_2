import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { GetUserHandler } from './get-user.handler';
import { GetUserQuery } from '../impl/get-user.query';
import { User } from '../../entities/user.entity';
import { UserRole } from '../../entities/user.entity';

describe('GetUserHandler', () => {
  let handler: GetUserHandler;
  let userRepository: Repository<User>;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword',
    fullName: 'Test User',
    role: UserRole.USER,
    posts: [],
    comments: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserHandler,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<GetUserHandler>(GetUserHandler);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should return a user when found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

      const result = await handler.execute(new GetUserQuery(1));

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        select: ['id', 'email', 'fullName', 'role', 'createdAt', 'updatedAt'],
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(handler.execute(new GetUserQuery(999))).rejects.toThrow(
        NotFoundException,
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
        select: ['id', 'email', 'fullName', 'role', 'createdAt', 'updatedAt'],
      });
    });
  });
}); 