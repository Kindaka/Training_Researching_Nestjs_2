import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CreatePostHandler } from './create-post.handler';
import { PostRepository } from '../../repositories/post.repository';
import { CreatePostCommand } from '../impl/create-post.command';
import { Post } from '../../entities/post.entity';

describe('CreatePostHandler', () => {
  let handler: CreatePostHandler;
  let postRepository: PostRepository;

  const mockPost: Post = {
    id: 1,
    title: 'Test Post',
    content: 'Test Content',
    slug: 'test-post',
    published: false,
    viewCount: 0,
    publishedAt: null,
    author: { id: 1 } as any,
    categories: [],
    tags: [],
    comments: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    image: 'test-image-url',
    video: 'test-video-url',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreatePostHandler,
        {
          provide: PostRepository,
          useValue: {
            findBySlug: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<CreatePostHandler>(CreatePostHandler);
    postRepository = module.get<PostRepository>(PostRepository);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should create a post successfully', async () => {
      const createPostDto = {
        title: 'Test Post',
        content: 'Test Content',
        slug: 'test-post',
        published: false,
        categoryIds: [1],
        tagIds: [1],
      };
      const userId = 1;

      jest.spyOn(postRepository, 'findBySlug').mockResolvedValue(null);
      jest.spyOn(postRepository, 'create').mockResolvedValue(mockPost);

      const result = await handler.execute(
        new CreatePostCommand(createPostDto, userId),
      );

      expect(postRepository.findBySlug).toHaveBeenCalledWith(createPostDto.slug);
      expect(postRepository.create).toHaveBeenCalledWith(createPostDto, userId);
      expect(result).toEqual(mockPost);
    });

    it('should throw BadRequestException if slug already exists', async () => {
      const createPostDto = {
        title: 'Test Post',
        content: 'Test Content',
        slug: 'existing-slug',
        published: false,
        categoryIds: [1],
        tagIds: [1],
      };
      const userId = 1;

      jest.spyOn(postRepository, 'findBySlug').mockResolvedValue(mockPost);

      await expect(
        handler.execute(new CreatePostCommand(createPostDto, userId)),
      ).rejects.toThrow(BadRequestException);

      expect(postRepository.findBySlug).toHaveBeenCalledWith(createPostDto.slug);
      expect(postRepository.create).not.toHaveBeenCalled();
    });
  });
}); 