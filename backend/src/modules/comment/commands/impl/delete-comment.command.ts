export class DeleteCommentCommand {
  constructor(
    public readonly id: number,
    public readonly userId: number,
  ) {}
} 