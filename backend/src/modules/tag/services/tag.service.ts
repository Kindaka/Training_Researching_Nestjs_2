import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateTagDto } from '../dto/create-tag.dto';
import { UpdateTagDto } from '../dto/update-tag.dto';
import { CreateTagCommand } from '../commands/impl/create-tag.command';
import { UpdateTagCommand } from '../commands/impl/update-tag.command';
import { DeleteTagCommand } from '../commands/impl/delete-tag.command';
import { GetTagsQuery } from '../queries/impl/get-tags.query';
import { GetTagQuery } from '../queries/impl/get-tag.query';

@Injectable()
export class TagService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  create(createTagDto: CreateTagDto) {
    return this.commandBus.execute(new CreateTagCommand(createTagDto));
  }

  findAll(page: number = 1, limit: number = 10) {
    return this.queryBus.execute(new GetTagsQuery(page, limit));
  }

  findOne(id: number) {
    return this.queryBus.execute(new GetTagQuery(id));
  }

  update(id: number, updateTagDto: UpdateTagDto) {
    return this.commandBus.execute(new UpdateTagCommand(id, updateTagDto));
  }

  remove(id: number) {
    return this.commandBus.execute(new DeleteTagCommand(id));
  }
}
