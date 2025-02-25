import { HttpException, HttpStatus } from '@nestjs/common';

export class CategoryNotFoundException extends HttpException {
  constructor(id: number) {
    super(`Category with id ${id} not found`, HttpStatus.NOT_FOUND);
  }
}

export class CategoryAlreadyExistsException extends HttpException {
  constructor(slug: string) {
    super(`Category with slug '${slug}' already exists`, HttpStatus.CONFLICT);
  }
}

export class InvalidCategoryDataException extends HttpException {
  constructor(errors: string[]) {
    super({
      status: HttpStatus.BAD_REQUEST,
      error: 'Invalid category data',
      messages: errors,
    }, HttpStatus.BAD_REQUEST);
  }
} 