import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../entities/post.entity';
import { Category } from '../../category/entities/category.entity';
import { Tag } from '../../tag/entities/tag.entity';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';

@Injectable()
export class PostRepository {
  constructor(
    @InjectRepository(Post)
    private readonly repository: Repository<Post>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  async findAll(page: number = 1, limit: number = 10): Promise<[Post[], number]> {
    return this.repository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      relations: {
        author: true,
        categories: true,
        tags: true,
      },
      select: {
        author: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: number): Promise<Post> {
    return this.repository.findOne({
      where: { id },
      relations: {
        author: true,
        categories: true,
        tags: true,
      },
      select: {
        author: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    });
  }

  async findBySlug(slug: string): Promise<Post> {
    return this.repository.findOne({
      where: { slug },
      relations: ['author', 'categories', 'tags'],
    });
  }

  async create(createPostDto: CreatePostDto, userId: number): Promise<Post> {
    const post = this.repository.create({
      ...createPostDto,
      author: { id: userId },
      categories: createPostDto.categoryIds?.map(id => ({ id })),
      tags: createPostDto.tagIds?.map(id => ({ id })),
    });
    return this.repository.save(post);
  }

  async update(id: number, updatePostDto: UpdatePostDto): Promise<Post> {
    console.log('🔍 Repository - Update Start:', { id, updatePostDto });
    
    const post = await this.findById(id);
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    console.log('🔍 Repository - Found Post:', post);

    // Update basic fields
    const updatedPost = {
      ...post,
      ...updatePostDto,
    };
    delete updatedPost.categories;
    delete updatedPost.tags;
    
    // Update relations
    if (updatePostDto.categoryIds?.length > 0) {
      const categories = await this.categoryRepository.findByIds(updatePostDto.categoryIds);
      console.log('🔍 Repository - Found Categories:', categories);
      if (categories.length !== updatePostDto.categoryIds.length) {
        throw new BadRequestException('Some category IDs are invalid');
      }
      updatedPost.categories = categories;
    }
    
    if (updatePostDto.tagIds?.length > 0) {
      const tags = await this.tagRepository.findByIds(updatePostDto.tagIds);
      console.log('🔍 Repository - Found Tags:', tags);
      if (tags.length !== updatePostDto.tagIds.length) {
        throw new BadRequestException('Some tag IDs are invalid');
      }
      updatedPost.tags = tags;
    }

    try {
      const result = await this.repository.save(updatedPost);
      console.log('✅ Repository - Final Result:', result);
      return result;
    } catch (error) {
      console.error('❌ Repository - Update Error:', error);
      throw new InternalServerErrorException('Failed to update post');
    }
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
} 