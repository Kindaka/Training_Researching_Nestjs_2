import { Test, TestingModule } from '@nestjs/testing';
import { CreateCommentHandler } from './create-comment.handler';
import { CommentRepository } from '../../repositories/comment.repository';
import { CreateCommentCommand } from '../impl/create-comment.command';
import { Comment } from '../../entities/comment.entity';

describe('CreateCommentHandler', () => {
  let handler: CreateCommentHandler;
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
        CreateCommentHandler,
        {
          provide: CommentRepository,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<CreateCommentHandler>(CreateCommentHandler);
    commentRepository = module.get<CommentRepository>(CommentRepository);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should create a comment successfully', async () => {
      const createCommentDto = {
        content: 'Test comment',
        postId: 1,
      };
      const userId = 1;

      jest.spyOn(commentRepository, 'create').mockResolvedValue(mockComment);

      const result = await handler.execute(
        new CreateCommentCommand(createCommentDto, userId),
      );

      expect(commentRepository.create).toHaveBeenCalledWith(
        createCommentDto,
        userId,
      );
      expect(result).toEqual(mockComment);
    });
  });
}); 