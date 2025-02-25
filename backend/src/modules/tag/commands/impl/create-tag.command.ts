import { CreateTagDto } from '../../dto/create-tag.dto';

export class CreateTagCommand {
  constructor(public readonly createTagDto: CreateTagDto) {}
} 