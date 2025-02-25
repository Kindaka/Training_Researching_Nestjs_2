import { LoginUserDto } from '../../dtos/auth.dto';

export class LoginUserCommand {
  constructor(public readonly loginUserDto: LoginUserDto) {}
} 