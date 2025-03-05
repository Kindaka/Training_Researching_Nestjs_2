import { Test, TestingModule } from '@nestjs/testing';
import { GetPostsHandler } from './get-posts.handler';
import { PostRepository } from '../../repositories/post.repository';
import { GetPostsQuery } from '../impl/get-posts.query';
import { Post } from '../../entities/post.entity';

describe('GetPostsHandler', () => {
  let handler: GetPostsHandler;
  let postRepository: PostRepository;

  const mockPost: Post = {
    id: 1,
    title: 'Test Post',
    content: 'Test Content',
    slug: 'test-post',
    published: true,
    viewCount: 0,
    publishedAt: new Date(),
    author: { id: 1 } as any,
    categories: [],
    tags: [],
    comments: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    image: null,
    video: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPostsHandler,
        {
          provide: PostRepository,
          useValue: {
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<GetPostsHandler>(GetPostsHandler);
    postRepository = module.get<PostRepository>(PostRepository);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should return paginated posts', async () => {
      const page = 1;
      const limit = 10;
      const total = 1;

      jest
        .spyOn(postRepository, 'findAll')
        .mockResolvedValue([[mockPost], total]);

      const result = await handler.execute(new GetPostsQuery(page, limit));

      expect(postRepository.findAll).toHaveBeenCalledWith(page, limit);
      expect(result).toEqual({
        items: [mockPost],
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    });

    it('should handle empty results', async () => {
      const page = 1;
      const limit = 10;
      const total = 0;

      jest.spyOn(postRepository, 'findAll').mockResolvedValue([[], total]);

      const result = await handler.execute(new GetPostsQuery(page, limit));

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
      const defaultPage = 1;
      const defaultLimit = 10;
      const total = 1;

      jest
        .spyOn(postRepository, 'findAll')
        .mockResolvedValue([[mockPost], total]);

      const result = await handler.execute(new GetPostsQuery());

      expect(postRepository.findAll).toHaveBeenCalledWith(
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