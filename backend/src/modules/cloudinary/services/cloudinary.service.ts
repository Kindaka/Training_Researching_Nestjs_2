import { Injectable, NotFoundException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import * as fs from 'fs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../../post/entities/post.entity';

@Injectable()
export class CloudinaryService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async uploadImage(file: Express.Multer.File, folder: string = 'posts'): Promise<any> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      // Convert buffer to stream
      const stream = Readable.from(file.buffer);
      stream.pipe(uploadStream);
    });
  }

  async uploadImageFromDisk(filePath: string, folder: string = 'posts'): Promise<any> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        filePath,
        {
          folder,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
    });
  }

  async uploadVideo(file: Express.Multer.File, folder: string = 'videos'): Promise<any> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'video',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      // Convert buffer to stream
      const stream = Readable.from(file.buffer);
      stream.pipe(uploadStream);
    });
  }

  async uploadVideoFromDisk(filePath: string, folder: string = 'videos'): Promise<any> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        filePath,
        {
          folder,
          resource_type: 'video',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
    });
  }

  async deleteFile(publicId: string): Promise<any> {
    return cloudinary.uploader.destroy(publicId);
  }

  // Phương thức để cập nhật post với URL ảnh mới
  async updatePostWithImage(postId: number, imageUrl: string): Promise<Post> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    
    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }
    
    post.image = imageUrl;
    return this.postRepository.save(post);
  }

  // Phương thức để cập nhật post với URL video mới
  async updatePostWithVideo(postId: number, videoUrl: string): Promise<Post> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    
    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }
    
    post.video = videoUrl;
    return this.postRepository.save(post);
  }

  // Phương thức để xóa liên kết ảnh khỏi post
  async removeImageFromPost(postId: number): Promise<Post> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    
    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }
    
    post.image = null;
    return this.postRepository.save(post);
  }

  // Phương thức để xóa liên kết video khỏi post
  async removeVideoFromPost(postId: number): Promise<Post> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    
    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }
    
    post.video = null;
    return this.postRepository.save(post);
  }
} 