import { ForgotPasswordDto } from '../../dtos/auth.dto';

export class ForgotPasswordCommand {
  constructor(public readonly forgotPasswordDto: ForgotPasswordDto) {}
} 