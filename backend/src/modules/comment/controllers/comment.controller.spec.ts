import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CommentController } from './comment.controller';
import { CommentService } from '../services/comment.service';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../user/services/user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../user/entities/user.entity';

describe('CommentController', () => {
  let controller: CommentController;
  let service: CommentService;

  const mockComment = {
    id: 1,
    content: 'Test comment',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: 1,
      email: 'test@example.com',
      fullName: 'Test User',
    },
    post: {
      id: 1,
      title: 'Test Post',
    },
  };

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    fullName: 'Test User',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentController],
      providers: [
        CommentService,
        {
          provide: CommandBus,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: QueryBus,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    })
    .useMocker((token) => {
      if (token === 'AuthGuard') {
        return { canActivate: () => true };
      }
    })
    .compile();

    controller = module.get<CommentController>(CommentController);
    service = module.get<CommentService>(CommentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a comment', async () => {
      const createDto: CreateCommentDto = {
        content: 'Test comment',
        postId: 1,
      };

      const req = {
        currentUser: mockUser,
      };

      jest.spyOn(service, 'create').mockResolvedValue(mockComment);

      const result = await controller.create(createDto, req);

      expect(service.create).toHaveBeenCalledWith(createDto, mockUser.id);
      expect(result).toEqual(mockComment);
    });
  });

  describe('findAll', () => {
    it('should return paginated comments', async () => {
      const postId = 1;
      const page = 1;
      const limit = 10;

      const paginatedResponse = {
        items: [mockComment],
        meta: {
          total: 1,
          page,
          limit,
          totalPages: 1,
        },
      };

      jest.spyOn(service, 'findAll').mockResolvedValue(paginatedResponse);

      const result = await controller.findAll(postId, page, limit);

      expect(service.findAll).toHaveBeenCalledWith(postId, page, limit);
      expect(result).toEqual(paginatedResponse);
    });
  });

  describe('findOne', () => {
    it('should return a comment by id', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockComment);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockComment);
    });
  });

  describe('update', () => {
    it('should update a comment', async () => {
      const updateDto: UpdateCommentDto = {
        content: 'Updated comment',
      };

      const req = {
        currentUser: mockUser,
      };

      const updatedComment = { ...mockComment, ...updateDto };
      jest.spyOn(service, 'update').mockResolvedValue(updatedComment);

      const result = await controller.update(1, updateDto, req);

      expect(service.update).toHaveBeenCalledWith(1, updateDto, mockUser.id);
      expect(result).toEqual(updatedComment);
    });
  });

  describe('remove', () => {
    it('should remove a comment', async () => {
      const req = {
        currentUser: mockUser,
      };

      const response = { message: 'Comment deleted successfully' };
      jest.spyOn(service, 'remove').mockResolvedValue(response);

      const result = await controller.remove(1, req);

      expect(service.remove).toHaveBeenCalledWith(1, mockUser.id);
      expect(result).toEqual(response);
    });
  });
});
