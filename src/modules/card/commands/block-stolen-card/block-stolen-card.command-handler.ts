import { CommandHandler } from '@nestjs/cqrs'
import { Baas } from '../../../../infrastructure/baas/baas'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { BlockStolenCardCommand } from './block-stolen-card.command'
import { blockStolenCard } from './block-stolen-card.service'

@CommandHandler(BlockStolenCardCommand)
export class BlockStolenCardCommandHandler extends CommandHandlerBase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    private readonly baas: Baas,
  ) {
    super(unitOfWork)
  }

  async handle(command: BlockStolenCardCommand) {
    return blockStolenCard(command, this.unitOfWork, this.baas)
  }
}
