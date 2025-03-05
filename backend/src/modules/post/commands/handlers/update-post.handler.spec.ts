import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UpdatePostHandler } from './update-post.handler';
import { PostRepository } from '../../repositories/post.repository';
import { UpdatePostCommand } from '../impl/update-post.command';
import { Post } from '../../entities/post.entity';

describe('UpdatePostHandler', () => {
  let handler: UpdatePostHandler;
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
    image: null,
    video: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdatePostHandler,
        {
          provide: PostRepository,
          useValue: {
            findById: jest.fn(),
            findBySlug: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<UpdatePostHandler>(UpdatePostHandler);
    postRepository = module.get<PostRepository>(PostRepository);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should update a post successfully', async () => {
      const updatePostDto = {
        title: 'Updated Post',
        content: 'Updated Content',
      };
      const userId = 1;

      jest.spyOn(postRepository, 'findById').mockResolvedValue(mockPost);
      jest.spyOn(postRepository, 'update').mockResolvedValue({
        ...mockPost,
        ...updatePostDto,
      });

      const result = await handler.execute(
        new UpdatePostCommand(1, updatePostDto, userId),
      );

      expect(postRepository.findById).toHaveBeenCalledWith(1);
      expect(postRepository.update).toHaveBeenCalledWith(1, updatePostDto);
      expect(result.title).toBe(updatePostDto.title);
    });

    it('should throw NotFoundException when post not found', async () => {
      jest.spyOn(postRepository, 'findById').mockResolvedValue(null);

      await expect(
        handler.execute(new UpdatePostCommand(999, { title: 'Updated' }, 1)),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not the author', async () => {
      jest.spyOn(postRepository, 'findById').mockResolvedValue(mockPost);

      await expect(
        handler.execute(new UpdatePostCommand(1, { title: 'Updated' }, 2)),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when new slug already exists', async () => {
      const updatePostDto = {
        slug: 'existing-slug',
      };
      const userId = 1;

      jest.spyOn(postRepository, 'findById').mockResolvedValue(mockPost);
      jest.spyOn(postRepository, 'findBySlug').mockResolvedValue({
        ...mockPost,
        id: 2,
      } as Post);

      await expect(
        handler.execute(new UpdatePostCommand(1, updatePostDto, userId)),
      ).rejects.toThrow(BadRequestException);
    });
  });
}); 