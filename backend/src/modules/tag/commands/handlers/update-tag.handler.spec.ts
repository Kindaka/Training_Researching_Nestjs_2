import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UpdateTagHandler } from './update-tag.handler';
import { TagRepository } from '../../repositories/tag.repository';
import { UpdateTagCommand } from '../impl/update-tag.command';
import { Tag } from '../../entities/tag.entity';

describe('UpdateTagHandler', () => {
  let handler: UpdateTagHandler;
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
        UpdateTagHandler,
        {
          provide: TagRepository,
          useValue: {
            findBySlug: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<UpdateTagHandler>(UpdateTagHandler);
    tagRepository = module.get<TagRepository>(TagRepository);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should update a tag successfully', async () => {
      const updateTagDto = {
        name: 'Updated Tag',
      };

      jest.spyOn(tagRepository, 'update').mockResolvedValue({
        ...mockTag,
        ...updateTagDto,
      });

      const result = await handler.execute(
        new UpdateTagCommand(1, updateTagDto),
      );

      expect(tagRepository.update).toHaveBeenCalledWith(1, updateTagDto);
      expect(result.name).toBe(updateTagDto.name);
    });

    it('should throw BadRequestException if new slug already exists', async () => {
      const updateTagDto = {
        slug: 'existing-slug',
      };

      jest.spyOn(tagRepository, 'findBySlug').mockResolvedValue({
        ...mockTag,
        id: 2,
      });

      await expect(
        handler.execute(new UpdateTagCommand(1, updateTagDto)),
      ).rejects.toThrow(BadRequestException);

      expect(tagRepository.findBySlug).toHaveBeenCalledWith(updateTagDto.slug);
      expect(tagRepository.update).not.toHaveBeenCalled();
    });

    it('should allow updating to same slug', async () => {
      const updateTagDto = {
        slug: 'test-tag',
      };

      jest.spyOn(tagRepository, 'findBySlug').mockResolvedValue(mockTag);
      jest.spyOn(tagRepository, 'update').mockResolvedValue(mockTag);

      const result = await handler.execute(
        new UpdateTagCommand(1, updateTagDto),
      );

      expect(tagRepository.update).toHaveBeenCalledWith(1, updateTagDto);
      expect(result).toEqual(mockTag);
    });
  });
}); 