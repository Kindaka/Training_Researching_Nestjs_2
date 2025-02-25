import { Test, TestingModule } from '@nestjs/testing';
import { GetCategoryByIdHandler } from './get-category-by-id.handler';
import { CategoryRepository } from '../../repositories/category.repository';
import { GetCategoryByIdQuery } from '../impl/get-category-by-id.query';
import { NotFoundException } from '@nestjs/common';

describe('GetCategoryByIdHandler', () => {
  let handler: GetCategoryByIdHandler;
  let categoryRepository: CategoryRepository;

  const mockCategory = {
    id: 1,
    name: 'Test Category',
    slug: 'test-category',
    description: 'Test Description',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCategoryByIdHandler,
        {
          provide: CategoryRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<GetCategoryByIdHandler>(GetCategoryByIdHandler);
    categoryRepository = module.get<CategoryRepository>(CategoryRepository);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should return a category by id', async () => {
      jest.spyOn(categoryRepository, 'findById').mockResolvedValue(mockCategory);

      const result = await handler.execute(new GetCategoryByIdQuery(1));

      expect(categoryRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockCategory);
    });

    it('should throw NotFoundException when category does not exist', async () => {
      jest.spyOn(categoryRepository, 'findById').mockResolvedValue(null);

      await expect(
        handler.execute(new GetCategoryByIdQuery(999)),
      ).rejects.toThrow(NotFoundException);
    });
  });
}); 