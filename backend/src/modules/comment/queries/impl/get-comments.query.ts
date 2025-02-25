export class GetCommentsQuery {
  constructor(
    public readonly postId: number,
    public readonly page: number = 1,
    public readonly limit: number = 10,
  ) {}
} 