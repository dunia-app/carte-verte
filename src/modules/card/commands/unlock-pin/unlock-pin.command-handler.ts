import { CommandHandler } from '@nestjs/cqrs'
import { Baas } from '../../../../infrastructure/baas/baas'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ExceptionBase } from '../../../../libs/exceptions/index'
import { CardRepositoryPort } from '../../database/card/card.repository.port'
import { UnlockPinCommand } from './unlock-pin.command'

@CommandHandler(UnlockPinCommand)
export class UnlockPinCommandHandler extends CommandHandlerBase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    private readonly baas: Baas,
  ) {
    super(unitOfWork)
  }

  async handle(
    command: UnlockPinCommand,
  ): Promise<Result<boolean, ExceptionBase>> {
    /* Use a repository provided by UnitOfWork to include everything 
       (including changes caused by Domain Events) into one 
       atomic database transaction */
    const cardRepo: CardRepositoryPort = this.unitOfWork.getCardRepository(
      command.correlationId,
    )
    const card = await cardRepo.findCurrentOneByEmployeeIdOrThrow(
      command.employeeId,
    )

    const res = await this.baas.unlockPin(card.externalId)
    if (res.isErr || res.value === false) {
      return Result.ok(false)
    }
    card.pinTryExceeded = false
    await cardRepo.save(card)

    return Result.ok(true)
  }
}
