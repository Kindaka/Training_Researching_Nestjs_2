import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserCommand } from '../impl/update-user.command';
import { User } from '../../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Role } from '../../../../core/enums/role.enum';

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
      throw new BadRequestException('Role cannot be updated through this endpoint');
    }

    // Tìm user cần update
    let user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Kiểm tra quyền: chỉ admin hoặc chính user đó mới được update
    if (currentUser.id !== user.id && currentUser.role as Role !== Role.ADMIN) {
      throw new ForbiddenException('You do not have permission to update this user');
    }

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