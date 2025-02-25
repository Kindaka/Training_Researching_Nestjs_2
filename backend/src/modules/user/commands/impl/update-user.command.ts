import { UpdateUserDto } from '../../dtos/user.dto';
import { User } from '../../entities/user.entity';

export class UpdateUserCommand {
  constructor(
    public readonly id: number,
    public readonly updateUserDto: UpdateUserDto,
    public readonly currentUser: User,
  ) {}
} 