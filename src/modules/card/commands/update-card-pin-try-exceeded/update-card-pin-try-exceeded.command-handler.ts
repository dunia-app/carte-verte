import { CommandHandler } from '@nestjs/cqrs'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { UpdateCardPinTryExceededCommand } from './update-card-pin-try-exceeded.command'
import { updateCardPinTryExceeded } from './update-card-pin-try-exceeded.service'

@CommandHandler(UpdateCardPinTryExceededCommand)
export class UpdateCardPinTryExceededCommandHandler extends CommandHandlerBase {
  constructor(protected readonly unitOfWork: UnitOfWork) {
    super(unitOfWork)
  }

  async handle(command: UpdateCardPinTryExceededCommand) {
    return updateCardPinTryExceeded(command, this.unitOfWork)
  }
}
