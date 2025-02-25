import { Test, TestingModule } from '@nestjs/testing';
import { TagService } from './tag.service';
import { CqrsModule } from '@nestjs/cqrs';

describe('TagService', () => {
  let service: TagService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [TagService],
    }).compile();

    service = module.get<TagService>(TagService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
