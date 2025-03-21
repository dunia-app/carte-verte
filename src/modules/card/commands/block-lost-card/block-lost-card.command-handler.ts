import { CommandHandler } from '@nestjs/cqrs'
import { Baas } from '../../../../infrastructure/baas/baas'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { BlockLostCardCommand } from './block-lost-card.command'
import { blockLostCard } from './block-lost-card.service'

@CommandHandler(BlockLostCardCommand)
export class BlockLostCardCommandHandler extends CommandHandlerBase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    private readonly baas: Baas,
  ) {
    super(unitOfWork)
  }

  async handle(command: BlockLostCardCommand) {
    return blockLostCard(command, this.unitOfWork, this.baas)
  }
}
