import { IsString, IsBoolean, IsOptional, IsArray, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ example: 'My First Post' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Content of the post' })
  @IsString()
  content: string;

  @ApiProperty({ example: 'my-first-post' })
  @IsString()
  slug: string;

  @ApiProperty({ example: false, default: false })
  @IsBoolean()
  @IsOptional()
  published?: boolean;

  @ApiProperty({ example: [1, 2], description: 'Category IDs' })
  @IsArray()
  @IsNumber({}, { each: true })
  categoryIds: number[];

  @ApiProperty({ example: [1, 2], description: 'Tag IDs' })
  @IsArray()
  @IsNumber({}, { each: true })
  tagIds: number[];
} 