import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { DeleteUserHandler } from './delete-user.handler';
import { DeleteUserCommand } from '../impl/delete-user.command';
import { User } from '../../entities/user.entity';
import { Role } from '../../../../core/enums/role.enum';

describe('DeleteUserHandler', () => {
  let handler: DeleteUserHandler;
  let userRepository: Repository<User>;

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

  const mockAdmin: User = {
    id: 2,
    email: 'admin@example.com',
    password: 'hashedPassword',
    fullName: 'Admin User',
    role: Role.ADMIN,
    posts: [],
    comments: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteUserHandler,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<DeleteUserHandler>(DeleteUserHandler);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should delete user successfully when user deletes their own account', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(userRepository, 'remove').mockResolvedValue(mockUser);

      const result = await handler.execute(
        new DeleteUserCommand(mockUser.id, mockUser),
      );

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(userRepository.remove).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({ message: 'Delete user successfully' });
    });

    it('should delete user successfully when admin deletes any user', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(userRepository, 'remove').mockResolvedValue(mockUser);

      const result = await handler.execute(
        new DeleteUserCommand(mockUser.id, mockAdmin),
      );

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(userRepository.remove).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({ message: 'Delete user successfully' });
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(
        handler.execute(new DeleteUserCommand(999, mockAdmin)),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when non-admin user tries to delete another user', async () => {
      const anotherUser = { ...mockUser, id: 3 };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(anotherUser);

      await expect(
        handler.execute(new DeleteUserCommand(anotherUser.id, mockUser)),
      ).rejects.toThrow(BadRequestException);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: anotherUser.id },
      });
      expect(userRepository.remove).not.toHaveBeenCalled();
    });
  });
}); 