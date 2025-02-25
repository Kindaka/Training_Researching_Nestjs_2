import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserCommand } from '../impl/update-user.command';
import { User } from '../../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Permission } from '../../../../core/helpers/check-permission.helper';

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async execute(command: UpdateUserCommand) {
    const { id, updateUserDto, currentUser } = command;

    // Không cho phép cập nhật role
    if (updateUserDto.role) {
      throw new BadRequestException('You are not allowed to update the role');
    }

    // Tìm user cần update
    let user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Kiểm tra quyền
    Permission.check(id, currentUser);

    // Update thông tin
    user = { ...user, ...updateUserDto };

    // Hash password nếu có thay đổi
    if (updateUserDto.password) {
      const hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
      user.password = hashedPassword;
    }

    // Lưu vào database
    const updatedUser = await this.userRepository.save(user);

    // Trả về thông tin đã update (không bao gồm password)
    return {
      id: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
    };
  }
} 