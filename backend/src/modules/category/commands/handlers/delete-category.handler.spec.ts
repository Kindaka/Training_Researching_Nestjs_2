import { Test, TestingModule } from '@nestjs/testing';
import { DeleteCategoryHandler } from './delete-category.handler';
import { CategoryRepository } from '../../repositories/category.repository';
import { DeleteCategoryCommand } from '../impl/delete-category.command';
import { NotFoundException } from '@nestjs/common';

describe('DeleteCategoryHandler', () => {
  let handler: DeleteCategoryHandler;
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
        DeleteCategoryHandler,
        {
          provide: CategoryRepository,
          useValue: {
            findById: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<DeleteCategoryHandler>(DeleteCategoryHandler);
    categoryRepository = module.get<CategoryRepository>(CategoryRepository);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should delete a category successfully', async () => {
      jest.spyOn(categoryRepository, 'findById').mockResolvedValue(mockCategory);
      jest.spyOn(categoryRepository, 'delete').mockResolvedValue(undefined);

      const result = await handler.execute(new DeleteCategoryCommand(1));

      expect(categoryRepository.findById).toHaveBeenCalledWith(1);
      expect(categoryRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: 'Category deleted successfully' });
    });

    it('should throw NotFoundException when category does not exist', async () => {
      jest.spyOn(categoryRepository, 'findById').mockResolvedValue(null);

      await expect(
        handler.execute(new DeleteCategoryCommand(999)),
      ).rejects.toThrow(NotFoundException);
    });
  });
}); 