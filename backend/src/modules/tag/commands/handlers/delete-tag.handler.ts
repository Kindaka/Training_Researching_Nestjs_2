import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteTagCommand } from '../impl/delete-tag.command';
import { TagRepository } from '../../repositories/tag.repository';

@CommandHandler(DeleteTagCommand)
export class DeleteTagHandler implements ICommandHandler<DeleteTagCommand> {
  constructor(private tagRepository: TagRepository) {}

  async execute(command: DeleteTagCommand) {
    await this.tagRepository.delete(command.id);
    return { message: 'Tag deleted successfully' };
  }
} 