import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeleteUserCommand } from '../impl/delete-user.command';
import { User } from '../../entities/user.entity';
import { Role } from '../../../../core/enums/role.enum';

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand> {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async execute(command: DeleteUserCommand) {
    const { id, currentUser } = command;

    // Tìm user cần xóa
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Kiểm tra quyền: chỉ admin hoặc chính user đó mới được xóa
    if (currentUser.id !== user.id && currentUser.role as Role !== Role.ADMIN) {
      throw new ForbiddenException('You do not have permission to delete this user');
    }

    // Xóa user
    await this.userRepository.remove(user);

    return { message: 'User deleted successfully' };
  }
} 