import { CommandHandler } from '@nestjs/cqrs'
import { Baas } from '../../../../infrastructure/baas/baas'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { WrongPinError } from '../../../../libs/ddd/domain/ports/baas.port'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { CardRepositoryPort } from '../../database/card/card.repository.port'
import { PinCode } from '../../domain/value-objects/pin-code.value-object'
import {
  CardPinAlreadySetError,
  CardPinFormatNotCorrectError,
  CardPinNotSetError,
} from '../../errors/card.errors'
import { ChangePinCommand } from './change-pin.command'

@CommandHandler(ChangePinCommand)
export class ChangePinCommandHandler extends CommandHandlerBase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    private readonly baas: Baas,
  ) {
    super(unitOfWork)
  }

  async handle(
    command: ChangePinCommand,
  ): Promise<
    Result<
      Boolean,
      CardPinAlreadySetError | CardPinFormatNotCorrectError | WrongPinError
    >
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

    if (!card.isPinSet) {
      return Result.err(
        new CardPinNotSetError(
          'Pin is not set. Use setPin to set a first pin code',
        ),
      )
    }
    try {
      new PinCode(command.newPin, command.confirmPin)
    } catch (e) {
      return Result.err(new CardPinFormatNotCorrectError(e))
    }
    // As we set a default pin at card creation
    // if user has not entered a pin yet we need to update it from the default one
    const result = await this.baas.changePin(
      card.externalId,
      command.newPin,
      command.confirmPin,
      command.currentPin,
    )
    if (result.isErr) {
      return Result.err(result.error)
    }
    await cardRepo.save(card)
    return Result.ok(true)
  }
}
