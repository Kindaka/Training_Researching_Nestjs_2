export class GetTagsQuery {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 10,
  ) {}
} 