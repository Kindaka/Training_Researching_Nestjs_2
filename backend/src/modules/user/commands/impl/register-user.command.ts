import { RegisterUserDto } from '../../dtos/auth.dto';

export class RegisterUserCommand {
  constructor(public readonly registerUserDto: RegisterUserDto) {}
} 