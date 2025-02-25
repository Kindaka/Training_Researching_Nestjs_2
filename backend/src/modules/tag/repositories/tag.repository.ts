import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from '../entities/tag.entity';
import { CreateTagDto } from '../dto/create-tag.dto';
import { UpdateTagDto } from '../dto/update-tag.dto';

@Injectable()
export class TagRepository {
  constructor(
    @InjectRepository(Tag)
    private readonly repository: Repository<Tag>,
  ) {}

  async findAll(page: number = 1, limit: number = 10): Promise<[Tag[], number]> {
    return this.repository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: number): Promise<Tag> {
    const tag = await this.repository.findOne({ where: { id } });
    if (!tag) {
      throw new NotFoundException(`Tag #${id} not found`);
    }
    return tag;
  }

  async findBySlug(slug: string): Promise<Tag> {
    return this.repository.findOne({ where: { slug } });
  }

  async create(createTagDto: CreateTagDto): Promise<Tag> {
    const tag = this.repository.create(createTagDto);
    return this.repository.save(tag);
  }

  async update(id: number, updateTagDto: UpdateTagDto): Promise<Tag> {
    const tag = await this.findById(id);
    Object.assign(tag, updateTagDto);
    return this.repository.save(tag);
  }

  async delete(id: number): Promise<void> {
    const tag = await this.findById(id);
    await this.repository.remove(tag);
  }
} 