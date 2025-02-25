import { Test, TestingModule } from '@nestjs/testing';
import { GetCategoriesHandler } from './get-categories.handler';
import { CategoryRepository } from '../../repositories/category.repository';
import { GetCategoriesQuery } from '../impl/get-categories.query';

describe('GetCategoriesHandler', () => {
  let handler: GetCategoriesHandler;
  let categoryRepository: CategoryRepository;

  const mockCategories = [
    {
      id: 1,
      name: 'Test Category 1',
      slug: 'test-category-1',
      description: 'Test Description 1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      name: 'Test Category 2',
      slug: 'test-category-2',
      description: 'Test Description 2',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCategoriesHandler,
        {
          provide: CategoryRepository,
          useValue: {
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<GetCategoriesHandler>(GetCategoriesHandler);
    categoryRepository = module.get<CategoryRepository>(CategoryRepository);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should return all categories', async () => {
      jest.spyOn(categoryRepository, 'findAll').mockResolvedValue(mockCategories);

      const result = await handler.execute(new GetCategoriesQuery());

      expect(categoryRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockCategories);
    });

    it('should return empty array when no categories exist', async () => {
      jest.spyOn(categoryRepository, 'findAll').mockResolvedValue([]);

      const result = await handler.execute(new GetCategoriesQuery());

      expect(categoryRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });
}); 