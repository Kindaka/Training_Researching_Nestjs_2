import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { CreatePostCommand } from '../commands/impl/create-post.command';
import { UpdatePostCommand } from '../commands/impl/update-post.command';
import { DeletePostCommand } from '../commands/impl/delete-post.command';
import { GetPostsQuery } from '../queries/impl/get-posts.query';
import { GetPostByIdQuery } from '../queries/impl/get-post-by-id.query';

@Injectable()
export class PostService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  create(createPostDto: CreatePostDto, userId: number) {
    return this.commandBus.execute(new CreatePostCommand(createPostDto, userId));
  }

  findAll(page: number = 1, limit: number = 10) {
    return this.queryBus.execute(new GetPostsQuery(page, limit));
  }

  findOne(id: number) {
    return this.queryBus.execute(new GetPostByIdQuery(id));
  }

  update(id: number, updatePostDto: UpdatePostDto, userId: number) {
    return this.commandBus.execute(new UpdatePostCommand(id, updatePostDto, userId));
  }

  remove(id: number, userId: number) {
    return this.commandBus.execute(new DeletePostCommand(id, userId));
  }
}
