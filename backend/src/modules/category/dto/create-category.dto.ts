import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Name of category',
    example: 'Sport',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'URL of category',
    example: 'sport-category',
  })
  @IsString()
  slug: string;

  @ApiProperty({
    description: 'Description of category',
    example: 'Category about sport',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
} 