import { CommandHandler } from '@nestjs/cqrs'
import { Baas } from '../../../../infrastructure/baas/baas'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { LockStatus } from '../../domain/entities/card.types'
import { CardAlreadyBlockedError } from '../../errors/card.errors'
import { BlockDestroyedCardCommand } from './block-destroyed-card.command'
import { blockDestroyedCard } from './block-destroyed-card.service'

@CommandHandler(BlockDestroyedCardCommand)
export class BlockDestroyedCardCommandHandler extends CommandHandlerBase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    private readonly baas: Baas,
  ) {
    super(unitOfWork)
  }

  async handle(
    command: BlockDestroyedCardCommand,
  ): Promise<Result<LockStatus, CardAlreadyBlockedError>> {
    return blockDestroyedCard(command, this.unitOfWork, this.baas)
  }
}
