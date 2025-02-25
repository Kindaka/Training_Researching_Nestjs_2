import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UpdateCommentHandler } from './update-comment.handler';
import { CommentRepository } from '../../repositories/comment.repository';
import { UpdateCommentCommand } from '../impl/update-comment.command';
import { Comment } from '../../entities/comment.entity';

describe('UpdateCommentHandler', () => {
  let handler: UpdateCommentHandler;
  let commentRepository: CommentRepository;

  const mockComment: Comment = {
    id: 1,
    content: 'Test comment',
    user: { id: 1 } as any,
    post: { id: 1 } as any,
    parent: null,
    replies: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateCommentHandler,
        {
          provide: CommentRepository,
          useValue: {
            findById: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<UpdateCommentHandler>(UpdateCommentHandler);
    commentRepository = module.get<CommentRepository>(CommentRepository);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should update a comment successfully', async () => {
      const updateCommentDto = {
        content: 'Updated comment',
      };
      const userId = 1;

      jest.spyOn(commentRepository, 'findById').mockResolvedValue(mockComment);
      jest.spyOn(commentRepository, 'update').mockResolvedValue({
        ...mockComment,
        content: updateCommentDto.content,
      });

      const result = await handler.execute(
        new UpdateCommentCommand(1, updateCommentDto, userId),
      );

      expect(commentRepository.findById).toHaveBeenCalledWith(1);
      expect(commentRepository.update).toHaveBeenCalledWith(1, updateCommentDto);
      expect(result.content).toBe(updateCommentDto.content);
    });

    it('should throw NotFoundException when comment not found', async () => {
      jest.spyOn(commentRepository, 'findById').mockResolvedValue(null);

      await expect(
        handler.execute(
          new UpdateCommentCommand(999, { content: 'Updated' }, 1),
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not the owner', async () => {
      jest.spyOn(commentRepository, 'findById').mockResolvedValue(mockComment);

      await expect(
        handler.execute(
          new UpdateCommentCommand(1, { content: 'Updated' }, 2),
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });
}); 