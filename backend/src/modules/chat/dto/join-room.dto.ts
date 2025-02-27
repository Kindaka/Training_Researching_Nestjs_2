import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class JoinRoomDto {
  @ApiProperty({
    description: 'ID of the room to join',
    example: '273a10bc-a385-4bd1-a180-cc7d87c81115'
  })
  @IsNotEmpty()
  @IsString()
  roomId: string;

  @ApiProperty({
    description: 'JWT token for user information',
    required: false
  })
  @IsOptional()
  @IsString()
  token?: string;
} 