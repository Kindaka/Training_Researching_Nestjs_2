import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { User } from "../modules/user/entities/user.entity"
import { Post } from "../modules/post/entities/post.entity"
import { Category } from "../modules/category/entities/category.entity"
import { Tag } from "../modules/tag/entities/tag.entity"
import { Comment } from "../modules/comment/entities/comment.entity"
import { join } from 'path';

config();

const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  host: configService.get('DB_HOST'),
  port: configService.get('DB_PORT'),
  username: configService.get('DB_USER'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_NAME'),
  entities: [User, Post, Category, Tag, Comment],
  synchronize: configService.get('nodenv') === 'development',
  logging: configService.get('nodenv') === 'development',
  migrations: [join(__dirname, './migrations/*{.ts,.js}')],
  migrationsTableName: 'migrations',
});
