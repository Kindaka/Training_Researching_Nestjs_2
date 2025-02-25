import { UpdateCommentDto } from '../../dto/update-comment.dto';

export class UpdateCommentCommand {
  constructor(
    public readonly id: number,
    public readonly updateCommentDto: UpdateCommentDto,
    public readonly userId: number,
  ) {}
} 