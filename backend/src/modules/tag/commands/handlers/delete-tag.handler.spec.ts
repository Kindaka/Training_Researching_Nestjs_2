import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeleteTagHandler } from './delete-tag.handler';
import { TagRepository } from '../../repositories/tag.repository';
import { DeleteTagCommand } from '../impl/delete-tag.command';

describe('DeleteTagHandler', () => {
  let handler: DeleteTagHandler;
  let tagRepository: TagRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteTagHandler,
        {
          provide: TagRepository,
          useValue: {
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<DeleteTagHandler>(DeleteTagHandler);
    tagRepository = module.get<TagRepository>(TagRepository);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should delete a tag successfully', async () => {
      // Setup
      const deleteSpy = jest.spyOn(tagRepository, 'delete');
      deleteSpy.mockResolvedValue(undefined);

      // Execute
      const result = await handler.execute(new DeleteTagCommand(1));

      // Assert
      expect(deleteSpy).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: 'Tag deleted successfully' });
    });

    it('should throw NotFoundException when tag not found', async () => {
      // Setup
      const deleteSpy = jest.spyOn(tagRepository, 'delete');
      deleteSpy.mockRejectedValue(new NotFoundException('Tag not found'));

      // Execute & Assert
      await expect(handler.execute(new DeleteTagCommand(999))).rejects.toThrow(
        NotFoundException,
      );
      expect(deleteSpy).toHaveBeenCalledWith(999);
    });
  });
}); 