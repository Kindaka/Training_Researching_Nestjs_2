import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetPostByIdHandler } from './get-post-by-id.handler';
import { PostRepository } from '../../repositories/post.repository';
import { GetPostByIdQuery } from '../impl/get-post-by-id.query';
import { Post } from '../../entities/post.entity';

describe('GetPostByIdHandler', () => {
  let handler: GetPostByIdHandler;
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
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPostByIdHandler,
        {
          provide: PostRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<GetPostByIdHandler>(GetPostByIdHandler);
    postRepository = module.get<PostRepository>(PostRepository);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should return a post by id', async () => {
      jest.spyOn(postRepository, 'findById').mockResolvedValue(mockPost);

      const result = await handler.execute(new GetPostByIdQuery(1));

      expect(postRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockPost);
    });

    it('should throw NotFoundException when post not found', async () => {
      jest.spyOn(postRepository, 'findById').mockResolvedValue(null);

      await expect(handler.execute(new GetPostByIdQuery(999))).rejects.toThrow(
        NotFoundException,
      );
    });
  });
}); 