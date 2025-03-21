import { CommandHandler } from '@nestjs/cqrs'
import { Baas } from '../../../../infrastructure/baas/baas'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { UserOrWalletNotFoundOrNotActiveError } from '../../../../libs/ddd/domain/ports/baas.port'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { CardAlreadyExistsError } from '../../errors/card.errors'
import { CreateVirtualCardCommand } from './create-virtual-card.command'
import { createVirtualCard } from './create-virtual-card.service'

@CommandHandler(CreateVirtualCardCommand)
export class CreateVirtualCardCommandHandler extends CommandHandlerBase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    private readonly baas: Baas,
  ) {
    super(unitOfWork)
  }

  async handle(
    command: CreateVirtualCardCommand,
  ): Promise<
    Result<UUID, CardAlreadyExistsError | UserOrWalletNotFoundOrNotActiveError>
  > {
    return createVirtualCard(command, this.unitOfWork, this.baas)
  }
}
