import { CommandHandler } from '@nestjs/cqrs'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { UpdateCardDigitalizationCommand } from './update-card-digitalization.command'
import { updateCardDigitalization } from './update-card-digitalization.service'

@CommandHandler(UpdateCardDigitalizationCommand)
export class UpdateCardDigitalizationCommandHandler extends CommandHandlerBase {
  constructor(protected readonly unitOfWork: UnitOfWork) {
    super(unitOfWork)
  }

  async handle(command: UpdateCardDigitalizationCommand) {
    return updateCardDigitalization(command, this.unitOfWork)
  }
}
