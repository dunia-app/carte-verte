import { CommandHandler } from '@nestjs/cqrs'
import { Baas } from '../../../../infrastructure/baas/baas'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ArgumentOutOfRangeException } from '../../../../libs/exceptions/index'
import { CardRepositoryPort } from '../../database/card/card.repository.port'
import { PinCode } from '../../domain/value-objects/pin-code.value-object'
import {
  CardPinAlreadySetError,
  CardPinFormatNotCorrectError,
} from '../../errors/card.errors'
import { SetPinCommand } from './set-pin.command'

@CommandHandler(SetPinCommand)
export class SetPinCommandHandler extends CommandHandlerBase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    private readonly baas: Baas,
  ) {
    super(unitOfWork)
  }

  async handle(
    command: SetPinCommand,
  ): Promise<
    Result<Boolean, CardPinAlreadySetError | CardPinFormatNotCorrectError>
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
      const res = card.setPin(new PinCode(command.newPin, command.confirmPin))
      if (res.isErr) {
        return Result.err(res.error)
      }
    } catch (e) {
      if (e instanceof ArgumentOutOfRangeException) {
        return Result.err(new CardPinFormatNotCorrectError(e))
      }
    }
    // As we set a default pin at card creation
    // if user has not entered a pin yet we need to update it from the default one
    const result = await this.baas.changePin(
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
