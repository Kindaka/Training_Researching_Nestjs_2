import { ResetPasswordDto } from '../../dtos/auth.dto';

export class ResetPasswordCommand {
  constructor(public readonly resetPasswordDto: ResetPasswordDto) {}
} 