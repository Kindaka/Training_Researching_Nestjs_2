import { CreateCommentDto } from '../../dto/create-comment.dto';

export class CreateCommentCommand {
  constructor(
    public readonly createCommentDto: CreateCommentDto,
    public readonly userId: number,
  ) {}
} 