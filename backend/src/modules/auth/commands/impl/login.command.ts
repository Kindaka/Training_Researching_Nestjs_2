import { LoginDto } from '../../dtos/auth.dto';

export class LoginCommand {
  constructor(public readonly loginDto: LoginDto) {}
} 