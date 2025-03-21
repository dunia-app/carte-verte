import { CommandHandler } from '@nestjs/cqrs'
import { Baas } from '../../../../infrastructure/baas/baas'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { CardRepositoryPort } from '../../database/card/card.repository.port'
import { PinCode } from '../../domain/value-objects/pin-code.value-object'
import {
  CardPinFormatNotCorrectError,
  CardPinNotSetError,
} from '../../errors/card.errors'
import { ResetPinCommand } from './reset-pin.command'

@CommandHandler(ResetPinCommand)
export class ResetPinCommandHandler extends CommandHandlerBase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    private readonly baas: Baas,
  ) {
    super(unitOfWork)
  }

  async handle(
    command: ResetPinCommand,
  ): Promise<
    Result<Boolean, CardPinNotSetError | CardPinFormatNotCorrectError>
  > {
    /* Use a repository provided by UnitOfWork to include everything 
       (including changes caused by Domain Events) into one 
       atomic database transaction */
    const cardRepo: CardRepositoryPort = this.unitOfWork.getCardRepository(
      command.correlationId,
    )
    const card = await cardRepo.findCurrentOneByEmployeeIdOrThrow(
      command.employeeId,
    )
    try {
      const res = card.changePin(
        new PinCode(command.newPin, command.confirmPin),
      )
      if (res.isErr) {
        return Result.err(res.error)
      }
    } catch (e) {
      return Result.err(new CardPinFormatNotCorrectError(e))
    }
    // Just in case pin is locked we unlock it
    await this.baas.unlockPin(card.externalId)

    const result = await this.baas.setPin(
      card.externalId,
      command.newPin,
      command.confirmPin,
    )
    if (result.isErr) {
      return Result.err(result.error)
    }
    await cardRepo.save(card)
    return Result.ok(true)
  }
}
