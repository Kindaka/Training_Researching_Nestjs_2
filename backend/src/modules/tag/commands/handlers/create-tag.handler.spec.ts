import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CreateTagHandler } from './create-tag.handler';
import { TagRepository } from '../../repositories/tag.repository';
import { CreateTagCommand } from '../impl/create-tag.command';
import { Tag } from '../../entities/tag.entity';

describe('CreateTagHandler', () => {
  let handler: CreateTagHandler;
  let tagRepository: TagRepository;

  const mockTag: Tag = {
    id: 1,
    name: 'Test Tag',
    slug: 'test-tag',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTagHandler,
        {
          provide: TagRepository,
          useValue: {
            findBySlug: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<CreateTagHandler>(CreateTagHandler);
    tagRepository = module.get<TagRepository>(TagRepository);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should create a tag successfully', async () => {
      const createTagDto = {
        name: 'Test Tag',
        slug: 'test-tag',
      };

      jest.spyOn(tagRepository, 'findBySlug').mockResolvedValue(null);
      jest.spyOn(tagRepository, 'create').mockResolvedValue(mockTag);

      const result = await handler.execute(new CreateTagCommand(createTagDto));

      expect(tagRepository.findBySlug).toHaveBeenCalledWith(createTagDto.slug);
      expect(tagRepository.create).toHaveBeenCalledWith(createTagDto);
      expect(result).toEqual(mockTag);
    });

    it('should throw BadRequestException if slug already exists', async () => {
      const createTagDto = {
        name: 'Test Tag',
        slug: 'existing-slug',
      };

      jest.spyOn(tagRepository, 'findBySlug').mockResolvedValue(mockTag);

      await expect(
        handler.execute(new CreateTagCommand(createTagDto)),
      ).rejects.toThrow(BadRequestException);

      expect(tagRepository.findBySlug).toHaveBeenCalledWith(createTagDto.slug);
      expect(tagRepository.create).not.toHaveBeenCalled();
    });
  });
}); 