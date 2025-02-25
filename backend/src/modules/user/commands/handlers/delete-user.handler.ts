import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeleteUserCommand } from '../impl/delete-user.command';
import { User } from '../../entities/user.entity';
import { Permission } from '../../../../core/helpers/check-permission.helper';

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

    // Kiểm tra quyền
    Permission.check(id, currentUser);

    // Xóa user
    await this.userRepository.remove(user);

    return { message: 'Delete user successfully' };
  }
} 