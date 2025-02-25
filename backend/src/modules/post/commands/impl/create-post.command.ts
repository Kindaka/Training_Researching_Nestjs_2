import { CreatePostDto } from '../../dto/create-post.dto';

export class CreatePostCommand {
  constructor(
    public readonly createPostDto: CreatePostDto,
    public readonly userId: number,
  ) {}
} 