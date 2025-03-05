import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

export class CategoryResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Technology' })
  name: string;

  @ApiProperty({ example: 'technology' })
  slug: string;


  @ApiProperty({ example: 'Description of the category' })
  description: string;

  @ApiProperty({ example: '2024-01-01' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01' })
  updatedAt: Date;
}
