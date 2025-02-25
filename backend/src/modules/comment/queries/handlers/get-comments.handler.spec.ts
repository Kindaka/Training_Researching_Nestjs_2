import { Test, TestingModule } from '@nestjs/testing';
import { GetCommentsHandler } from './get-comments.handler';
import { CommentRepository } from '../../repositories/comment.repository';
import { GetCommentsQuery } from '../impl/get-comments.query';
import { Comment } from '../../entities/comment.entity';

describe('GetCommentsHandler', () => {
  let handler: GetCommentsHandler;
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
        GetCommentsHandler,
        {
          provide: CommentRepository,
          useValue: {
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<GetCommentsHandler>(GetCommentsHandler);
    commentRepository = module.get<CommentRepository>(CommentRepository);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should return paginated comments', async () => {
      const postId = 1;
      const page = 1;
      const limit = 10;
      const total = 1;

      jest
        .spyOn(commentRepository, 'findAll')
        .mockResolvedValue([[mockComment], total]);

      const result = await handler.execute(
        new GetCommentsQuery(postId, page, limit),
      );

      expect(commentRepository.findAll).toHaveBeenCalledWith(postId, page, limit);
      expect(result).toEqual({
        items: [mockComment],
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    });

    it('should handle empty results', async () => {
      const postId = 1;
      const page = 1;
      const limit = 10;
      const total = 0;

      jest.spyOn(commentRepository, 'findAll').mockResolvedValue([[], total]);

      const result = await handler.execute(
        new GetCommentsQuery(postId, page, limit),
      );

      expect(commentRepository.findAll).toHaveBeenCalledWith(postId, page, limit);
      expect(result).toEqual({
        items: [],
        meta: {
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
      });
    });

    it('should use default pagination values', async () => {
      const postId = 1;
      const defaultPage = 1;
      const defaultLimit = 10;
      const total = 1;

      jest
        .spyOn(commentRepository, 'findAll')
        .mockResolvedValue([[mockComment], total]);

      const result = await handler.execute(new GetCommentsQuery(postId));

      expect(commentRepository.findAll).toHaveBeenCalledWith(
        postId,
        defaultPage,
        defaultLimit,
      );
      expect(result.meta).toEqual({
        total,
        page: defaultPage,
        limit: defaultLimit,
        totalPages: Math.ceil(total / defaultLimit),
      });
    });
  });
}); 