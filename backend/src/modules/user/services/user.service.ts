import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterUserDto, LoginUserDto } from '../dtos/auth.dto';
import { UpdateUserDto } from '../dtos/user.dto';
import { Permission } from '../../../core/helpers/check-permission.helper';
import { first } from 'rxjs';
import * as bcrypt from 'bcrypt';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { RegisterUserCommand } from '../commands/impl/register-user.command';
import { LoginUserCommand } from '../commands/impl/login-user.command';
import { UpdateUserCommand } from '../commands/impl/update-user.command';
import { DeleteUserCommand } from '../commands/impl/delete-user.command';
import { GetUsersQuery } from '../queries/impl/get-users.query';
import { GetUserQuery } from '../queries/impl/get-user.query';
import { GetUserByEmailQuery } from '../queries/impl/get-user-by-email.query';
import { Role } from '../../../core/enums/role.enum';
import { ForbiddenException } from '@nestjs/common';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async register(registerUserDto: RegisterUserDto) {
    return this.commandBus.execute(new RegisterUserCommand(registerUserDto));
  }

  async login(loginUserDto: LoginUserDto) {
    return this.commandBus.execute(new LoginUserCommand(loginUserDto));
  }

  async findAll() {
    return this.queryBus.execute(new GetUsersQuery());
  }

  async findOne(id: number, currentUser: User) {
    if (currentUser.id !== id && currentUser.role as Role !== Role.ADMIN) {
      throw new ForbiddenException('You do not have permission to view this user');
    }
    return this.queryBus.execute(new GetUserQuery(id));
  }

  create(user: RegisterUserDto) {
    const newUser = this.userRepository.create(user);
    return this.userRepository.save(newUser);
  }

  async update(id: number, updatedUser: UpdateUserDto, currentUser: User) {
    return this.commandBus.execute(
      new UpdateUserCommand(id, updatedUser, currentUser),
    );
  }

  async findByEmail(email: string) {
    return this.queryBus.execute(new GetUserByEmailQuery(email));
  }

  async remove(id: number, currentUser: User) {
    return this.commandBus.execute(new DeleteUserCommand(id, currentUser));
  }
}
