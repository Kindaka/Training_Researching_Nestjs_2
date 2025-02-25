import { Test, TestingModule } from '@nestjs/testing';
import { CreateCategoryHandler } from './create-category.handler';
import { CategoryRepository } from '../../repositories/category.repository';
import { CreateCategoryCommand } from '../impl/create-category.command';

describe('CreateCategoryHandler', () => {
  let handler: CreateCategoryHandler;
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
        CreateCategoryHandler,
        {
          provide: CategoryRepository,
          useValue: {
            create: jest.fn(),
            findBySlug: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<CreateCategoryHandler>(CreateCategoryHandler);
    categoryRepository = module.get<CategoryRepository>(CategoryRepository);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should create a category successfully', async () => {
      const createDto = {
        name: 'Test Category',
        slug: 'test-category',
        description: 'Test Description',
      };

      jest.spyOn(categoryRepository, 'findBySlug').mockResolvedValue(null);
      jest.spyOn(categoryRepository, 'create').mockResolvedValue(mockCategory);

      const result = await handler.execute(new CreateCategoryCommand(createDto));

      expect(categoryRepository.findBySlug).toHaveBeenCalledWith('test-category');
      expect(categoryRepository.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockCategory);
    });

    it('should throw error if category with slug already exists', async () => {
      const createDto = {
        name: 'Test Category',
        slug: 'test-category',
        description: 'Test Description',
      };

      jest.spyOn(categoryRepository, 'findBySlug').mockResolvedValue(mockCategory);

      await expect(
        handler.execute(new CreateCategoryCommand(createDto)),
      ).rejects.toThrow();
    });
  });
}); 