import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTagDto {
  @ApiProperty({ example: 'Technology' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'technology' })
  @IsString()
  @IsNotEmpty()
  slug: string;
} 