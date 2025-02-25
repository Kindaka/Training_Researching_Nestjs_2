import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetUsersQuery } from '../impl/get-users.query';
import { User } from '../../entities/user.entity';

@QueryHandler(GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<GetUsersQuery> {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async execute() {
    const users = await this.userRepository.find({
      select: ['id', 'email', 'fullName', 'role', 'createdAt', 'updatedAt'],
    });
    return users;
  }
} 