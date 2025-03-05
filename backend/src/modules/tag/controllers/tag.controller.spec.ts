import { Test, TestingModule } from '@nestjs/testing';
import { TagController } from './tag.controller';
import { TagService } from '../services/tag.service';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { RolesGuard } from '../../../core/guards/roles.guard';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../user/services/user.service';
import { ConfigService } from '@nestjs/config';

describe('TagController', () => {
  let controller: TagController;
  let tagService: TagService;

  const mockTagService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockJwtService = {
    verify: jest.fn(),
  };

  const mockUserService = {
    findById: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TagController],
      providers: [
        {
          provide: TagService,
          useValue: mockTagService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TagController>(TagController);
    tagService = module.get<TagService>(TagService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new tag', async () => {
      const createTagDto = { name: 'Test Tag', slug: 'test-tag' };
      const expectedResult = { id: 1, ...createTagDto };

      mockTagService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createTagDto);

      expect(tagService.create).toHaveBeenCalledWith(createTagDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return paginated tags', async () => {
      const page = 1;
      const limit = 10;
      const expectedResult = {
        items: [{ id: 1, name: 'Test Tag', slug: 'test-tag' }],
        meta: { total: 1, page, limit, totalPages: 1 },
      };

      mockTagService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(page, limit);

      expect(tagService.findAll).toHaveBeenCalledWith(page, limit);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a tag by id', async () => {
      const id = 1;
      const expectedResult = { id, name: 'Test Tag', slug: 'test-tag' };

      mockTagService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(id);

      expect(tagService.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should update a tag', async () => {
      const id = 1;
      const updateTagDto = { name: 'Updated Tag' };
      const expectedResult = { id, ...updateTagDto };

      mockTagService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(id, updateTagDto);

      expect(tagService.update).toHaveBeenCalledWith(id, updateTagDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should remove a tag', async () => {
      const id = 1;
      const expectedResult = { message: 'Tag deleted successfully' };

      mockTagService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(id);

      expect(tagService.remove).toHaveBeenCalledWith(id);
      expect(result).toEqual(expectedResult);
    });
  });
});
