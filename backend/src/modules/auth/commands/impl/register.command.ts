import { RegisterDto } from '../../dtos/auth.dto';

export class RegisterCommand {
  constructor(public readonly registerDto: RegisterDto) {}
} 