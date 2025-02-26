import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetUsersHandler } from './get-users.handler';
import { GetUsersQuery } from '../impl/get-users.query';
import { User } from '../../entities/user.entity';
import { Role } from '../../../../core/enums/role.enum';

describe('GetUsersHandler', () => {
  let handler: GetUsersHandler;
  let userRepository: Repository<User>;

  const mockUsers: User[] = [
    {
      id: 1,
      email: 'user1@example.com',
      password: 'hashedPassword1',
      fullName: 'User One',
      role: Role.USER,
      posts: [],
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      email: 'user2@example.com',
      password: 'hashedPassword2',
      fullName: 'User Two',
      role: Role.ADMIN,
      posts: [],
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUsersHandler,
        {
          provide: getRepositoryToken(User),
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<GetUsersHandler>(GetUsersHandler);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should return all users', async () => {
      jest.spyOn(userRepository, 'find').mockResolvedValue(mockUsers);

      const result = await handler.execute();

      expect(userRepository.find).toHaveBeenCalledWith({
        select: ['id', 'email', 'fullName', 'role', 'createdAt', 'updatedAt'],
      });
      expect(result).toEqual(mockUsers);
    });

    it('should return empty array when no users found', async () => {
      jest.spyOn(userRepository, 'find').mockResolvedValue([]);

      const result = await handler.execute();

      expect(userRepository.find).toHaveBeenCalledWith({
        select: ['id', 'email', 'fullName', 'role', 'createdAt', 'updatedAt'],
      });
      expect(result).toEqual([]);
    });
  });
});