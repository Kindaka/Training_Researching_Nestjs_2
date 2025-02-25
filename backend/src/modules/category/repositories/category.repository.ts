import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';

@Injectable()
export class CategoryRepository {
  constructor(
    @InjectRepository(Category)
    private readonly repository: Repository<Category>,
  ) {}

  async findAll(): Promise<Category[]> {
    return this.repository.find();
  }

  async findById(id: number): Promise<Category> {
    return this.repository.findOneBy({ id });
  }

  async create(data: Partial<Category>): Promise<Category> {
    const category = this.repository.create(data);
    return this.repository.save(category);
  }

  async update(id: number, data: Partial<Category>): Promise<Category> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async findBySlug(slug: string): Promise<Category> {
    return this.repository.findOne({ where: { slug } });
  }
}
