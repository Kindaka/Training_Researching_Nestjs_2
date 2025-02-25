import { Test, TestingModule } from '@nestjs/testing';
import { GetTagsHandler } from './get-tags.handler';
import { TagRepository } from '../../repositories/tag.repository';
import { GetTagsQuery } from '../impl/get-tags.query';
import { Tag } from '../../entities/tag.entity';

describe('GetTagsHandler', () => {
  let handler: GetTagsHandler;
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
        GetTagsHandler,
        {
          provide: TagRepository,
          useValue: {
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<GetTagsHandler>(GetTagsHandler);
    tagRepository = module.get<TagRepository>(TagRepository);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should return paginated tags', async () => {
      const page = 1;
      const limit = 10;
      const total = 1;

      jest
        .spyOn(tagRepository, 'findAll')
        .mockResolvedValue([[mockTag], total]);

      const result = await handler.execute(new GetTagsQuery(page, limit));

      expect(tagRepository.findAll).toHaveBeenCalledWith(page, limit);
      expect(result).toEqual({
        items: [mockTag],
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

      jest.spyOn(tagRepository, 'findAll').mockResolvedValue([[], total]);

      const result = await handler.execute(new GetTagsQuery(page, limit));

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
        .spyOn(tagRepository, 'findAll')
        .mockResolvedValue([[mockTag], total]);

      const result = await handler.execute(new GetTagsQuery());

      expect(tagRepository.findAll).toHaveBeenCalledWith(
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