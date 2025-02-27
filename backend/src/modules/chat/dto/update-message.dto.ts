import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMessageDto {
  @ApiProperty({
    description: 'New content of the message',
    example: 'Updated message content',
    maxLength: 1000
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  content: string;
} 