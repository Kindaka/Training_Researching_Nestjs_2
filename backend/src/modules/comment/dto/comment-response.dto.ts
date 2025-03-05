import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

class UserDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;

  @ApiProperty({ example: 'John Doe' })
  fullName: string;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;
}

class PostDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Getting Started with TypeScript' })
  title: string;

  @Exclude()
  content: string;

  @Exclude()
  slug: string;

  @Exclude()
  published: boolean;

  @Exclude()
  viewCount: number;

  @Exclude()
  publishedAt: Date;

  @Exclude()
  image: string;

  @Exclude()
  video: string;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;
}

class ReplyDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'This is a reply' })
  content: string;

  @ApiProperty({ example: '2024-01-01' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01' })
  updatedAt: Date;

  @ApiProperty({ type: UserDto })
  @Type(() => UserDto)
  user: UserDto;
}

export class CommentResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'This is a comment' })
  content: string;

  @ApiProperty({ example: '2024-01-01' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01' })
  updatedAt: Date;

  @ApiProperty({ type: UserDto })
  @Type(() => UserDto)
  user: UserDto;

  @ApiProperty({ type: PostDto })
  @Type(() => PostDto)
  post: PostDto;

  @ApiProperty({ type: [ReplyDto] })
  @Type(() => ReplyDto)
  replies: ReplyDto[];
}