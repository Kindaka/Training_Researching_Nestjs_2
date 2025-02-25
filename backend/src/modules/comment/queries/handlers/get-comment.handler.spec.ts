import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetCommentHandler } from './get-comment.handler';
import { CommentRepository } from '../../repositories/comment.repository';
import { GetCommentQuery } from '../impl/get-comment.query';
import { Comment } from '../../entities/comment.entity';

describe('GetCommentHandler', () => {
  let handler: GetCommentHandler;
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
        GetCommentHandler,
        {
          provide: CommentRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<GetCommentHandler>(GetCommentHandler);
    commentRepository = module.get<CommentRepository>(CommentRepository);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should return a comment by id', async () => {
      jest.spyOn(commentRepository, 'findById').mockResolvedValue(mockComment);

      const result = await handler.execute(new GetCommentQuery(1));

      expect(commentRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockComment);
    });

    it('should throw NotFoundException when comment not found', async () => {
      jest.spyOn(commentRepository, 'findById').mockResolvedValue(null);

      await expect(handler.execute(new GetCommentQuery(999))).rejects.toThrow(
        NotFoundException,
      );
    });
  });
}); 