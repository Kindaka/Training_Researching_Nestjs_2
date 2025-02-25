import { IsEmail, IsNotEmpty, MinLength, IsString, Matches, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty({ example: 'test@gmail.com', description: 'Email of user' })
  @IsEmail({}, { message: 'Email is not valid' })
  @Transform(({ value }) => value.trim()) 
  email: string;

  @ApiProperty({ example: 'Nguyen Van A', description: 'Full name of user' })
  @IsNotEmpty({ message: 'Full name cannot be empty' })
  @IsString({ message: 'Full name must be a string' })
  fullName: string;

  @ApiProperty({ example: 'String123', description: 'Password (minimum 6 characters, uppercase, lowercase and number)' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{6,}$/, {
    message: 'Password must contain at least one uppercase, one lowercase and one number',
  })
  password: string;
}

export class LoginUserDto {
    @ApiProperty({ example: 'test@gmail.com', description: 'Email of user' })
    @IsEmail({}, { message: 'Email is not valid' })
    @Transform(({ value }) => value.trim()) 
    email: string;
  
    @ApiProperty({ example: 'String123', description: 'Password (minimum 6 characters, uppercase, lowercase and number)' })
    @IsNotEmpty()
    password: string;
  }