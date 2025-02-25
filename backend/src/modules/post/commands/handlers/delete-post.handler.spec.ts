import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { DeletePostHandler } from './delete-post.handler';
import { PostRepository } from '../../repositories/post.repository';
import { DeletePostCommand } from '../impl/delete-post.command';
import { Post } from '../../entities/post.entity';

describe('DeletePostHandler', () => {
  let handler: DeletePostHandler;
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
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeletePostHandler,
        {
          provide: PostRepository,
          useValue: {
            findById: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<DeletePostHandler>(DeletePostHandler);
    postRepository = module.get<PostRepository>(PostRepository);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should delete a post successfully', async () => {
      jest.spyOn(postRepository, 'findById').mockResolvedValue(mockPost);
      jest.spyOn(postRepository, 'delete').mockResolvedValue(undefined);

      const result = await handler.execute(new DeletePostCommand(1, 1));

      expect(postRepository.findById).toHaveBeenCalledWith(1);
      expect(postRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: 'Post deleted successfully' });
    });

    it('should throw NotFoundException when post not found', async () => {
      jest.spyOn(postRepository, 'findById').mockResolvedValue(null);

      await expect(handler.execute(new DeletePostCommand(999, 1))).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when user is not the author', async () => {
      jest.spyOn(postRepository, 'findById').mockResolvedValue(mockPost);

      await expect(handler.execute(new DeletePostCommand(1, 2))).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
}); 