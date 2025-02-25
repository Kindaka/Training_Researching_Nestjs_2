import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { CreateCommentCommand } from '../commands/impl/create-comment.command';
import { UpdateCommentCommand } from '../commands/impl/update-comment.command';
import { DeleteCommentCommand } from '../commands/impl/delete-comment.command';
import { GetCommentsQuery } from '../queries/impl/get-comments.query';
import { GetCommentQuery } from '../queries/impl/get-comment.query';

@Injectable()
export class CommentService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  create(createCommentDto: CreateCommentDto, userId: number) {
    return this.commandBus.execute(new CreateCommentCommand(createCommentDto, userId));
  }

  findAll(postId: number, page: number = 1, limit: number = 10) {
    return this.queryBus.execute(new GetCommentsQuery(postId, page, limit));
  }

  findOne(id: number) {
    return this.queryBus.execute(new GetCommentQuery(id));
  }

  update(id: number, updateCommentDto: UpdateCommentDto, userId: number) {
    return this.commandBus.execute(new UpdateCommentCommand(id, updateCommentDto, userId));
  }

  remove(id: number, userId: number) {
    return this.commandBus.execute(new DeleteCommentCommand(id, userId));
  }
}
