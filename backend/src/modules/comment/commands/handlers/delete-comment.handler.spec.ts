import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { DeleteCommentHandler } from './delete-comment.handler';
import { CommentRepository } from '../../repositories/comment.repository';
import { DeleteCommentCommand } from '../impl/delete-comment.command';
import { Comment } from '../../entities/comment.entity';

describe('DeleteCommentHandler', () => {
  let handler: DeleteCommentHandler;
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
        DeleteCommentHandler,
        {
          provide: CommentRepository,
          useValue: {
            findById: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<DeleteCommentHandler>(DeleteCommentHandler);
    commentRepository = module.get<CommentRepository>(CommentRepository);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should delete a comment successfully', async () => {
      jest.spyOn(commentRepository, 'findById').mockResolvedValue(mockComment);
      jest.spyOn(commentRepository, 'delete').mockResolvedValue(undefined);

      const result = await handler.execute(new DeleteCommentCommand(1, 1));

      expect(commentRepository.findById).toHaveBeenCalledWith(1);
      expect(commentRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: 'Comment deleted successfully' });
    });

    it('should throw NotFoundException when comment not found', async () => {
      jest.spyOn(commentRepository, 'findById').mockResolvedValue(null);

      await expect(
        handler.execute(new DeleteCommentCommand(999, 1)),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not the owner', async () => {
      jest.spyOn(commentRepository, 'findById').mockResolvedValue(mockComment);

      await expect(
        handler.execute(new DeleteCommentCommand(1, 2)),
      ).rejects.toThrow(ForbiddenException);
    });
  });
}); 