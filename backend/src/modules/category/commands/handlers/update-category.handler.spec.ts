import { Test, TestingModule } from '@nestjs/testing';
import { UpdateCategoryHandler } from './update-category.handler';
import { CategoryRepository } from '../../repositories/category.repository';
import { UpdateCategoryCommand } from '../impl/update-category.command';
import { UpdateCategoryDto } from '../../dto/update-category.dto';
import { CategoryNotFoundException, CategoryAlreadyExistsException } from '../../../../common/exceptions/category.exception';

describe('UpdateCategoryHandler', () => {
  let handler: UpdateCategoryHandler;
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
        UpdateCategoryHandler,
        {
          provide: CategoryRepository,
          useValue: {
            findById: jest.fn(),
            findBySlug: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<UpdateCategoryHandler>(UpdateCategoryHandler);
    categoryRepository = module.get<CategoryRepository>(CategoryRepository);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should update a category successfully', async () => {
      const updateDto: UpdateCategoryDto = {
        name: 'Updated Category',
      };

      jest.spyOn(categoryRepository, 'findById').mockResolvedValue(mockCategory);
      jest.spyOn(categoryRepository, 'update').mockResolvedValue({
        ...mockCategory,
        ...updateDto,
      });

      const result = await handler.execute(
        new UpdateCategoryCommand(1, updateDto),
      );

      expect(categoryRepository.findById).toHaveBeenCalledWith(1);
      expect(categoryRepository.update).toHaveBeenCalledWith(1, updateDto);
      expect(result.name).toBe(updateDto.name);
    });

    it('should throw CategoryNotFoundException when category does not exist', async () => {
      const updateDto: UpdateCategoryDto = {
        name: 'Updated Category',
      };

      jest.spyOn(categoryRepository, 'findById').mockResolvedValue(null);

      await expect(
        handler.execute(new UpdateCategoryCommand(999, updateDto)),
      ).rejects.toThrow(CategoryNotFoundException);
    });

    it('should throw CategoryAlreadyExistsException when updating to existing slug', async () => {
      const updateDto: UpdateCategoryDto = {
        slug: 'existing-slug',
      };

      jest.spyOn(categoryRepository, 'findById').mockResolvedValue(mockCategory);
      jest.spyOn(categoryRepository, 'findBySlug').mockResolvedValue({
        ...mockCategory,
        id: 2,
        slug: 'existing-slug',
      });

      await expect(
        handler.execute(new UpdateCategoryCommand(1, updateDto)),
      ).rejects.toThrow(CategoryAlreadyExistsException);
    });
  });
}); 