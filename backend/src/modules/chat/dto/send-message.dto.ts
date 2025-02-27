import { IsNotEmpty, IsString, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({
    description: 'ID of the room',
    example: '273a10bc-a385-4bd1-a180-cc7d87c81115'
  })
  @IsNotEmpty()
  @IsString()
  roomId: string;

  @ApiProperty({
    description: 'Content of the message',
    example: 'Hello, how are you?',
    maxLength: 1000
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  message: string;

  @ApiProperty({
    description: 'JWT token for user information',
    required: false
  })
  @IsOptional()
  @IsString()
  token?: string;
} 