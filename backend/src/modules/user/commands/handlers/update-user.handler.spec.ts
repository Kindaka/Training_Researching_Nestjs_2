import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { UpdateUserHandler } from './update-user.handler';
import { UpdateUserCommand } from '../impl/update-user.command';
import { User } from '../../entities/user.entity';
import { Role } from '../../../../core/enums/role.enum';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UpdateUserHandler', () => {
  let handler: UpdateUserHandler;
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
        UpdateUserHandler,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<UpdateUserHandler>(UpdateUserHandler);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should update user successfully without password', async () => {
      const updateDto = { fullName: 'Updated Name' };
      const updatedUser = { ...mockUser, fullName: 'Updated Name' };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(userRepository, 'save').mockResolvedValue(updatedUser);

      const result = await handler.execute(
        new UpdateUserCommand(mockUser.id, updateDto, mockUser),
      );

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(userRepository.save).toHaveBeenCalled();
      expect(result).toEqual({
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
      });
    });

    it('should update user with password', async () => {
      const updateDto = { password: 'newPassword' };
      const hashedPassword = 'newHashedPassword';

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(userRepository, 'save').mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      });
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      await handler.execute(
        new UpdateUserCommand(mockUser.id, updateDto, mockUser),
      );

      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', 10);
      expect(userRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        password: hashedPassword,
      });
    });

    it('should throw BadRequestException when trying to update role', async () => {
      const updateDto = { role: Role.ADMIN };

      await expect(
        handler.execute(new UpdateUserCommand(mockUser.id, updateDto, mockUser)),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when user not found', async () => {
      const updateDto = { fullName: 'Test' };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(
        handler.execute(new UpdateUserCommand(999, updateDto, mockAdmin)),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when non-admin user tries to update another user', async () => {
      const anotherUser = { ...mockUser, id: 3 };
      const updateDto = { fullName: 'Test' };
      
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(anotherUser);

      await expect(
        handler.execute(new UpdateUserCommand(anotherUser.id, updateDto, mockUser)),
      ).rejects.toThrow(ForbiddenException);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: anotherUser.id },
      });
      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });
}); 