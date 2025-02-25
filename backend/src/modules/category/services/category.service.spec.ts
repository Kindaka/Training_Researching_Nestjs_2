import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CategoryService } from './category.service';
import { CreateCategoryCommand } from '../commands/impl/create-category.command';
import { UpdateCategoryCommand } from '../commands/impl/update-category.command';
import { DeleteCategoryCommand } from '../commands/impl/delete-category.command';
import { GetCategoriesQuery } from '../queries/impl/get-categories.query';
import { GetCategoryByIdQuery } from '../queries/impl/get-category-by-id.query';
import { Category } from '../entities/category.entity';

describe('CategoryService', () => {
  let service: CategoryService;
  let commandBus: CommandBus;
  let queryBus: QueryBus;

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
        CategoryService,
        {
          provide: CommandBus,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: QueryBus,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    commandBus = module.get<CommandBus>(CommandBus);
    queryBus = module.get<QueryBus>(QueryBus);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a category', async () => {
      const createDto = {
        name: 'Test Category',
        slug: 'test-category',
        description: 'Test Description',
      };

      jest.spyOn(commandBus, 'execute').mockResolvedValue(mockCategory);

      const result = await service.create(createDto);

      expect(commandBus.execute).toHaveBeenCalledWith(
        new CreateCategoryCommand(createDto),
      );
      expect(result).toEqual(mockCategory);
    });
  });

  describe('findAll', () => {
    it('should return an array of categories', async () => {
      const categories = [mockCategory];
      jest.spyOn(queryBus, 'execute').mockResolvedValue(categories);

      const result = await service.findAll();

      expect(queryBus.execute).toHaveBeenCalledWith(new GetCategoriesQuery());
      expect(result).toEqual(categories);
    });
  });

  describe('findOne', () => {
    it('should return a category by id', async () => {
      jest.spyOn(queryBus, 'execute').mockResolvedValue(mockCategory);

      const result = await service.findOne(1);

      expect(queryBus.execute).toHaveBeenCalledWith(new GetCategoryByIdQuery(1));
      expect(result).toEqual(mockCategory);
    });

    it('should return null when category not found', async () => {
      jest.spyOn(queryBus, 'execute').mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(queryBus.execute).toHaveBeenCalledWith(new GetCategoryByIdQuery(999));
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const updateDto = {
        name: 'Updated Category',
      };

      const updatedCategory = { ...mockCategory, ...updateDto };
      jest.spyOn(commandBus, 'execute').mockResolvedValue(updatedCategory);

      const result = await service.update(1, updateDto);

      expect(commandBus.execute).toHaveBeenCalledWith(
        new UpdateCategoryCommand(1, updateDto),
      );
      expect(result).toEqual(updatedCategory);
    });
  });

  describe('remove', () => {
    it('should remove a category', async () => {
      const response = { message: 'Category deleted successfully' };
      jest.spyOn(commandBus, 'execute').mockResolvedValue(response);

      const result = await service.remove(1);

      expect(commandBus.execute).toHaveBeenCalledWith(
        new DeleteCategoryCommand(1),
      );
      expect(result).toEqual(response);
    });
  });
});
