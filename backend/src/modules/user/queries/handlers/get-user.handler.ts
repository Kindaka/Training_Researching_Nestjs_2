import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { GetUserQuery } from '../impl/get-user.query';
import { User } from '../../entities/user.entity';

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery> {
  constructor(
    @InjectRepository(User) // module User sử dụng Repository của TypeORM trực tiếp vào handler 
    // thông qua @InjectRepository thay vì phải tạo repository riêng chỉ giành cho việc xử lý logic đơn giản
    private userRepository: Repository<User>,
  ) {}

  async execute(query: GetUserQuery) {
    const user = await this.userRepository.findOne({
      where: { id: query.id },
      select: ['id', 'email', 'fullName', 'createdAt', 'updatedAt'],
    });

    if (!user) {
      throw new NotFoundException(`User #${query.id} not found`);
    }

    return user;
  }
} 