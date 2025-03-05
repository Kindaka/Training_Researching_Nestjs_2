import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

class AuthorDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'admin@example.com' })
  email: string;

  @ApiProperty({ example: 'Admin User' })
  fullName: string;

  @ApiProperty({ example: 'ADMIN' })
  role: string;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;
}

class CategoryDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Technology' })
  name: string;

  @ApiProperty({ example: 'technology' })
  slug: string;

  @Exclude()
  description: string;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;
}

class TagDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'TypeScript' })
  name: string;

  @ApiProperty({ example: 'typescript' })
  slug: string;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;
}

export class PostResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Getting Started with TypeScript' })
  title: string;

  @ApiProperty({ example: 'TypeScript is a typed superset of JavaScript...' })
  content: string;

  @ApiProperty({ example: 'getting-started-with-typescript' })
  slug: string;

  @ApiProperty({ example: true })
  published: boolean;

  @ApiProperty({ example: 100 })
  viewCount: number;

  @ApiProperty({ example: '2025-02-27T04:08:31.139Z' })
  publishedAt: Date;

  @ApiProperty({ example: 'https://res.cloudinary.com/example/image.png' })
  image: string;

  @ApiProperty({ example: null })
  video: string;

  @ApiProperty({ type: AuthorDto })
  @Type(() => AuthorDto)
  author: AuthorDto;

  @ApiProperty({ type: [CategoryDto] })
  @Type(() => CategoryDto)
  categories: CategoryDto[];

  @ApiProperty({ type: [TagDto] })
  @Type(() => TagDto)
  tags: TagDto[];

  @ApiProperty({ example: '2025-02-26T21:08:31.142Z' })
  @Exclude()
  createdAt: Date;

  @ApiProperty({ example: '2025-02-27T20:23:56.305Z' })
  @Exclude()
  updatedAt: Date;
} 