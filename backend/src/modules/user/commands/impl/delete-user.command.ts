import { User } from '../../entities/user.entity';

export class DeleteUserCommand {
  constructor(
    public readonly id: number,
    public readonly currentUser: User,
  ) {}
} 