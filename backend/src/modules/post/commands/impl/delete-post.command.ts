export class DeletePostCommand {
  constructor(
    public readonly id: number,
    public readonly userId: number,
  ) {}
} 