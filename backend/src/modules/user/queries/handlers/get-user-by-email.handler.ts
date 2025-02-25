import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetUserByEmailQuery } from '../impl/get-user-by-email.query';
import { User } from '../../entities/user.entity';

@QueryHandler(GetUserByEmailQuery)
export class GetUserByEmailHandler implements IQueryHandler<GetUserByEmailQuery> {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async execute(query: GetUserByEmailQuery) {
    return this.userRepository.findOne({
      where: { email: query.email },
    });
  }
} 