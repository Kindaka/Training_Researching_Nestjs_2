import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetTagHandler } from './get-tag.handler';
import { TagRepository } from '../../repositories/tag.repository';
import { GetTagQuery } from '../impl/get-tag.query';
import { Tag } from '../../entities/tag.entity';

describe('GetTagHandler', () => {
  let handler: GetTagHandler;
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
        GetTagHandler,
        {
          provide: TagRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<GetTagHandler>(GetTagHandler);
    tagRepository = module.get<TagRepository>(TagRepository);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should return a tag by id', async () => {
      jest.spyOn(tagRepository, 'findById').mockResolvedValue(mockTag);

      const result = await handler.execute(new GetTagQuery(1));

      expect(tagRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockTag);
    });

    it('should throw NotFoundException when tag not found', async () => {
      jest.spyOn(tagRepository, 'findById').mockRejectedValue(
        new NotFoundException('Tag not found'),
      );

      await expect(handler.execute(new GetTagQuery(999))).rejects.toThrow(
        NotFoundException,
      );
    });
  });
}); 